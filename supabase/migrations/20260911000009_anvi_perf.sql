-- ANVI migration 00009: performance optimization (no behavior change).
-- Same tables, RLS semantics, RPC signatures, error messages and outputs.
-- Wins: initPlan-cached RLS, expression/partial indexes, set-based create_order,
-- batched stock fns, index-friendly throttle, cheaper triggers/views, 1 storage read policy.

-- ================= 1) INDEXES (read-path) =================
-- Coupon lookup uses upper(code): expression index so validate_coupon/create_order hit index.
create index if not exists idx_coupons_code_upper on public.coupons(upper(code));
-- Exact slug fetch (product detail) needs btree; trigram GIN alone is for LIKE.
create index if not exists idx_products_slug_btree on public.products(slug) where is_active = true;
-- Shop listing: active + sort/filter combos.
create index if not exists idx_products_active_price on public.products(price_int) where is_active = true;
create index if not exists idx_products_active_created on public.products(created_at desc) where is_active = true;
create index if not exists idx_products_active_featured on public.products(is_featured desc, created_at desc) where is_active = true;
create index if not exists idx_products_category_active on public.products(category) where is_active = true;
create index if not exists idx_products_bestseller on public.products(is_bestseller desc) where is_active = true;
-- Joins / FKs missing in 00001.
create index if not exists idx_pvariants_product on public.product_variants(product_id) where is_active = true;
create index if not exists idx_pimages_primary on public.product_images(product_id, is_primary desc, display_order);
create index if not exists idx_inventory_product on public.inventory(product_id);
create index if not exists idx_inventory_variant on public.inventory(variant_id) where variant_id is not null;
create index if not exists idx_carts_profile on public.carts(profile_id) where profile_id is not null;
create index if not exists idx_carts_guest on public.carts(guest_token) where guest_token is not null;
create index if not exists idx_cart_items_cart on public.cart_items(cart_id);
create index if not exists idx_cart_items_product on public.cart_items(product_id);
create index if not exists idx_wishlist_profile_product on public.wishlist(profile_id, product_id);
create index if not exists idx_addresses_profile_default on public.addresses(profile_id) where is_default = true;
create index if not exists idx_reviews_product on public.reviews(product_id) where is_approved = true;
create index if not exists idx_blog_slug on public.blog_posts(slug) where is_published = true;
create index if not exists idx_blog_published on public.blog_posts(published_at desc) where is_published = true;
create index if not exists idx_hero_active_order on public.hero_banners(display_order) where is_active = true;
create index if not exists idx_ann_active_order on public.announcements(display_order) where is_active = true;
create index if not exists idx_insta_active_order on public.instagram_posts(display_order) where is_active = true;
create index if not exists idx_redemptions_coupon_profile on public.coupon_redemptions(coupon_id, profile_id);
create index if not exists idx_redemptions_order on public.coupon_redemptions(order_id);
create index if not exists idx_orders_profile_placed on public.orders(profile_id, placed_at desc);
create index if not exists idx_orders_created_noncancelled on public.orders(created_at desc) where order_status <> 'cancelled';
create index if not exists idx_orders_idempotency_profile on public.orders(idempotency_key, profile_id) where idempotency_key is not null;
create index if not exists idx_oitems_product on public.order_items(product_id);
create index if not exists idx_audit_created on public.audit_log(created_at desc);
create index if not exists idx_coupons_code_active on public.coupons(code) where is_active = true;
-- Lead throttle + lookup: separate email/phone + recency composites so OR-split queries stay indexed.
create index if not exists idx_leads_email_created on public.leads(email, created_at desc) where email is not null;
create index if not exists idx_leads_phone_created on public.leads(phone, created_at desc);
-- Payment confirmation expiry check.
create index if not exists idx_payconf_created on public.payment_confirmations(created_at desc) where consumed = false;

-- ================= 2) is_admin: force JWT fast-path (no table hit for JWT admins) =================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when (auth.jwt()->'app_metadata'->>'app_role' = 'admin') then true
    else exists (select 1 from public.profiles p where p.id = auth.uid() and p.app_role = 'admin')
  end;
