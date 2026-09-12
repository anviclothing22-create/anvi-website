import { ProductFormData } from '@/types/product';

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateRequired(value: string | number | undefined | null): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

export function validatePositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

export function validateProductForm(data: Partial<ProductFormData>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Product title is required';
  }

  if (!data.sku || !data.sku.trim()) {
    errors.sku = 'SKU identifier code is required';
  }

  if (data.price === undefined || data.price <= 0) {
    errors.price = 'Selling price must be greater than zero';
  }

  return errors;
}
