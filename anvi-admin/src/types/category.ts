export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  imageUrl?: string;
  productCount?: number;
  featured?: boolean;
  order?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export type CategoryFormData = {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  featured?: boolean;
  order?: number;
  displayOrder?: number;
  isActive?: boolean;
};
