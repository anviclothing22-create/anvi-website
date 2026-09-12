-- ANVI Clothing — transactional RPCs v1 (orders, coupons, stock)
-- All money in INTEGER rupees. SECURITY DEFINER so checkout works under RLS.
-- Revoke anon execute where dangerous; grant to authenticated.

-- ---------- validate_coupon ----------
create or replace function public.validate_coupon(p_code text, p_subtotal_int int)
returns table (valid boolean, discount_int int, reason text, coupon_id uuid)
language plpgsql security definer set search_path = public as $$
declare v record; d int := 0;
begin
  if p_code is null or btrim(p_code) = '' then
    return query select false, 0, 'No code provided.'::text, null::uuid; return;
  end if;
  select * into v from public.coupons where upper(code) = upper(btrim(p_code)) limit 1;
  if not found then
    return query select false, 0, ('Code "'||upper(btrim(p_code))||'" is invalid.')::text, null::uuid; return;
  end if;
  if not v.is_active then return query select false, 0, 'Code has expired or is inactive.'::text, v.id; return; end if;
  if v.start_date is not null and CURRENT_DATE < v.start_date then return query select false, 0, 'Code is not yet active.'::text, v.id; return; end if;
  if v.end_date is not null and CURRENT_DATE > v.end_date then return query select false, 0, 'Code has expired.'::text, v.id; return; end if;
  if v.usage_limit is not null and v.used_count >= v.usage_limit then return query select false, 0, 'Code usage limit reached.'::text, v.id; return; end if;
  if p_subtotal_int < coalesce(v.min_order_amount_int,0) then
    return query select false, 0, ('Minimum order value of Rs '||v.min_order_amount_int||' required.')::text, v.id; return;
  end if;
  if auth.uid() is not null and exists (
    select 1 from public.coupon_redemptions r where r.coupon_id = v.id and r.profile_id = auth.uid()
    group by r.coupon_id having count(*) >= v.per_user_limit) then
    return query select false, 0, 'You have already used this code.'::text, v.id; return;
  end if;
  if v.discount_type = 'percentage' then
    d := round(p_subtotal_int * v.discount_value / 100.0)::int;
    if v.max_discount_amount_int is not null then d := least(d, v.max_discount_amount_int); end if;
  else
    d := least(v.discount_value, p_subtotal_int);
  end if;
  return query select true, d, 'OK'::text, v.id;
end $$;
revoke all on function public.validate_coupon(text, int) from public, anon;
grant execute on function public.validate_coupon(text, int) to authenticated, service_role;

