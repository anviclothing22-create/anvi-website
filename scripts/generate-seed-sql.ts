/**
 * Generates supabase/ANVI_SEED.sql from static storefront data.
 * Run: npx -y tsx scripts/generate-seed-sql.ts
 * Output is idempotent (upserts + delete/insert per product) and safe to
 * paste into Supabase Dashboard → SQL Editor → Run.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { productsData } from '../src/data/products.ts';
import { categoriesData } from '../src/data/categories.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = (v: string): string => `'${v.replace(/'/g, "''")}'`;
const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const nul = (v: string | null | undefined): string => (v == null || v === '' ? 'NULL' : esc(v));
const bool = (v: boolean | undefined): string => (v ? 'TRUE' : 'FALSE');

const out: string[] = [];
out.push('-- ANVI Clothing — catalog seed v1 (idempotent). Paste into SQL Editor and Run.');
out.push('-- Source: src/data/products.ts + src/data/categories.ts');
out.push('');

out.push('-- ---------- categories ----------');
categoriesData.forEach((c, i) => {
  out.push(
    `insert into public.categories (legacy_id, name, slug, short_description, image_url, featured, display_order, is_active) values (${esc(c.id)}, ${esc(c.name)}, ${esc(c.slug)}, ${esc(c.shortDescription ?? '')}, ${nul(c.image)}, ${bool(c.featured)}, ${i + 1}, TRUE) on conflict (slug) do update set name=excluded.name, short_description=excluded.short_description, image_url=excluded.image_url, featured=excluded.featured, display_order=excluded.display_order, is_active=TRUE;`,
  );
});
out.push('');

const collections = [...new Set(productsData.map((p) => p.collection).filter((x): x is string => Boolean(x)))];
out.push('-- ---------- collections ----------');
for (const name of collections) {
  out.push(
    `insert into public.collections (name, slug, is_active) values (${esc(name)}, ${esc(slugify(name))}, TRUE) on conflict (slug) do nothing;`,
  );
}
out.push('');

out.push('-- ---------- occasions ----------');
for (const name of ['Everyday', 'Office', 'Festive']) {
  out.push(
    `insert into public.occasions (name, slug, is_active) values (${esc(name)}, ${esc(slugify(name))}, TRUE) on conflict (slug) do nothing;`,
  );
}
out.push('');

out.push('-- ---------- products + images + variants + inventory + tags + junctions ----------');
productsData.forEach((p, i) => {
  const slug = p.slug || slugify(p.name);
  const catSlug = slugify(p.category);
  const sku = `ANV-${String(i + 1).padStart(3, '0')}`;
  const orig = p.originalPrice && p.originalPrice > p.price ? Math.round(p.originalPrice) : null;
  const avail = p.isOutOfStock ? 'Sold Out' : (p.availability ?? 'In Stock');
  const onSale = Boolean(p.isOnSale ?? (orig != null && orig > p.price));
  const sizes = p.variants && p.variants.length > 0 ? p.variants : ['Free Size'];
  const stock = p.stock ?? 10;
  out.push(`-- ${slug}`);
  out.push(
    `insert into public.products (legacy_id, sku, name, slug, category_id, category, description, price_int, original_price_int, availability, is_active, is_new_arrival, is_bestseller, is_on_sale, is_out_of_stock, fabric, fabric_care) values (${esc(p.id)}, ${esc(sku)}, ${esc(p.name)}, ${esc(slug)}, (select id from public.categories where slug=${esc(catSlug)}), ${esc(p.category)}, ${esc(p.description)}, ${Math.round(p.price)}, ${orig ?? 'NULL'}, ${esc(avail)}, TRUE, ${bool(p.isNewArrival)}, ${bool(p.isBestseller)}, ${bool(onSale)}, ${bool(p.isOutOfStock)}, ${nul(p.fabric)}, ${nul(p.care)}) on conflict (slug) do update set name=excluded.name, category_id=excluded.category_id, category=excluded.category, description=excluded.description, price_int=excluded.price_int, original_price_int=excluded.original_price_int, availability=excluded.availability, is_new_arrival=excluded.is_new_arrival, is_bestseller=excluded.is_bestseller, is_on_sale=excluded.is_on_sale, is_out_of_stock=excluded.is_out_of_stock, fabric=excluded.fabric, fabric_care=excluded.fabric_care, is_active=TRUE;`,
  );
  out.push(
    `delete from public.product_images where product_id=(select id from public.products where slug=${esc(slug)});`,
  );
  out.push(
    `insert into public.product_images (product_id, url, is_primary, display_order) values ${p.images.map((u, idx) => `((select id from public.products where slug=${esc(slug)}), ${esc(u)}, ${idx === 0 ? 'TRUE' : 'FALSE'}, ${idx})`).join(', ')};`,
  );
  out.push(
    `delete from public.product_variants where product_id=(select id from public.products where slug=${esc(slug)});`,
  );
  out.push(
    `insert into public.product_variants (product_id, size_label, is_active) values ${sizes.map((s) => `((select id from public.products where slug=${esc(slug)}), ${esc(s)}, TRUE)`).join(', ')};`,
  );
  out.push(
    `delete from public.inventory where product_id=(select id from public.products where slug=${esc(slug)});`,
  );
  out.push(
    `insert into public.inventory (product_id, stock_quantity) select id, ${stock} from public.products where slug=${esc(slug)};`,
  );
  out.push(
    `delete from public.product_tags where product_id=(select id from public.products where slug=${esc(slug)});`,
  );
  if (p.tags && p.tags.length > 0) {
    out.push(
      `insert into public.product_tags (product_id, tag) values ${p.tags.map((t) => `((select id from public.products where slug=${esc(slug)}), ${esc(t)})`).join(', ')};`,
    );
  }
  out.push(
    `delete from public.product_collections where product_id=(select id from public.products where slug=${esc(slug)});`,
  );
  if (p.collection) {
    out.push(
      `insert into public.product_collections (product_id, collection_id) select (select id from public.products where slug=${esc(slug)}), id from public.collections where slug=${esc(slugify(p.collection))};`,
    );
  }
  out.push(
    `delete from public.product_occasions where product_id=(select id from public.products where slug=${esc(slug)});`,
  );
  if (p.occasion) {
    out.push(
      `insert into public.product_occasions (product_id, occasion_id) select (select id from public.products where slug=${esc(slug)}), id from public.occasions where slug=${esc(slugify(p.occasion))};`,
    );
  }
  out.push('');
});

out.push('-- ---------- admin allowlist (sign up with this email after running) ----------');
out.push(
  `insert into public.admin_emails (email) values ('anviclothing22@gmail.com') on conflict do nothing;`,
);

writeFileSync(join(root, 'supabase', 'ANVI_SEED.sql'), out.join('\n') + '\n');
console.log(`Wrote supabase/ANVI_SEED.sql (${out.length} lines, ${productsData.length} products).`);
