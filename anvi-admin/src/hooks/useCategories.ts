import { useState, useCallback, useEffect } from 'react';
import { initialMockCategories } from '../data/mockCategories';
import type { Category, CategoryFormData } from '../types/category';
import { generateId, slugify } from '../lib/utils';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';
import { supabase } from '../lib/supabase';

const normalizeCategory = (c: any): Category => ({
  ...c,
  description: c.description || '',
  imageUrl: c.imageUrl || c.image || '/assets/brand/anvi-logo.svg',
  image: c.image || c.imageUrl || '/assets/brand/anvi-logo.svg',
  order: c.order ?? c.displayOrder ?? 1,
  displayOrder: c.displayOrder ?? c.order ?? 1,
  isActive: c.isActive ?? true,
});

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => {
    const raw = getStoredItem<any[]>(STORAGE_KEYS.CATEGORIES, initialMockCategories);
    return raw.map(normalizeCategory);
  });

  useEffect(() => {
    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'CATEGORIES_UPDATED') {
        const raw = getStoredItem<any[]>(STORAGE_KEYS.CATEGORIES, initialMockCategories);
        setCategories(raw.map(normalizeCategory));
      }
    });
    return unsubscribe;
  }, []);

  const saveCategories = (updated: Category[]) => {
    setCategories(updated);
    setStoredItem(STORAGE_KEYS.CATEGORIES, updated, 'CATEGORIES_UPDATED');
  };

  const addCategory = useCallback((formData: CategoryFormData) => {
    const newCat: Category = normalizeCategory({
      ...formData,
      id: generateId('cat'),
      slug: formData.slug || slugify(formData.name),
      productCount: 0,
      isActive: formData.isActive ?? true,
    });
    const updated = [...categories, newCat];
    saveCategories(updated);

    try {
      void supabase.from('categories').insert({
        id: newCat.id,
        name: newCat.name,
        slug: newCat.slug,
        short_description: newCat.description || '',
        image_url: newCat.imageUrl || null,
        is_active: newCat.isActive ?? true,
      });
    } catch {
      // ignore
    }

    return newCat;
  }, [categories]);

  const updateCategory = useCallback((id: string, formData: Partial<CategoryFormData>) => {
    const updated = categories.map((c) => (c.id === id ? normalizeCategory({ ...c, ...formData }) : c));
    saveCategories(updated);

    try {
      const cat = updated.find(c => c.id === id);
      if (cat) {
        void supabase.from('categories').update({
          name: cat.name,
          slug: cat.slug,
          short_description: cat.description || '',
          image_url: cat.imageUrl || null,
          is_active: cat.isActive ?? true,
        }).eq('id', id);
      }
    } catch {
      // ignore
    }
  }, [categories]);

  const toggleCategoryStatus = useCallback((id: string, currentStatus?: boolean) => {
    const nextStatus = !currentStatus;
    const updated = categories.map((c) => (c.id === id ? { ...c, isActive: nextStatus } : c));
    saveCategories(updated);

    try {
      void supabase.from('categories').update({ is_active: nextStatus }).eq('id', id);
    } catch {
      // ignore
    }
  }, [categories]);

  const deleteCategory = useCallback((id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    saveCategories(updated);

    try {
      void supabase.from('categories').delete().eq('id', id);
    } catch {
      // ignore
    }
  }, [categories]);

  const refreshCategories = useCallback(() => {
    const raw = getStoredItem<any[]>(STORAGE_KEYS.CATEGORIES, initialMockCategories);
    setCategories(raw.map(normalizeCategory));
  }, []);

  return {
    categories,
    addCategory,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory,
    refreshCategories,
  };
}
