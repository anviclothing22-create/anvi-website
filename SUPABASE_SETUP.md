# ANVI Clothing — Supabase Backend (Production v1)

10-agent build consolidated. Storefront (`src/`, React 19) + Admin (`anvi-admin/`, React 18) share **one Supabase project**.

## What was built

- `supabase/migrations/00001` core schema: profiles, addresses, categories, collections, occasions, products, product_images, product_variants, inventory, tags/junctions, coupons, carts/cart_items, wishlist, orders/order_items/timeline/redemptions, reviews, blog_posts, CMS (hero, announcements, ambience, instagram, popups, site_config, sections), leads, audit_log, media_assets, rate_limits.
- `00002` auth + RLS: `is_admin()` (JWT claim + profiles, recursion-safe), `handle_new_user()` auto-provision + `admin_emails` allowlist, `set_user_role()`, deny-by-default policies (public reads active catalog/CMS only; own-row orders/addresses/wishlist/cart; anon lead-insert only).
- `00003` RPCs: `validate_coupon` (expiry/usage/min-spend/per-user server-side), `create_order` (re-prices from DB, stock check, shipping Std free≥2500 else 150 / Exp 250, idempotency, timeline, redemption), `update_order_status` (legal transitions, admin-only), `decrement/increment_stock` (service_role only), dashboard views + Realtime publication.
- `00004` Storage: 6 buckets (5 public + private avatars), 5 MB cap, jpg/png/webp, admin-write / owner-avatar policies, CDN immutable cache.
- `src/lib/`: `supabaseClient`, `catalogTypes`, `productsApi` (filters/search/pagination 24 + local fallback), `ordersApi`, `couponsApi`, `cmsApi` (5-min cache + static fallback + Realtime invalidation), `leadsApi` (duplicate-safe WELCOME10), `liveSync` (Realtime + offline outbox LWW), `validators` (zod pincode/phone), `sanitize` (DOMPurify), `uploadApi` (client compress → WebP → Storage + srcset).
- `anvi-admin/src/lib/supabase.ts` + `hooks/useSupabaseQuery.ts` (admin guard, paginated CRUD pattern).
- `.env.example` (both apps, anon only) + `.gitignore` hardened + `scripts/seed.ts` (static → Supabase idempotent seed).

## Setup (staging then prod)

```bash
npm i -g supabase
supabase link --project-ref <staging-ref>
supabase db push --linked            # runs 00001-00004
supabase secrets set RAZORPAY_SECRET=... RAZORPAY_WEBHOOK_SECRET=... SMTP_*=...
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts
cp .env.example .env.local           # fill staging anon key
# same for anvi-admin/.env.example
```

Create buckets are in migration; enable **Image Transformations** for `?width=` CDN params. Add admin: `insert into admin_emails(email) values ('admin@anviclothing.com');` then sign up that email (trigger promotes to admin).

## Security model

- Browser holds **anon key only**; `service_role` lives in Edge Functions/seed only (CI grep must stay zero in `src/`).
- Money/coupons/totals/stock are **server-computed** (`create_order`/`validate_coupon`); client math is display-only.
- Orders: customers `SELECT` own only; status changes via `update_order_status` (admin-only, audited in `audit_log`).
- Leads: anon `INSERT` only; reads admin-only. Rate-limit + honeypot + captcha at Edge (see Agent 9 zod schemas in `src/lib/validators.ts`).
- Uploads: mime + size enforced, WebP recompress, EXIF stripped, uuid paths, orphan sweep via `media_assets` + weekly cron.
- Headers: add CSP/HSTS/X-Frame (`_headers`/vercel.json): allow `*.supabase.co`, `checkout.razorpay.com`; `frame-ancestors 'none'`; admin `noindex`.

## Smooth-operation notes

- Every Supabase fetch has **local fallback** (productsData, hero, announcement, journal, instagram, DEFAULT_COUPONS shape) + 5-min cache, so the store works offline/misconfigured.
- Realtime replaces `BroadcastChannel` (which never crossed :5173↔:5174 origins): one channel per domain, `removeChannel` on unmount, exponential backoff, `eventsPerSecond: 10`, column allowlists.
- Cart/wishlist stay localStorage for guests; authed users merge to `carts/cart_items/wishlist` on login (LWW `updated_at`, outbox `anvi_outbox_v1` capped 200).
- Pagination 24 (shop), 25 (admin tables); indexes on slug/category/price/FTS/trigram; images lazy + `srcset`, hero eager + preload.

## Go-live checklist (abridged)

1. RLS on all tables; anon cannot read orders/leads; admin gate tested.
2. Coupon abuse (reuse/min-spend/expiry) blocked server-side.
3. 50-concurrent last-size oversell test → 1 wins.
4. Storage CDN 200, signed avatar expiry, immutable cache.
5. Realtime admin→storefront <2 s.
6. PITR + daily `pg_dump` + restore drill.
7. Sentry both apps, `/health` + uptime monitor.
8. Razorpay live keys + webhook HMAC + ₹1 charge/refund test; COD cap enforced server-side.
9. `.env*` ignored, staging≠prod projects, keys rotated post-staging.
10. CI: oxlint 0, `tsc --noEmit` both apps, `vite build` both, `db push --dry-run`, Lighthouse ≥90.

Full 25-item list + CI yaml + rotation runbook: see Agent 10 output in build log.