-- ---------- decrement_stock / increment_stock ----------
create or replace function public.decrement_stock(items jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare item jsonb; pid uuid; qty int; cur int; failed jsonb := '[]'::jsonb;
begin
  for item in select * from jsonb_array_elements(items) loop
    pid := (item->>'product_id')::uuid;
    qty := greatest(1, coalesce((item->>'qty')::int, 1));
    select stock_quantity into cur from public.inventory where product_id = pid and variant_id is null for update;
    if not found then
      select coalesce(sum(stock_quantity),0) into cur from public.inventory where product_id = pid;
      if cur is null then failed := failed || jsonb_build_object('product_id', pid, 'reason', 'not_found'); continue; end if;
    end if;
    if cur < qty then
      failed := failed || jsonb_build_object('product_id', pid, 'reason', 'insufficient_stock', 'available', cur, 'requested', qty);
      continue;
    end if;
    update public.inventory set stock_quantity = stock_quantity - qty, updated_at = now()
    where product_id = pid and variant_id is null;
    if not found then
      update public.inventory set stock_quantity = stock_quantity - qty where product_id = pid;
    end if;
  end loop;
  return jsonb_build_object('ok', jsonb_array_length(failed) = 0, 'failures', failed);
end $$;
revoke all on function public.decrement_stock(jsonb) from public, anon, authenticated;
grant execute on function public.decrement_stock(jsonb) to service_role;

create or replace function public.increment_stock(items jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare item jsonb;
begin
  for item in select * from jsonb_array_elements(items) loop
    update public.inventory set stock_quantity = stock_quantity + greatest(1, coalesce((item->>'qty')::int,1)), updated_at = now()
    where product_id = (item->>'product_id')::uuid;
  end loop;
end $$;
revoke all on function public.increment_stock(jsonb) from public, anon, authenticated;
grant execute on function public.increment_stock(jsonb) to service_role;

-- ---------- create_order ----------
create or replace function public.create_order(
  p_items jsonb,
  p_address jsonb,
  p_delivery_method text,
  p_payment_method text,
  p_coupon_code text default null,
  p_idempotency_key text default null
) returns table (order_id uuid, order_number text, total_int int)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_sub int := 0; v_disc int := 0; v_ship int := 0; v_total int := 0;
  v_coupon record; it jsonb;
  v_price int; v_name text; v_img text; v_slug text; v_sku text; v_stock int;
  v_oid uuid; v_onum text; v_track text; v_paystatus payment_status; v_dlabel text; v_pid uuid; v_qty int;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;
  if p_delivery_method not in ('standard','express') then raise exception 'Bad delivery_method'; end if;
  if p_payment_method not in ('upi','card','netbanking','cod') then raise exception 'Bad payment_method'; end if;

  if p_idempotency_key is not null then
    select id, orders.order_number, orders.total_int into v_oid, v_onum, v_total from public.orders
     where idempotency_key = p_idempotency_key and profile_id = v_uid limit 1;
    if found then return query select v_oid, v_onum, v_total; return; end if;
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    v_pid := (it->>'product_id')::uuid;
    v_qty := greatest(1, coalesce((it->>'quantity')::int, (it->>'qty')::int, 1));
    select p.price_int, p.name, p.slug, p.sku into v_price, v_name, v_slug, v_sku
      from public.products p where p.id = v_pid;
    if not found then raise exception 'Product not found: %', v_pid; end if;
    select coalesce(sum(stock_quantity),0) into v_stock from public.inventory where product_id = v_pid;
    if v_stock < v_qty then raise exception 'Insufficient stock for % (only % left)', v_name, v_stock; end if;
    v_sub := v_sub + v_price * v_qty;
  end loop;

  if p_coupon_code is not null and btrim(p_coupon_code) <> '' then
    select * into v_coupon from public.coupons where upper(code)=upper(btrim(p_coupon_code)) limit 1;
    if found then
      if v_coupon.is_active and (v_coupon.end_date is null or CURRENT_DATE <= v_coupon.end_date)
         and v_sub >= coalesce(v_coupon.min_order_amount_int,0)
         and (v_coupon.usage_limit is null or v_coupon.used_count < v_coupon.usage_limit) then
        if v_coupon.discount_type='percentage' then
          v_disc := round(v_sub * v_coupon.discount_value/100.0)::int;
          if v_coupon.max_discount_amount_int is not null then v_disc := least(v_disc, v_coupon.max_discount_amount_int); end if;
        else v_disc := least(v_coupon.discount_value, v_sub); end if;
      else v_coupon := null; end if;
    end if;
  end if;

  if p_delivery_method = 'standard' then v_ship := case when v_sub >= 2500 or v_sub = 0 then 0 else 150 end;
  else v_ship := 250; end if;
  v_total := greatest(0, v_sub - v_disc + v_ship);

  v_onum := 'ANVI-' || floor(100000 + random()*900000)::text;
  v_track := 'BLU-' || floor(10000000 + random()*90000000)::text || 'IN';
  v_paystatus := case when p_payment_method='cod' then 'cod_pending'::payment_status else 'pending'::payment_status end;
  v_dlabel := case when p_delivery_method='standard' then 'Standard Insured Delivery' else 'Express Air Courier' end;

  insert into public.orders (order_number, profile_id, customer_name, customer_email, customer_phone,
    contact_handle, subtotal_int, discount_int, coupon_id, coupon_code, shipping_fee_int, total_int,
    payment_method, payment_status, order_status, delivery_method, courier, tracking_number,
    shipping_snapshot, idempotency_key)
  values (v_onum, v_uid,
    coalesce(p_address->>'name','Valued Patron'),
    nullif(p_address->>'email',''),
    coalesce(p_address->>'phone','+919994837459'),
    p_address->>'contact',
    v_sub, v_disc,
    case when v_coupon is not null then v_coupon.id else null end,
    case when v_coupon is not null then v_coupon.code else null end,
    v_ship, v_total,
    case p_payment_method when 'upi' then 'UPI (Instant Verification)' when 'card' then 'Credit / Debit Card'
      when 'netbanking' then 'Net Banking' else 'Cash on Delivery (Verified)' end,
    v_paystatus, 'in_studio_preparation', v_dlabel, 'BlueDart Express', v_track,
    p_address, p_idempotency_key)
  returning id into v_oid;

  for it in select * from jsonb_array_elements(p_items) loop
    v_pid := (it->>'product_id')::uuid;
    v_qty := greatest(1, coalesce((it->>'quantity')::int, (it->>'qty')::int, 1));
    select p.price_int, p.name, p.slug, p.sku into v_price, v_name, v_slug, v_sku
      from public.products p where p.id = v_pid;
    select pi.url into v_img from public.product_images pi where pi.product_id = v_pid order by pi.display_order limit 1;
    insert into public.order_items (order_id, product_id, product_name, sku, slug, image_url, size_label, unit_price_int, quantity, total_price_int)
    values (v_oid, v_pid, v_name, v_sku, coalesce(v_slug,''),
      coalesce(v_img,'/images/products/saree_ajrakh_1.jpg'),
      coalesce(it->>'size', it->>'size_label','Free Size'), v_price, v_qty, v_price * v_qty);
    update public.inventory set stock_quantity = stock_quantity - v_qty, updated_at = now() where product_id = v_pid;
  end loop;

  if v_coupon is not null then
    insert into public.coupon_redemptions (coupon_id, order_id, profile_id, discount_amount_int)
    values (v_coupon.id, v_oid, v_uid, v_disc);
    update public.coupons set used_count = used_count + 1, updated_at = now() where id = v_coupon.id;
  end if;

  insert into public.order_timeline (order_id, title, description, to_status, is_completed, event_at)
  values (v_oid, 'Order placed', 'Studio preparation started · '||v_dlabel||' · BlueDart '||v_track, 'in_studio_preparation', true, now());

  return query select v_oid, v_onum, v_total;
end $$;
revoke all on function public.create_order(jsonb, jsonb, text, text, text, text) from public, anon;
grant execute on function public.create_order(jsonb, jsonb, text, text, text, text) to authenticated, service_role;

-- ---------- update_order_status ----------
create or replace function public.update_order_status(p_order_id uuid, p_to text, p_note text default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_from text; allowed text[];
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  select order_status::text into v_from from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  allowed := case v_from
    when 'pending' then array['confirmed','cancelled']
    when 'confirmed' then array['in_studio_preparation','cancelled']
    when 'in_studio_preparation' then array['dispatched','cancelled']
    when 'dispatched' then array['shipped','delivered']
    when 'shipped' then array['delivered']
    else array[]::text[] end;
  if not (p_to = any(allowed)) then raise exception 'Illegal transition % to %', v_from, p_to; end if;
  update public.orders set order_status = p_to::order_status, updated_at = now() where id = p_order_id;
  insert into public.order_timeline (order_id, title, description, from_status, to_status, is_completed)
  values (p_order_id, 'Status: '||p_to, p_note, v_from, p_to, true);
  return true;
end $$;
revoke all on function public.update_order_status(uuid, text, text) from public, anon;
grant execute on function public.update_order_status(uuid, text, text) to authenticated, service_role;

-- ---------- dashboard views ----------
create or replace view public.revenue_by_day as
select date_trunc('day', created_at)::date as day,
  sum(total_int) filter (where channel='Online Store')::bigint as online,
  sum(total_int) filter (where channel<>'Online Store')::bigint as offline,
  sum(total_int)::bigint as total, count(*)::int as orders
from public.orders where order_status <> 'cancelled'
  and created_at >= now() - interval '90 days'
group by 1 order by 1;

create or replace view public.top_products as
select p.id, p.name, p.sku,
  (select pi.url from public.product_images pi where pi.product_id = p.id order by pi.display_order limit 1) as image,
  sum(oi.quantity)::int as units, sum(oi.total_price_int)::bigint as revenue
from public.order_items oi join public.products p on p.id=oi.product_id
join public.orders o on o.id=oi.order_id and o.order_status<>'cancelled'
group by p.id,p.name,p.sku order by revenue desc limit 10;

create or replace view public.coupon_usage_counts as
select c.*, coalesce(r.cnt,0)::int as usage_count
from public.coupons c left join (select coupon_id, count(*) cnt from public.coupon_redemptions group by 1) r
  on r.coupon_id=c.id;

-- ---------- realtime ----------
do $$ begin
  alter publication supabase_realtime add table public.products, public.hero_banners, public.announcements, public.blog_posts, public.instagram_posts, public.promo_popups, public.site_config, public.orders;
exception when duplicate_object then null; end $$;
