/**
 * ANVI seed script — uploads static catalog (products/categories/coupons) to Supabase.
 * Run once per env: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts
 * Service role only — never run in browser, never commit key.
 */
import { createClient } from '@supabase/supabase-js';
import { productsData } from '../src/data/products.ts';
import { categoriesData } from '../src/data/categories.ts';

const url = process.env.SUPABASE_URL ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, serviceKey);
const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main(): Promise<void> {
  // 1. categories
  for (const [i, c] of categoriesData.entries()) {
    const { error } = await sb.from('categories').upsert(
      {
        legacy_id: c.id,
        name: c.name,
        slug: c.slug,
        short_description: c.shortDescription ?? '',
        image_url: c.image ?? null,
        featured: Boolean(c.featured),
        display_order: i + 1,
        is_active: true,
      },
      { onConflict: 'slug' },
    );
    if (error) console.error('category', c.slug, error.message);
  }

  // 2. collections (distinct from products)
  const collections = [...new Set(productsData.map((p) => p.collection).filter(Boolean))] as string[];
  for (const name of collections) {
    const { error } = await sb.from('collections').upsert(
      { name, slug: slugify(name), is_active: true },
      { onConflict: 'slug' },
    );
    if (error) console.error('collection', name, error.message);
  }

  // 3. occasions
  for (const name of ['Everyday', 'Office', 'Festive']) {
    const { error } = await sb.from('occasions').upsert(
      { name, slug: slugify(name), is_active: true },
      { onConflict: 'slug' },
    );
    if (error) console.error('occasion', name, error.message);
  }

  // 4. products + images + variants + inventory + tags
  const { data: cats } = await sb.from('categories').select('id,slug,name');
  const catBySlug = new Map((cats ?? []).map((c: { slug: string; id: string }) => [c.slug, c.id]));
  const catByName = new Map((cats ?? []).map((c: { name: string; id: string }) => [c.name, c.id]));

  for (const [i, p] of productsData.entries()) {
    const slug = p.slug || slugify(p.name);
    const catSlug = slugify(p.category);
    const categoryId = catBySlug.get(catSlug) ?? catByName.get(p.category) ?? null;
    const sku = `ANV-${String(i + 1).padStart(3, '0')}`;
    const { data: prod, error } = await sb
      .from('products')
      .upsert(
        {
          legacy_id: p.id,
          sku,
          name: p.name,
          slug,
          category_id: categoryId,
          category: p.category,
          description: p.description,
          price_int: Math.round(p.price),
          original_price_int: p.originalPrice ? Math.round(p.originalPrice) : null,
          availability: p.isOutOfStock ? 'Sold Out' : (p.availability ?? 'In Stock'),
          is_active: true,
          is_new_arrival: Boolean(p.isNewArrival),
          is_bestseller: Boolean(p.isBestseller),
          is_on_sale: Boolean(p.isOnSale ?? (p.originalPrice ? p.originalPrice > p.price : false)),
          is_out_of_stock: Boolean(p.isOutOfStock),
          fabric: p.fabric ?? null,
          fabric_care: p.care ?? null,
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single();
    if (error || !prod) {
      console.error('product', slug, error?.message);
      continue;
    }
    const pid = (prod as { id: string }).id;
    await sb.from('product_images').delete().eq('product_id', pid);
    await sb.from('product_images').insert(
      p.images.map((img, idx) => ({ product_id: pid, url: img, is_primary: idx === 0, display_order: idx })),
    );
    await sb.from('product_variants').delete().eq('product_id', pid);
    const sizes = p.variants && p.variants.length > 0 ? p.variants : ['Free Size'];
    await sb.from('product_variants').insert(sizes.map((s) => ({ product_id: pid, size_label: s, is_active: true })));
    await sb.from('inventory').upsert({ product_id: pid, stock_quantity: p.stock ?? 10 }, { onConflict: 'product_id,variant_id' });
    await sb.from('product_tags').delete().eq('product_id', pid);
    if (p.tags?.length) await sb.from('product_tags').insert(p.tags.map((t) => ({ product_id: pid, tag: t })));
  }
  console.log('Seed complete:', productsData.length, 'products.');
}

void main();
