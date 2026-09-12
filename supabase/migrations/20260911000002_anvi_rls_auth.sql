-- ANVI Clothing — Auth + RLS v1
-- Run after 00001. Service_role bypasses RLS; anon/authenticated governed below.

-- ---------- admin check (recursion-safe) ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (auth.jwt()->'app_metadata'->>'app_role' = 'admin')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.app_role='admin'),
  false);
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- ---------- new-user provisioning ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_role text := 'customer';
begin
  if exists (select 1 from public.admin_emails where email = lower(new.email)) then
    v_role := 'admin';
  end if;
  insert into public.profiles (id, email, first_name, app_role)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    v_role)
  on conflict (id) do update set email = excluded.email,
    app_role = case when public.profiles.app_role = 'admin' then 'admin' else excluded.app_role end;
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('app_role', v_role)
  where id = new.id;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_user_role(target_user uuid, new_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if new_role not in ('customer','support','admin') then raise exception 'bad role'; end if;
  update public.profiles set app_role=new_role, updated_at=now() where id=target_user;
  update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('app_role', new_role) where id=target_user;
end $$;

-- ---------- enable RLS ----------
alter table public.profiles enable row level security;
alter table public.admin_emails enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.occasions enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.product_tags enable row level security;
alter table public.product_collections enable row level security;
alter table public.product_occasions enable row level security;
alter table public.coupons enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_timeline enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.reviews enable row level security;
alter table public.blog_posts enable row level security;
alter table public.cms_sections enable row level security;
alter table public.hero_banners enable row level security;
alter table public.announcements enable row level security;
alter table public.store_ambience enable row level security;
alter table public.ambience_photos enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.promo_popups enable row level security;
alter table public.site_config enable row level security;
alter table public.leads enable row level security;
alter table public.audit_log enable row level security;
alter table public.media_assets enable row level security;

-- ---------- public catalog / CMS reads ----------
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select to anon, authenticated using (is_active = true);
drop policy if exists "public read collections" on public.collections;
create policy "public read collections" on public.collections for select to anon, authenticated using (is_active = true);
drop policy if exists "public read occasions" on public.occasions;
create policy "public read occasions" on public.occasions for select to anon, authenticated using (is_active = true);
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select to anon, authenticated using (is_active = true);
drop policy if exists "public read pimages" on public.product_images;
create policy "public read pimages" on public.product_images for select to anon, authenticated using (true);
drop policy if exists "public read pvariants" on public.product_variants;
create policy "public read pvariants" on public.product_variants for select to anon, authenticated using (is_active = true);
drop policy if exists "public read ptags" on public.product_tags;
create policy "public read ptags" on public.product_tags for select to anon, authenticated using (true);
drop policy if exists "public read pcoll" on public.product_collections;
create policy "public read pcoll" on public.product_collections for select to anon, authenticated using (true);
drop policy if exists "public read pocc" on public.product_occasions;
create policy "public read pocc" on public.product_occasions for select to anon, authenticated using (true);
drop policy if exists "public read blog" on public.blog_posts;
create policy "public read blog" on public.blog_posts for select to anon, authenticated using (is_published = true);
drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews" on public.reviews for select to anon, authenticated using (is_approved = true);
drop policy if exists "public read cms" on public.cms_sections;
create policy "public read cms" on public.cms_sections for select to anon, authenticated using (is_active = true);
drop policy if exists "public read hero" on public.hero_banners;
create policy "public read hero" on public.hero_banners for select to anon, authenticated using (is_active = true);
drop policy if exists "public read ann" on public.announcements;
create policy "public read ann" on public.announcements for select to anon, authenticated using (is_active = true);
drop policy if exists "public read ambience" on public.store_ambience;
create policy "public read ambience" on public.store_ambience for select to anon, authenticated using (true);
drop policy if exists "public read ambphotos" on public.ambience_photos;
create policy "public read ambphotos" on public.ambience_photos for select to anon, authenticated using (is_active = true);
drop policy if exists "public read insta" on public.instagram_posts;
create policy "public read insta" on public.instagram_posts for select to anon, authenticated using (is_active = true);
drop policy if exists "public read popup" on public.promo_popups;
create policy "public read popup" on public.promo_popups for select to anon, authenticated using (is_enabled = true);
drop policy if exists "public read config" on public.site_config;
create policy "public read config" on public.site_config for select to anon, authenticated using (true);
drop policy if exists "public read coupons" on public.coupons;
create policy "public read coupons" on public.coupons for select to anon, authenticated using (is_active = true);

-- ---------- admin full access ----------
drop policy if exists "admin all catalog" on public.categories;
create policy "admin all catalog" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all collections" on public.collections;
create policy "admin all collections" on public.collections for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all occasions" on public.occasions;
create policy "admin all occasions" on public.occasions for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all products" on public.products;
create policy "admin all products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all pimages" on public.product_images;
create policy "admin all pimages" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all pvariants" on public.product_variants;
create policy "admin all pvariants" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all inventory" on public.inventory;
create policy "admin all inventory" on public.inventory for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all coupons" on public.coupons;
create policy "admin all coupons" on public.coupons for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all orders" on public.orders;
create policy "admin all orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all oitems" on public.order_items;
create policy "admin all oitems" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all otimeline" on public.order_timeline;
create policy "admin all otimeline" on public.order_timeline for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all redemptions" on public.coupon_redemptions;
create policy "admin all redemptions" on public.coupon_redemptions for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all leads" on public.leads;
create policy "admin all leads" on public.leads for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all blog" on public.blog_posts;
create policy "admin all blog" on public.blog_posts for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all hero" on public.hero_banners;
create policy "admin all hero" on public.hero_banners for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all ann" on public.announcements;
create policy "admin all ann" on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all cms" on public.cms_sections;
create policy "admin all cms" on public.cms_sections for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all ambience" on public.store_ambience;
create policy "admin all ambience" on public.store_ambience for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all insta" on public.instagram_posts;
create policy "admin all insta" on public.instagram_posts for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all popup" on public.promo_popups;
create policy "admin all popup" on public.promo_popups for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all config" on public.site_config;
create policy "admin all config" on public.site_config for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all reviews" on public.reviews;
create policy "admin all reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all audit" on public.audit_log;
create policy "admin all audit" on public.audit_log for select to authenticated using (public.is_admin());
drop policy if exists "admin all media" on public.media_assets;
create policy "admin all media" on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "allow admin_all" on public.admin_emails;
create policy "allow admin_all" on public.admin_emails for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- own-row data ----------
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "own addresses" on public.addresses;
create policy "own addresses" on public.addresses for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists "own orders" on public.orders;
create policy "own orders" on public.orders for select to authenticated using (profile_id = auth.uid());
drop policy if exists "own oitems" on public.order_items;
create policy "own oitems" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.profile_id = auth.uid()));
drop policy if exists "own otimeline" on public.order_timeline;
create policy "own otimeline" on public.order_timeline for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.profile_id = auth.uid()));
drop policy if exists "own wishlist" on public.wishlist;
create policy "own wishlist" on public.wishlist for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists "own carts" on public.carts;
create policy "own carts" on public.carts for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists "own cartitems" on public.cart_items;
create policy "own cartitems" on public.cart_items for all to authenticated using (
  exists (select 1 from public.carts c where c.id = cart_id and c.profile_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.profile_id = auth.uid()));

-- leads: anon insert only, no public select
drop policy if exists "anon insert lead" on public.leads;
create policy "anon insert lead" on public.leads for insert to anon, authenticated with check (true);
-- reviews: owner insert/update own, public reads approved
drop policy if exists "rev owner insert" on public.reviews;
create policy "rev owner insert" on public.reviews for insert to authenticated with check (profile_id = auth.uid() or profile_id is null);
