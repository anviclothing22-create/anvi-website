-- ANVI Clothing — Supabase core schema v1
-- Consolidated from 10-agent design. Postgres 15.
-- Money stored as INTEGER rupees (*_int) to avoid float errors.
-- Run: supabase db push

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "citext";

-- ---------- helpers ----------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$ begin
  create type order_status as enum ('pending','confirmed','in_studio_preparation','dispatched','shipped','delivered','cancelled','refunded');
exception when duplicate_object then null; end $$;
do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded','cod_pending');
exception when duplicate_object then null; end $$;
do $$ begin
  create type discount_type as enum ('percentage','fixed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type lead_status as enum ('new','contacted','scheduled','converted','closed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type audit_action as enum ('insert','update','delete');
exception when duplicate_object then null; end $$;

-- ================= PROFILES / ADDRESSES =================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null,
  first_name text not null default '' check (char_length(first_name) <= 80),
  last_name text not null default '' check (char_length(last_name) <= 80),
  full_name text generated always as (trim(both ' ' from (first_name || ' ' || last_name))) stored,
  phone text check (phone is null or char_length(regexp_replace(phone,'\D','','g')) between 10 and 15),
  avatar_url text,
  app_role text not null default 'customer' check (app_role in ('customer','support','admin')),
  preferred_drape text,
  is_first_order boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_emails (
  email citext primary key,
  added_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home' check (char_length(label) between 1 and 60),
  full_name text not null check (char_length(full_name) between 1 and 120),
  phone text not null check (char_length(regexp_replace(phone,'\D','','g')) between 10 and 15),
  address_line1 text not null check (char_length(address_line1) between 3 and 300),
  address_line2 text,
  city text not null default 'Coimbatore',
  state text not null default 'Tamil Nadu',
  postal_code text not null check (postal_code ~ '^[1-9][0-9]{5}$'),
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_addresses_profile on public.addresses(profile_id);

-- ================= TAXONOMY =================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text not null default '',
  description text,
  image_url text,
  featured boolean not null default false,
  display_order int not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  image_url text,
  display_order int not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.occasions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  subtitle text,
  description text,
  image_url text,
  cta_text text,
  cta_href text,
  display_order int not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ================= PRODUCTS =================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  sku text not null unique check (sku ~ '^[A-Z0-9][A-Z0-9\-]{2,40}$'),
  name text not null check (char_length(name) between 2 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  category_id uuid references public.categories(id) on delete restrict,
  category text not null default 'Sarees' check (category in ('Sarees','Salwars','Co-ord Sets','3-Piece Sets','Kidswear')),
  description text not null default '' check (char_length(description) <= 8000),
  price_int int not null check (price_int >= 0),
  original_price_int int check (original_price_int is null or original_price_int >= price_int),
  currency char(3) not null default 'INR' check (currency = 'INR'),
  fabric text,
  fabric_care text,
  care_instructions text,
  pattern text,
  availability text not null default 'In Stock'
    check (availability in ('In Stock','Limited Pieces','Made to Order','Sold Out','Out of Stock')),
  is_active boolean not null default true,
  is_new_arrival boolean not null default false,
  is_bestseller boolean not null default false,
  is_featured boolean not null default false,
  is_on_sale boolean not null default false,
  is_out_of_stock boolean not null default false,
  avg_rating numeric(2,1) not null default 0 check (avg_rating between 0 and 5),
  review_count int not null default 0 check (review_count >= 0),
  search_tsv tsvector generated always as (
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(sku,''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug_trgm on public.products using gin (slug gin_trgm_ops);
create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_search on public.products using gin (search_tsv);
create index if not exists idx_products_flags on public.products(is_active, is_new_arrival, is_bestseller, is_featured);
create index if not exists idx_products_price on public.products(price_int);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  is_primary boolean not null default false,
  display_order int not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now()
);
create index if not exists idx_pimages_product on public.product_images(product_id, display_order);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_label text not null check (char_length(size_label) between 1 and 20),
  color text,
  variant_sku text unique,
  price_override_int int check (price_override_int is null or price_override_int >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size_label, color)
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  reserved_quantity int not null default 0 check (reserved_quantity >= 0),
  low_stock_threshold int not null default 3 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now(),
  unique (product_id, variant_id),
  check (reserved_quantity <= stock_quantity)
);

create table if not exists public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag text not null,
  primary key (product_id, tag)
);
create table if not exists public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);
create table if not exists public.product_occasions (
  product_id uuid not null references public.products(id) on delete cascade,
  occasion_id uuid not null references public.occasions(id) on delete cascade,
  primary key (product_id, occasion_id)
);

-- ================= COUPONS =================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  code text not null unique check (code ~ '^[A-Z0-9]{4,24}$'),
  discount_type discount_type not null,
  discount_value int not null check (discount_value > 0),
  min_order_amount_int int not null default 0 check (min_order_amount_int >= 0),
  max_discount_amount_int int check (max_discount_amount_int is null or max_discount_amount_int > 0),
  usage_limit int check (usage_limit is null or usage_limit > 0),
  used_count int not null default 0 check (used_count >= 0),
  per_user_limit int not null default 1 check (per_user_limit > 0),
  applicable_category_id uuid references public.categories(id) on delete set null,
  description text,
  start_date date not null default CURRENT_DATE,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date <= end_date),
  check (discount_type <> 'percentage' or discount_value between 1 and 100)
);
create index if not exists idx_coupons_active_dates on public.coupons(is_active, start_date, end_date);

