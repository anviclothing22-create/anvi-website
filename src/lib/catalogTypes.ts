import type { Product, ProductCategory, ProductOccasion } from './types';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  image_url: string | null;
  featured: boolean;
}

/** PostgREST row (snake_case). Money is integer rupees (*_int). */
export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category_id: string | null;
  category: ProductCategory;
  price_int: number;
  original_price_int: number | null;
  description: string;
  availability: NonNullable<Product['availability']>;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_on_sale: boolean;
  is_out_of_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  fabric: string | null;
  fabric_care: string | null;
  care_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  url: string;
  alt: string | null;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariantRow {
  size_label: string;
  color: string | null;
  is_active: boolean;
}

export type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high';

export interface ProductFilters {
  category?: ProductCategory | 'All';
  occasion?: ProductOccasion | 'All';
  collection?: string | 'All';
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: 'all' | 'in-stock' | 'limited';
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface PagedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

function deriveAvailabilityFromRow(row: ProductRow): NonNullable<Product['availability']> {
  const raw = row.availability as string;
  if (row.is_out_of_stock || raw === 'Sold Out' || raw === 'Out of Stock') return 'Sold Out';
  if (raw === 'Limited Pieces' || raw === 'Made to Order') return raw as NonNullable<Product['availability']>;
  return 'In Stock';
}

/** Row → storefront Product (matches src/lib/types.ts). Images/variants/tags merged by caller when joined. */
export function toStorefrontProduct(
  row: ProductRow,
  opts?: { images?: string[]; variants?: string[]; tags?: string[]; collection?: string; occasion?: ProductOccasion; stock?: number },
): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price_int,
    originalPrice: row.original_price_int ?? undefined,
    images: opts?.images && opts.images.length > 0 ? opts.images : ['/images/products/saree_ajrakh_1.jpg'],
    description: row.description,
    availability: deriveAvailabilityFromRow(row),
    variants: opts?.variants && opts.variants.length > 0 ? opts.variants : ['Free Size'],
    tags: opts?.tags ?? [],
    collection: opts?.collection ?? 'New Arrivals',
    occasion: opts?.occasion ?? 'Festive',
    isNewArrival: row.is_new_arrival,
    isBestseller: row.is_bestseller,
    isOutOfStock: row.is_out_of_stock,
    isOnSale: row.is_on_sale,
    stock: opts?.stock,
    fabric: row.fabric ?? undefined,
    care: row.fabric_care ?? row.care_instructions ?? undefined,
  };
}