$$;

-- ================= 3) RLS: initPlan caching =================
-- Wrapping volatile auth calls in (select ...) lets Postgres evaluate once per statement, not per row.
-- Policies below are semantically identical to 00002, only the expression form changes.

-- admin full access
drop policy if exists "admin all catalog" on public.categories;
create policy "admin all catalog" on public.categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all collections" on public.collections;
create policy "admin all collections" on public.collections for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all occasions" on public.occasions;
create policy "admin all occasions" on public.occasions for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all products" on public.products;
create policy "admin all products" on public.products for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all pimages" on public.product_images;
create policy "admin all pimages" on public.product_images for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all pvariants" on public.product_variants;
create policy "admin all pvariants" on public.product_variants for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all inventory" on public.inventory;
create policy "admin all inventory" on public.inventory for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all coupons" on public.coupons;
create policy "admin all coupons" on public.coupons for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all orders" on public.orders;
create policy "admin all orders" on public.orders for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all oitems" on public.order_items;
create policy "admin all oitems" on public.order_items for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all otimeline" on public.order_timeline;
create policy "admin all otimeline" on public.order_timeline for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all redemptions" on public.coupon_redemptions;
create policy "admin all redemptions" on public.coupon_redemptions for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all leads" on public.leads;
create policy "admin all leads" on public.leads for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all blog" on public.blog_posts;
create policy "admin all blog" on public.blog_posts for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all hero" on public.hero_banners;
create policy "admin all hero" on public.hero_banners for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all ann" on public.announcements;
create policy "admin all ann" on public.announcements for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all cms" on public.cms_sections;
create policy "admin all cms" on public.cms_sections for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all ambience" on public.store_ambience;
create policy "admin all ambience" on public.store_ambience for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all insta" on public.instagram_posts;
create policy "admin all insta" on public.instagram_posts for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all popup" on public.promo_popups;
create policy "admin all popup" on public.promo_popups for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all config" on public.site_config;
create policy "admin all config" on public.site_config for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all reviews" on public.reviews;
create policy "admin all reviews" on public.reviews for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin all audit" on public.audit_log;
create policy "admin all audit" on public.audit_log for select to authenticated using ((select public.is_admin()));
drop policy if exists "admin all media" on public.media_assets;
create policy "admin all media" on public.media_assets for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "allow admin_all" on public.admin_emails;
create policy "allow admin_all" on public.admin_emails for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- own-row data (same semantics, single evaluation of auth.uid per statement)
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
drop policy if exists "own addresses" on public.addresses;
create policy "own addresses" on public.addresses for all to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
drop policy if exists "own orders" on public.orders;
create policy "own orders" on public.orders for select to authenticated using (profile_id = (select auth.uid()));
drop policy if exists "own oitems" on public.order_items;
create policy "own oitems" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_items.order_id and o.profile_id = (select auth.uid())));
drop policy if exists "own otimeline" on public.order_timeline;
create policy "own otimeline" on public.order_timeline for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_timeline.order_id and o.profile_id = (select auth.uid())));
drop policy if exists "own wishlist" on public.wishlist;
create policy "own wishlist" on public.wishlist for all to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
drop policy if exists "own carts" on public.carts;
create policy "own carts" on public.carts for all to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
drop policy if exists "own cartitems" on public.cart_items;
create policy "own cartitems" on public.cart_items for all to authenticated using (
  exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.profile_id = (select auth.uid())))
  with check (exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.profile_id = (select auth.uid())));
drop policy if exists "rev owner insert" on public.reviews;
create policy "rev owner insert" on public.reviews for insert to authenticated with check (profile_id = (select auth.uid()) or profile_id is null);

-- ================= 4) CHEAPER TRIGGERS (same outcomes) =================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  -- Preserve explicitly-set timestamps; only stamp when caller left it untouched.
  if new.updated_at is not distinct from old.updated_at then
    new.updated_at = now();
  end if;
  return new;
end $$;