-- ================= CART / WISHLIST =================
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  guest_token text,
  status text not null default 'active' check (status in ('active','converted','abandoned','expired')),
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((profile_id is not null) <> (guest_token is not null))
);
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete set null,
  size_label text,
  quantity int not null check (quantity > 0 and quantity <= 99),
  unit_price_int int not null check (unit_price_int >= 0),
  added_at timestamptz not null default now()
);
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  guest_token text,
  product_id uuid not null references public.products(id) on delete cascade,
  added_at timestamptz not null default now(),
  check (profile_id is not null or guest_token is not null),
  unique (profile_id, product_id)
);

-- ================= ORDERS =================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (order_number ~ '^ANVI-[0-9]{6}$'),
  profile_id uuid references public.profiles(id) on delete set null,
  customer_name text not null check (char_length(customer_name) between 1 and 160),
  customer_email citext,
  customer_phone text not null check (char_length(regexp_replace(customer_phone,'\D','','g')) between 10 and 15),
  contact_handle text,
  whatsapp_opt_in boolean not null default true,
  subtotal_int int not null check (subtotal_int >= 0),
  discount_int int not null default 0 check (discount_int >= 0),
  coupon_id uuid references public.coupons(id) on delete set null,
  coupon_code text,
  shipping_fee_int int not null default 0 check (shipping_fee_int >= 0),
  tax_amount_int int not null default 0 check (tax_amount_int >= 0),
  total_int int not null check (total_int >= 0),
  payment_method text not null,
  payment_status payment_status not null default 'pending',
  order_status order_status not null default 'in_studio_preparation',
  channel text not null default 'Online Store' check (channel in ('Online Store','Coimbatore Offline Boutique')),
  delivery_method text not null default 'Standard Insured Delivery',
  courier text,
  tracking_number text,
  tracking_url text,
  address_id uuid references public.addresses(id) on delete set null,
  shipping_snapshot jsonb not null default '{}'::jsonb,
  notes text,
  idempotency_key text unique,
  razorpay_order_id text,
  razorpay_payment_id text,
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount_int <= subtotal_int),
  check (total_int = subtotal_int - discount_int + shipping_fee_int + tax_amount_int)
);
create index if not exists idx_orders_profile on public.orders(profile_id);
create index if not exists idx_orders_status on public.orders(order_status);
create index if not exists idx_orders_placed on public.orders(placed_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  sku text,
  slug text,
  image_url text,
  size_label text,
  color text,
  unit_price_int int not null check (unit_price_int >= 0),
  quantity int not null check (quantity > 0 and quantity <= 99),
  total_price_int int not null check (total_price_int >= 0),
  created_at timestamptz not null default now(),
  check (total_price_int = unit_price_int * quantity)
);
create index if not exists idx_oitems_order on public.order_items(order_id);

