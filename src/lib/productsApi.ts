import { productsData } from '../data/products';
import type { Product } from './types';
import { getSupabase } from './supabaseClient';
import {
  toStorefrontProduct,
  type PagedResult,
  type ProductFilters,
  type ProductImageRow,
  type ProductRow,
  type ProductVariantRow,
} from './catalogTypes';

export const CATALOG_PAGE_LIMIT = 24;

interface JoinedRow extends ProductRow {
  product_images?: ProductImageRow[];
  product_variants?: ProductVariantRow[];
  product_tags?: { tag: string }[];
  product_collections?: { collections: { name: string; slug: string } | null }[];
  product_occasions?: { occasions: { name: string; slug: string } | null }[];
}

function mapJoined(row: JoinedRow): Product {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order)
    .map((i) => i.url);
  const variants = (row.product_variants ?? []).filter((v) => v.is_active).map((v) => v.size_label);
  const tags = (row.product_tags ?? []).map((t) => t.tag);
  const collection =
    row.product_collections?.map((c) => c.collections?.name).find(Boolean) ??
    tags.find((t) => ['New Arrivals', 'Bestsellers', 'The ANVI Edit', 'Festive Edit', 'Premium', 'Heirloom Silks'].includes(t));
  const occasion =
    (row.product_occasions?.map((o) => o.occasions?.name).find(Boolean) as Product['occasion']) ??
    (tags.find((t) => ['Everyday', 'Office', 'Festive', 'Wedding & Celebration', 'Wedding'].includes(t)) as Product['occasion'] | undefined);
  return toStorefrontProduct(row, { images, variants, tags, collection, occasion });
}

const SELECT =
  '*, product_images(url,alt,is_primary,display_order), product_variants(size_label,color,is_active), product_tags(tag), product_collections(collections(name,slug)), product_occasions(occasions(name,slug))';