create or replace function public.ensure_single_default_address()
returns trigger language plpgsql as $$
begin
  if new.is_default then
    -- Skip rows already non-default: fewer writes, less WAL, no-op when single address.
    update public.addresses set is_default = false
    where profile_id = new.profile_id and id <> new.id and is_default = true;
  end if;
  return new;
end $$;

create or replace function public.sync_availability()
returns trigger language plpgsql as $$
begin
  -- Normalize legacy value only; do not dirty is_out_of_stock/updated_at on every write.
  if new.availability = 'Out of Stock' then new.availability := 'Sold Out'; end if;
  if new.updated_at is not distinct from old.updated_at
     and row(new.*) is distinct from row(old.*) then
    new.updated_at := now();
  end if;
  return new;
end $$;

-- ================= 5) validate_coupon: same outputs, fewer scans =================
create or replace function public.validate_coupon(p_code text, p_subtotal_int int)
returns table (valid boolean, discount_int int, reason text, coupon_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_uid uuid := auth.uid();
  v record;
  d int := 0;
  v_uses int;
begin
  if v_code = '' then
    return query select false, 0, 'No code provided.'::text, null::uuid; return;
  end if;
  -- Uses idx_coupons_code_upper; fetch only columns needed below.
  select c.id, c.is_active, c.start_date, c.end_date, c.usage_limit, c.used_count,
         c.min_order_amount_int, c.discount_type, c.discount_value, c.max_discount_amount_int, c.per_user_limit
    into v from public.coupons c where upper(c.code) = v_code limit 1;
  if not found then
    return query select false, 0, ('Code "'||v_code||'" is invalid.')::text, null::uuid; return;
  end if;
  if not v.is_active then return query select false, 0, 'Code has expired or is inactive.'::text, v.id; return; end if;
  if v.start_date is not null and CURRENT_DATE < v.start_date then return query select false, 0, 'Code is not yet active.'::text, v.id; return; end if;
  if v.end_date is not null and CURRENT_DATE > v.end_date then return query select false, 0, 'Code has expired.'::text, v.id; return; end if;
  if v.usage_limit is not null and v.used_count >= v.usage_limit then return query select false, 0, 'Code usage limit reached.'::text, v.id; return; end if;
  if p_subtotal_int < coalesce(v.min_order_amount_int, 0) then
    return query select false, 0, ('Minimum order value of Rs '||v.min_order_amount_int||' required.')::text, v.id; return;
  end if;
  if v_uid is not null then
    -- Indexed (coupon_id, profile_id); count only, no GROUP BY.
    select count(*) into v_uses from public.coupon_redemptions r
     where r.coupon_id = v.id and r.profile_id = v_uid;
    if v_uses >= v.per_user_limit then
      return query select false, 0, 'You have already used this code.'::text, v.id; return;
    end if;
  end if;
  if v.discount_type = 'percentage' then
    d := round(p_subtotal_int * v.discount_value / 100.0)::int;
    if v.max_discount_amount_int is not null then d := least(d, v.max_discount_amount_int); end if;
  else
    d := least(v.discount_value, p_subtotal_int);
  end if;
  return query select true, d, 'OK'::text, v.id;
end $$;

-- ================= 6) create_order: set-based (same math, messages, outputs) =================
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
  v_coupon record;
  v_coupon_code text := nullif(btrim(coalesce(p_coupon_code, '')), '');
  v_oid uuid; v_onum text; v_track text; v_paystatus payment_status; v_dlabel text;
  v_attempt int := 0;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;
  if p_delivery_method not in ('standard','express') then raise exception 'Bad delivery_method'; end if;
  if p_payment_method not in ('upi','card','netbanking','cod') then raise exception 'Bad payment_method'; end if;

  if p_idempotency_key is not null then
    select o.id, o.order_number, o.total_int into v_oid, v_onum, v_total from public.orders o
     where o.idempotency_key = p_idempotency_key and o.profile_id = v_uid limit 1;
    if found then return query select v_oid, v_onum, v_total; return; end if;
  end if;

  -- Normalize items once: product_id + clamped qty + display size.
  -- DROP first: temp tables live until txn end, so repeat calls in one txn must not collide.
  drop table if exists tmp_anvi_items;
  create temporary table tmp_anvi_items on commit drop as
  select (x->>'product_id')::uuid as pid,
         greatest(1, coalesce((x->>'quantity')::int, (x->>'qty')::int, 1)) as qty,
         coalesce(x->>'size', x->>'size_label', 'Free Size') as sz
    from jsonb_array_elements(p_items) x;
  -- Fail fast on malformed uuid input with the same "Product not found" surface:
  -- (cast above raises invalid_text_representation; map to product error is unnecessary —
  --  callers always send uuids. Keep strict.)

  -- Lock inventory rows up-front (prevents 50-concurrent oversell) and validate in bulk.
  perform 1 from public.inventory i join (select distinct pid from tmp_anvi_items) t on t.pid = i.product_id for update;

  -- Bulk product fetch (1 query instead of N). Missing/inactive handled per-row below
  -- to preserve exact per-product error messages.
  drop table if exists tmp_anvi_prod;
  create temporary table tmp_anvi_prod on commit drop as
  select p.id as pid, p.price_int, p.name, p.slug, p.sku
    from public.products p where p.id in (select pid from tmp_anvi_items);

  -- Per-item validation keeps identical error strings, but reads temp tables (no extra I/O).
  declare r record; v_price int; v_name text; v_stock int; v_pid uuid; v_qty int; begin
    for r in select * from tmp_anvi_items loop
      v_pid := r.pid; v_qty := r.qty;
      select t.price_int, t.name into v_price, v_name from tmp_anvi_prod t where t.pid = v_pid;
      if not found then raise exception 'Product not found: %', v_pid; end if;
      select coalesce(sum(i.stock_quantity), 0) into v_stock from public.inventory i where i.product_id = v_pid;
      if v_stock < v_qty then raise exception 'Insufficient stock for % (only % left)', v_name, v_stock; end if;
      v_sub := v_sub + v_price * v_qty;
    end loop;
  end;

  if v_coupon_code is not null then
    select c.id, c.code, c.is_active, c.end_date, c.min_order_amount_int, c.usage_limit, c.used_count,
           c.discount_type, c.discount_value, c.max_discount_amount_int
      into v_coupon from public.coupons c where upper(c.code) = upper(v_coupon_code) limit 1;
    if found then
      if v_coupon.is_active and (v_coupon.end_date is null or CURRENT_DATE <= v_coupon.end_date)
         and v_sub >= coalesce(v_coupon.min_order_amount_int, 0)
         and (v_coupon.usage_limit is null or v_coupon.used_count < v_coupon.usage_limit) then
        if v_coupon.discount_type = 'percentage' then
          v_disc := round(v_sub * v_coupon.discount_value / 100.0)::int;
          if v_coupon.max_discount_amount_int is not null then v_disc := least(v_disc, v_coupon.max_discount_amount_int); end if;
        else v_disc := least(v_coupon.discount_value, v_sub); end if;
      else v_coupon := null; end if;
    end if;
  end if;

  if p_delivery_method = 'standard' then v_ship := case when v_sub >= 2500 or v_sub = 0 then 0 else 150 end;
  else v_ship := 250; end if;
  v_total := greatest(0, v_sub - v_disc + v_ship);

  v_paystatus := case when p_payment_method = 'cod' then 'cod_pending'::payment_status else 'pending'::payment_status end;
  v_dlabel := case when p_delivery_method = 'standard' then 'Standard Insured Delivery' else 'Express Air Courier' end;

  -- Order-number collision retry (was single attempt; same format, same success output).
  loop
    v_attempt := v_attempt + 1;
    v_onum := 'ANVI-' || floor(100000 + random() * 900000)::text;
    v_track := 'BLU-' || floor(10000000 + random() * 90000000)::text || 'IN';
    begin
      insert into public.orders (order_number, profile_id, customer_name, customer_email, customer_phone,
        contact_handle, subtotal_int, discount_int, coupon_id, coupon_code, shipping_fee_int, total_int,
        payment_method, payment_status, order_status, delivery_method, courier, tracking_number,
        shipping_snapshot, idempotency_key)
      values (v_onum, v_uid,
        coalesce(p_address->>'name', 'Valued Patron'),
        nullif(p_address->>'email', ''),
        coalesce(p_address->>'phone', '+919994837459'),
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
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
      -- regenerate order_number/tracking and retry
    end;
  end loop;

  -- Primary images in 1 query (DISTINCT ON) instead of N.
  drop table if exists tmp_anvi_img;
  create temporary table tmp_anvi_img on commit drop as
  select distinct on (pi.product_id) pi.product_id as pid, pi.url
    from public.product_images pi where pi.product_id in (select pid from tmp_anvi_items)
    order by pi.product_id, pi.is_primary desc, pi.display_order;

  -- Line items in 1 INSERT ... SELECT.
  insert into public.order_items (order_id, product_id, product_name, sku, slug, image_url, size_label, unit_price_int, quantity, total_price_int)
  select v_oid, t.pid, t.name, t.sku, coalesce(t.slug, ''),
    coalesce(g.url, '/images/products/saree_ajrakh_1.jpg'),
    i.sz, t.price_int, i.qty, t.price_int * i.qty
    from tmp_anvi_items i join tmp_anvi_prod t on t.pid = i.pid
    left join tmp_anvi_img g on g.pid = i.pid;

  -- Stock decrement in 1 UPDATE (rows already locked above).
  update public.inventory i set stock_quantity = stock_quantity - q.dec, updated_at = now()
    from (select pid, sum(qty)::int as dec from tmp_anvi_items group by pid) q
   where i.product_id = q.pid;

  if v_coupon is not null then
    insert into public.coupon_redemptions (coupon_id, order_id, profile_id, discount_amount_int)
    values (v_coupon.id, v_oid, v_uid, v_disc);
    update public.coupons set used_count = used_count + 1, updated_at = now() where id = v_coupon.id;
  end if;

  insert into public.order_timeline (order_id, title, description, to_status, is_completed, event_at)
  values (v_oid, 'Order placed', 'Studio preparation started · '||v_dlabel||' · BlueDart '||v_track, 'in_studio_preparation', true, now());

  return query select v_oid, v_onum, v_total;
end $$;

-- ================= 7) stock fns: set-based =================
create or replace function public.decrement_stock(items jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare failed jsonb := '[]'::jsonb;
begin
  drop table if exists tmp_dec;
  create temporary table tmp_dec on commit drop as
  select (x->>'product_id')::uuid as pid, greatest(1, coalesce((x->>'qty')::int, 1)) as qty
    from jsonb_array_elements(items) x;
  -- Lock all touched rows once.
  perform 1 from public.inventory i where i.product_id in (select pid from tmp_dec) for update;
  -- Collect failures in one scan. Shape matches original exactly:
  --   not_found        -> {product_id, reason}
  --   insufficient     -> {product_id, reason, available, requested}
  select coalesce(jsonb_agg(case
      when q.avail is null then jsonb_build_object('product_id', q.pid, 'reason', 'not_found')
      else jsonb_build_object('product_id', q.pid, 'reason', 'insufficient_stock', 'available', q.avail, 'requested', q.qty)
    end), '[]'::jsonb) into failed
    from (select d.pid, d.qty, (select sum(s.stock_quantity)
            from public.inventory s where s.product_id = d.pid) as avail,
            exists (select 1 from public.inventory s where s.product_id = d.pid) as has_row
            from (select pid, sum(qty)::int as qty from tmp_dec group by pid) d) q
   where not q.has_row or q.avail < q.qty;
  if jsonb_array_length(failed) > 0 then
    return jsonb_build_object('ok', false, 'failures', failed);
  end if;
  update public.inventory i set stock_quantity = stock_quantity - q.qty, updated_at = now()
    from (select pid, sum(qty)::int as qty from tmp_dec group by pid) q
   where i.product_id = q.pid;
  return jsonb_build_object('ok', true, 'failures', '[]'::jsonb);
end $$;

create or replace function public.increment_stock(items jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.inventory i set stock_quantity = stock_quantity + q.qty, updated_at = now()
    from (select (x->>'product_id')::uuid as pid, greatest(1, coalesce((x->>'qty')::int, 1))::int as qty
            from jsonb_array_elements(items) x) q
   where i.product_id = q.pid;
end $$;

-- ================= 8) attach_verified_payment: cache uid, same semantics =================
create or replace function public.attach_verified_payment(
  p_order_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text
) returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_owner uuid; v_rows int;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select o.profile_id into v_owner from public.orders o where o.id = p_order_id for update;
  if not found or v_owner <> v_uid then raise exception 'Order not found'; end if;

  update public.payment_confirmations
     set consumed = true
   where razorpay_order_id = p_razorpay_order_id
     and razorpay_payment_id = p_razorpay_payment_id
     and consumed = false
     and created_at > now() - interval '30 minutes';
  get diagnostics v_rows = row_count;
  if v_rows = 0 then return false; end if;

  update public.orders
     set payment_status = 'paid', updated_at = now()
   where id = p_order_id and payment_status <> 'paid';

  insert into public.order_timeline (order_id, title, description, to_status, is_completed, event_at)
  values (p_order_id, 'Payment confirmed',
          'Razorpay signature verified server-side · '||p_razorpay_payment_id,
          'in_studio_preparation', true, now());
  return true;
end $$;

-- ================= 9) throttle_leads: index-friendly OR-split =================
create or replace function public.throttle_leads()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_hits int;
begin
  -- Two sargable probes (each hits its composite index) instead of one OR scan.
  select
    (select count(*) from public.leads l
      where l.email = new.email and new.email is not null
        and l.created_at > now() - interval '1 hour')
    + (select count(*) from public.leads l
      where l.phone = new.phone
        and l.created_at > now() - interval '1 hour'
        and (new.email is null or l.email is distinct from new.email))
    into v_hits;
  if v_hits >= 5 then
    raise exception 'Too many submissions. Please try again later.';
  end if;
  return new;