create table if not exists public.order_timeline (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  title text not null,
  description text,
  from_status text,
  to_status text,
  is_completed boolean not null default false,
  event_at timestamptz not null default now()
);
create index if not exists idx_otimeline_order on public.order_timeline(order_id, event_at);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  guest_email citext,
  discount_amount_int int not null check (discount_amount_int > 0),
  redeemed_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);

-- ================= REVIEWS / BLOG =================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  reviewer_name text not null,
  reviewer_location text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  purchased_product_name text,
  is_verified boolean not null default false,
  is_approved boolean not null default true,
  helpful_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  subtitle text,
  category text not null default 'Studio Life'
    check (category in ('Craft Provenance','Drape & Styling','Weavers of India','Care & Heirlooms','Studio Life')),
  excerpt text not null default '',
  content_markdown text not null default '',
  content_json jsonb not null default '{}'::jsonb,
  cover_image_url text,
  author_name text not null default 'ANVI Studio',
  author_role text,
  author_avatar_url text,
  read_time text,
  issue text,
  is_published boolean not null default false,
  published_at timestamptz,
  tagged_product_id uuid references public.products(id) on delete set null,
  tags text[] not null default '{}',
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ================= CMS =================
create table if not exists public.cms_sections (
  section_key text primary key,
  content jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  badge text,
  headline_word1 text,
  headline_word2 text,
  title text,
  subtitle text,
  tagline text,
  description text,
  primary_cta_text text,
  primary_cta_href text,
  secondary_cta_text text,
  secondary_cta_href text,
  image_url text,
  display_order int not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  link_text text,
  link_href text,
  display_order int not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.store_ambience (
  id text primary key check (id='main'),
  store_name text not null default 'ANVI Flagship Boutique',
  headline text,
  tagline text,
  address_line1 text,
  address_line2 text,
  city text,
  visiting_hours text,
  phone text,
  hero_image_url text,
  map_embed_url text,
  description text,
  updated_at timestamptz not null default now()
);
insert into public.store_ambience (id) values ('main') on conflict do nothing;
create table if not exists public.ambience_photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  caption text,
  image_url text not null,
  display_order int not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  video_url text,
  alt text,
  caption text,
  post_url text,
  is_reel boolean not null default true,
  views_label text,
  likes_label text,
  audio_label text,
  category text not null default 'reels' check (category in ('reels','styling','studio')),
  tagged_product_id uuid references public.products(id) on delete set null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.promo_popups (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Unlock 10% Off Your First Order',
  subtitle text,
  description text,
  discount_badge text default '10% OFF',
  coupon_id uuid references public.coupons(id) on delete set null,
  coupon_code text not null default 'WELCOME10',
  image_url text,
  delay_seconds int not null default 5 check (delay_seconds between 0 and 120),
  show_on_exit_intent boolean not null default false,
  cta_text text,
  cta_link text,
  is_enabled boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  updated_at timestamptz not null default now()
);
create unique index if not exists popups_single_active_idx on public.promo_popups ((is_enabled)) where is_enabled;
create table if not exists public.site_config (
  id text primary key check (id='main'),
  instagram_handle text default '@anviclothing_coimbatore',
  instagram_cta_href text default 'https://www.instagram.com/anviclothing_coimbatore/',
  elfsight_widget_id text default '',
  follower_count text default '1.7K',
  updated_at timestamptz not null default now()
);
insert into public.site_config (id) values ('main') on conflict do nothing;

-- ================= LEADS =================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 160),
  email citext,
  phone text not null check (char_length(regexp_replace(phone,'\D','','g')) between 10 and 15),
  city text,
  source text not null default 'website'
    check (source in ('website','website_popup','checkout','newsletter','walk_in','fitting_booking','bridal_consultation','whatsapp','phone_inquiry','Offline Store Walk-in','WhatsApp Concierge','Website Newsletter','Boutique Fitting Appointment')),
  interest_category text,
  interests text[] not null default '{}',
  notes text,
  status lead_status not null default 'new',
  preferred_date date,
  consent_whatsapp boolean not null default true,
  coupon_unlocked_code text,
  converted_order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_email on public.leads(email);

