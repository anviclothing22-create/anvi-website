/**
 * ANVI CLOTHING — V2 CORE DATA TYPES
 * Master Specification Section 39 Alignment
 */

export type ProductCategory = 
  | 'Sarees'
  | 'Salwars'
  | 'Co-ord Sets'
  | '3-Piece Sets'
  | 'Kidswear';

export type ProductOccasion = 
  | 'Everyday'
  | 'Office'
  | 'Festive';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  availability?: 'In Stock' | 'Limited Pieces' | 'Made to Order' | 'Sold Out';
  variants?: string[];
  tags?: string[];
  collection?: string;
  occasion?: ProductOccasion;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isOutOfStock?: boolean;
  isOnSale?: boolean;
  stock?: number;
  fabric?: string;
  care?: string;
  details?: string[];
  measurements?: Record<string, string>;
}