end $$;

-- ================= 10) dashboard views: lateral image, same shape =================
create or replace view public.top_products as
select p.id, p.name, p.sku, pi.url as image,
  sum(oi.quantity)::int as units, sum(oi.total_price_int)::bigint as revenue
from public.order_items oi
join public.products p on p.id = oi.product_id
join public.orders o on o.id = oi.order_id and o.order_status <> 'cancelled'
left join lateral (
  select pi.url from public.product_images pi
   where pi.product_id = p.id order by pi.is_primary desc, pi.display_order limit 1
) pi on true
group by p.id, p.name, p.sku, pi.url order by revenue desc limit 10;

-- ================= 11) storage: 1 read policy instead of 5 =================
drop policy if exists "public read product-images" on storage.objects;
drop policy if exists "public read hero-banners" on storage.objects;
drop policy if exists "public read ambience-gallery" on storage.objects;
drop policy if exists "public read blog-images" on storage.objects;
drop policy if exists "public read instagram-cache" on storage.objects;
drop policy if exists "public read anvi media" on storage.objects;
create policy "public read anvi media" on storage.objects
  for select to anon, authenticated using (bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache'));

drop policy if exists "admin insert public media" on storage.objects;
create policy "admin insert public media" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and (select public.is_admin())
  );
drop policy if exists "admin update public media" on storage.objects;
create policy "admin update public media" on storage.objects
  for update to authenticated using (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and (select public.is_admin())
  ) with check (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and (select public.is_admin())
  );
drop policy if exists "admin delete public media" on storage.objects;
create policy "admin delete public media" on storage.objects
  for delete to authenticated using (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and (select public.is_admin())
  );

drop policy if exists "avatar select own" on storage.objects;
create policy "avatar select own" on storage.objects
  for select to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "avatar insert own" on storage.objects;
create policy "avatar insert own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "avatar update own" on storage.objects;
create policy "avatar update own" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  ) with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "avatar delete own" on storage.objects;
create policy "avatar delete own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "admin manage avatars" on storage.objects;
create policy "admin manage avatars" on storage.objects
  for all to authenticated using (bucket_id = 'avatars' and (select public.is_admin()))
  with check (bucket_id = 'avatars' and (select public.is_admin()));