-- ================= AUDIT / MEDIA / RATE LIMIT =================
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action audit_action not null,
  table_name text not null,
  record_id text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_table_record on public.audit_log(table_name, record_id);

create table if not exists public.media_assets (
  bucket text not null,
  path text not null,
  url text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (bucket, path)
);

create table if not exists public.rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);

-- ---------- triggers: updated_at + single-default address + audit ----------
create or replace function public.ensure_single_default_address()
returns trigger language plpgsql as $$
begin
  if new.is_default then
    update public.addresses set is_default=false where profile_id=new.profile_id and id<>new.id;
  end if;
  return new;
end $$;
drop trigger if exists trg_addresses_single_default on public.addresses;
create trigger trg_addresses_single_default before insert or update on public.addresses
for each row execute function public.ensure_single_default_address();

create or replace function public.handle_audit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log(actor_id, action, table_name, record_id, old_data, new_data)
  values (auth.uid(),
    case when TG_OP='INSERT' then 'insert'::audit_action when TG_OP='UPDATE' then 'update'::audit_action else 'delete'::audit_action end,
    TG_TABLE_NAME,
    coalesce((to_jsonb(new)->>'id'), (to_jsonb(old)->>'id')),
    case when TG_OP<>'INSERT' then to_jsonb(old) end,
    case when TG_OP<>'DELETE' then to_jsonb(new) end);
  return coalesce(new, old);
end $$;

create or replace function public.sync_availability()
returns trigger language plpgsql as $$
begin
  new.is_out_of_stock := (new.price_int is not null and false) or false;
  -- stock lives in inventory table; keep flag consistent via app/RPC. Default guard:
  if new.availability = 'Out of Stock' then new.availability := 'Sold Out'; end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists trg_products_sync on public.products;
create trigger trg_products_sync before insert or update on public.products
for each row execute function public.sync_availability();

do $$ declare t text; begin
  foreach t in array array['profiles','addresses','categories','collections','occasions','products','product_variants','coupons','orders','reviews','blog_posts','hero_banners','announcements','instagram_posts','leads'] loop
    execute format('drop trigger if exists trg_%s_updated on public.%I; create trigger trg_%s_updated before update on public.%I for each row execute function public.handle_updated_at();', t,t,t,t);
  end loop;
  foreach t in array array['products','orders','coupons','leads','categories'] loop
    execute format('drop trigger if exists trg_%s_audit on public.%I; create trigger trg_%s_audit after insert or update or delete on public.%I for each row execute function public.handle_audit();', t,t,t,t);
  end loop;
end $$;

-- ---------- seed coupons (idempotent) ----------
insert into public.coupons (code, discount_type, discount_value, min_order_amount_int, max_discount_amount_int, usage_limit, description, start_date, end_date, is_active)
values
 ('WELCOME10','percentage',10,0,2000,1000,'10% privilege discount via storefront lead popup.', CURRENT_DATE, CURRENT_DATE + interval '1 year', true),
 ('FIRSTANVI','percentage',10,2500,1000,500,'10% off first-time patrons above Rs 2,500.', CURRENT_DATE, CURRENT_DATE + interval '1 year', true),
 ('FESTIVE500','fixed',500,4000,null,200,'Flat Rs 500 off festive sarees and sets above Rs 4,000.', CURRENT_DATE, CURRENT_DATE + interval '90 days', true),
 ('BOUTIQUE15','percentage',15,5000,3000,100,'Boutique launch celebration code: 15% off.', CURRENT_DATE, CURRENT_DATE + interval '60 days', true)
