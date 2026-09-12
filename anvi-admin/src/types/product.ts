export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  categorySlug?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  stockQuantity?: number;
  images: (string | ProductImage)[];
  description: string;
  fabric?: string;
  fabricCare?: string;
  careInstructions?: string;
  variants?: string[];
  sizes?: string[];
  colors?: string[];
  tags: string[];
  collection?: string;
  collections?: string[];
  occasion?: string;
  occasions?: string[];
  availability?: 'In Stock' | 'Limited Pieces' | 'Out of Stock';
  isActive?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  pattern?: string;
  createdAt?: string;
}

export type ProductFormData = Partial<Product> & {
  name: string;
  description: string;
  price: number;
  sku: string;
};
