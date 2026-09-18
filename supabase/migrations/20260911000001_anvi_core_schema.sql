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
  author_name text not null default 'ANVI Clothing',
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