on conflict (code) do nothing;
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
  -- Defence in depth: only the service role or an existing admin may change roles.
  if coalesce(auth.role(),'') <> 'service_role' and not public.is_admin() then
    raise exception 'forbidden: admin or service_role only';
  end if;
  if new_role not in ('customer','support','admin') then raise exception 'bad role'; end if;
  update public.profiles set app_role=new_role, updated_at=now() where id=target_user;
  update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('app_role', new_role) where id=target_user;
end $$;
revoke all on function public.set_user_role(uuid, text) from public, anon, authenticated;
grant execute on function public.set_user_role(uuid, text) to service_role;

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
-- ANVI Clothing — Storage buckets + policies v1

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images','product-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('hero-banners','hero-banners', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('ambience-gallery','ambience-gallery', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('blog-images','blog-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('instagram-cache','instagram-cache', true, 3145728, array['image/jpeg','image/png','image/webp']),
  ('avatars','avatars', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read product-images" on storage.objects;
create policy "public read product-images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "public read hero-banners" on storage.objects;
create policy "public read hero-banners" on storage.objects
  for select to anon, authenticated using (bucket_id = 'hero-banners');
drop policy if exists "public read ambience-gallery" on storage.objects;
create policy "public read ambience-gallery" on storage.objects
  for select to anon, authenticated using (bucket_id = 'ambience-gallery');
drop policy if exists "public read blog-images" on storage.objects;
create policy "public read blog-images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'blog-images');
drop policy if exists "public read instagram-cache" on storage.objects;
create policy "public read instagram-cache" on storage.objects
  for select to anon, authenticated using (bucket_id = 'instagram-cache');

drop policy if exists "admin insert public media" on storage.objects;
create policy "admin insert public media" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and public.is_admin()
  );
drop policy if exists "admin update public media" on storage.objects;
create policy "admin update public media" on storage.objects
  for update to authenticated using (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and public.is_admin()
  ) with check (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and public.is_admin()
  );
drop policy if exists "admin delete public media" on storage.objects;
create policy "admin delete public media" on storage.objects
  for delete to authenticated using (
    bucket_id in ('product-images','hero-banners','ambience-gallery','blog-images','instagram-cache')
    and public.is_admin()
  );

drop policy if exists "avatar select own" on storage.objects;
create policy "avatar select own" on storage.objects
  for select to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "avatar insert own" on storage.objects;
create policy "avatar insert own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "avatar update own" on storage.objects;
create policy "avatar update own" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "avatar delete own" on storage.objects;
create policy "avatar delete own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "admin manage avatars" on storage.objects;
create policy "admin manage avatars" on storage.objects
  for all to authenticated using (bucket_id = 'avatars' and public.is_admin())
  with check (bucket_id = 'avatars' and public.is_admin());
-- ANVI migration 00005: leads idempotency + prod hardening
-- - Unique email (partial, case-insensitive via citext) so submitLead duplicate handling (23505) works.
-- - Canonical lead source is 'website_popup'. Legacy 'Website Newsletter' rows remain valid (see CHECK in 00001)
--   but new writes must use 'website_popup'.

-- Dedupe existing duplicate emails (keep earliest) before adding constraint.
with ranked as (
  select id, email,
    row_number() over (partition by email order by created_at asc) as rn
  from public.leads
  where email is not null
)
delete from public.leads l
using ranked r
where l.id = r.id and r.rn > 1;

drop index if exists public.idx_leads_email;
create unique index if not exists uq_leads_email on public.leads(email) where email is not null;
create index if not exists idx_leads_source on public.leads(source);

-- ANVI migration 00006: close privilege-escalation via self-service role change.
-- A customer could otherwise run: update profiles set app_role='admin' where id = auth.uid();
-- (policy "own profile update" allows any column) and gain full admin RLS via is_admin().
-- Guard: preserve app_role unless the actor is a real admin or the service role.
create or replace function public.protect_profile_role()
returns trigger language plpgsql as $$
begin
  if new.app_role is distinct from old.app_role
     and coalesce(auth.role(), '') = 'authenticated'
     and not public.is_admin() then
    new.app_role := old.app_role;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();