export async function fetchProducts(filters: ProductFilters = {}): Promise<PagedResult<Product>> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = filters.limit ?? CATALOG_PAGE_LIMIT;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const sb = getSupabase();
  if (!sb) return localFallback(filters, page, limit);

  try {
    let query = sb.from('products').select(SELECT, { count: 'exact' }).eq('is_active', true);
    if (filters.category && filters.category !== 'All') query = query.eq('category', filters.category);
    if (typeof filters.minPrice === 'number') query = query.gte('price_int', filters.minPrice);
    if (typeof filters.maxPrice === 'number' && Number.isFinite(filters.maxPrice)) query = query.lte('price_int', filters.maxPrice);
    if (filters.availability === 'in-stock') query = query.eq('is_out_of_stock', false).neq('availability', 'Sold Out');
    if (filters.availability === 'limited') query = query.eq('availability', 'Limited Pieces');

    const term = filters.search?.trim();
    if (term) {
      const sanitized = term.replace(/[':(),&|!]/g, ' ').split(/\s+/).filter(Boolean).join(' & ');
      if (sanitized) query = query.textSearch('search_tsv', sanitized, { type: 'plain', config: 'english' });
    }

    if (filters.sort === 'price-low') query = query.order('price_int', { ascending: true });
    else if (filters.sort === 'price-high') query = query.order('price_int', { ascending: false });
    else if (filters.sort === 'newest') query = query.order('created_at', { ascending: false });
    else query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

    query = query.range(from, to);
    const { data, error, count } = await query;
    if (error) throw error;
    let rows = ((data ?? []) as unknown as JoinedRow[]).map(mapJoined);

    if (term && rows.length === 0) {
      const like = `%${term.replace(/[%_]/g, '')}%`;
      const fb = await sb
        .from('products')
        .select(SELECT, { count: 'exact' })
        .eq('is_active', true)
        .or(`name.ilike.${like},description.ilike.${like},category.ilike.${like}`)
        .range(from, to);
      if (fb.error) throw fb.error;
      rows = ((fb.data ?? []) as unknown as JoinedRow[]).map(mapJoined);
    }

    // Occasion/collection come from junction tables (now selected above).
    // Post-filter client-side since PostgREST cannot filter nested many-to-many in one query.
    let filtered = rows;
    if (filters.occasion && filters.occasion !== 'All') filtered = filtered.filter((p) => p.occasion === filters.occasion);
    if (filters.collection && filters.collection !== 'All') filtered = filtered.filter((p) => p.collection === filters.collection);

    const total = count ?? filtered.length;
    return { data: filtered, count: total, page, limit, hasMore: from + filtered.length < total };
  } catch (err) {
    console.warn('[productsApi] Supabase list failed, local fallback:', err);
    return localFallback(filters, page, limit);
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const sb = getSupabase();
  if (!sb) return productsData.find((p) => p.slug === slug) ?? null;
  try {
    const { data, error } = await sb.from('products').select(SELECT).eq('slug', slug).eq('is_active', true).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapJoined(data as unknown as JoinedRow);
  } catch (err) {
    console.warn('[productsApi] getBySlug failed, fallback:', err);
    return productsData.find((p) => p.slug === slug) ?? null;
  }
}

export async function searchProducts(term: string, limit = CATALOG_PAGE_LIMIT): Promise<Product[]> {
  const q = term.trim().replace(/[%_]/g, '');
  if (!q) return [];
  const sb = getSupabase();
  if (!sb) {
    const needle = q.toLowerCase();
    return productsData
      .filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle) ||
          p.tags?.some((t) => t.toLowerCase().includes(needle)),
      )
      .slice(0, limit);
  }
  try {
    const like = `%${q}%`;
    const { data, error } = await sb
      .from('products')
      .select(SELECT)
      .eq('is_active', true)
      .or(`name.ilike.${like},description.ilike.${like}`)
      .order('is_bestseller', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return ((data ?? []) as unknown as JoinedRow[]).map(mapJoined);
  } catch (err) {
    console.warn('[productsApi] search failed, fallback:', err);
    return [];
  }
}

export async function fetchRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const sb = getSupabase();
  if (!sb) {
    return productsData
      .filter((p) => p.id !== product.id && (p.category === product.category || p.occasion === product.occasion))
      .slice(0, limit);
  }
  try {
    const { data, error } = await sb
      .from('products')
      .select(SELECT)
      .eq('is_active', true)
      .neq('id', product.id)
      .or(`category.eq.${product.category}`)
      .limit(limit);
    if (error) throw error;
    const rows = ((data ?? []) as unknown as JoinedRow[]).map(mapJoined);
    if (rows.length > 0) return rows;
    return productsData.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit);
  } catch (err) {
    console.warn('[productsApi] related failed, fallback:', err);
    return productsData.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit);
  }
}

function localFallback(f: ProductFilters, page: number, limit: number): PagedResult<Product> {
  let result = [...productsData];
  const q = f.search?.toLowerCase().trim();
  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (f.category && f.category !== 'All') result = result.filter((p) => p.category === f.category);
  if (f.occasion && f.occasion !== 'All') result = result.filter((p) => p.occasion === f.occasion);
  if (f.collection && f.collection !== 'All') result = result.filter((p) => p.collection === f.collection);
  if (typeof f.minPrice === 'number') result = result.filter((p) => p.price >= (f.minPrice as number));
  if (typeof f.maxPrice === 'number' && Number.isFinite(f.maxPrice)) result = result.filter((p) => p.price <= (f.maxPrice as number));
  if (f.availability === 'in-stock') result = result.filter((p) => !p.isOutOfStock && p.availability !== 'Sold Out');
  if (f.availability === 'limited') result = result.filter((p) => p.availability === 'Limited Pieces');
  if (f.sort === 'price-low') result.sort((a, b) => a.price - b.price);
  else if (f.sort === 'price-high') result.sort((a, b) => b.price - a.price);
  const from = (page - 1) * limit;
  const slice = result.slice(from, from + limit);
  return { data: slice, count: result.length, page, limit, hasMore: from + slice.length < result.length };
}
