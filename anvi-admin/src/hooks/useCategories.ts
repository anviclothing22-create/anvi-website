import { useState, useCallback, useEffect } from 'react';
import { initialMockCategories } from '../data/mockCategories';
import type { Category, CategoryFormData } from '../types/category';
import { generateUUID, isUUID, slugify } from '../lib/utils';
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

  // Fetch live categories from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function loadLiveCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0 && !cancelled) {
          const mapped: Category[] = data.map((c: any) => normalizeCategory({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.short_description || c.description || '',
            imageUrl: c.image_url || '/assets/brand/anvi-logo.svg',
            image: c.image_url || '/assets/brand/anvi-logo.svg',
            order: c.display_order ?? 1,
            displayOrder: c.display_order ?? 1,
            isActive: c.is_active ?? true,
            productCount: 0,
          }));
          setCategories(mapped);
          setStoredItem(STORAGE_KEYS.CATEGORIES, mapped, 'CATEGORIES_UPDATED');
        }
      } catch (err) {
        console.warn('[useCategories] Load live categories error:', err);
      }
    }
    loadLiveCategories();
    return () => {
      cancelled = true;
    };
  }, []);

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
    const catId = generateUUID();
    const newCat: Category = normalizeCategory({
      ...formData,
      id: catId,
      slug: formData.slug || slugify(formData.name),
      productCount: 0,
      isActive: formData.isActive ?? true,
    });
    const updated = [...categories, newCat];
    saveCategories(updated);

    try {
      void supabase.from('categories').insert({
        id: catId,
        name: newCat.name,
        slug: newCat.slug,
        short_description: newCat.description || '',
        image_url: newCat.imageUrl || null,
        is_active: newCat.isActive ?? true,
      }).then(({ error }) => {
        if (error) console.error('[useCategories] Supabase insert category error:', error);
      });
    } catch (err) {
      console.warn('[useCategories] Supabase insert category exception:', err);
    }

    return newCat;
  }, [categories]);

  const updateCategory = useCallback((id: string, formData: Partial<CategoryFormData>) => {
    const updated = categories.map((c) => (c.id === id ? normalizeCategory({ ...c, ...formData }) : c));
    saveCategories(updated);

    try {
      const cat = updated.find(c => c.id === id);
      if (cat) {
        const payload = {
          name: cat.name,
          slug: cat.slug,
          short_description: cat.description || '',
          image_url: cat.imageUrl || null,
          is_active: cat.isActive ?? true,
        };
        const query = isUUID(id)
          ? supabase.from('categories').update(payload).eq('id', id)
          : supabase.from('categories').update(payload).or(`slug.eq.${cat.slug},id.eq.${id}`);
        void query.then(({ error }) => {
          if (error) console.error('[useCategories] Supabase update category error:', error);
        });
      }
    } catch (err) {
      console.warn('[useCategories] Supabase update category exception:', err);
    }
  }, [categories]);

  const toggleCategoryStatus = useCallback((id: string, currentStatus?: boolean) => {
    const nextStatus = !currentStatus;
    const updated = categories.map((c) => (c.id === id ? { ...c, isActive: nextStatus } : c));
    saveCategories(updated);

    try {
      const query = isUUID(id)
        ? supabase.from('categories').update({ is_active: nextStatus }).eq('id', id)
        : supabase.from('categories').update({ is_active: nextStatus }).or(`slug.eq.${id},id.eq.${id}`);
      void query.then(({ error }) => {
        if (error) console.error('[useCategories] Supabase toggle category error:', error);
      });
    } catch (err) {
      console.warn('[useCategories] Supabase toggle category exception:', err);
    }
  }, [categories]);

  const deleteCategory = useCallback((id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    saveCategories(updated);

    try {
      const query = isUUID(id)
        ? supabase.from('categories').delete().eq('id', id)
        : supabase.from('categories').delete().or(`slug.eq.${id},id.eq.${id}`);
      void query.then(({ error }) => {
        if (error) console.error('[useCategories] Supabase delete category error:', error);
      });
    } catch (err) {
      console.warn('[useCategories] Supabase delete category exception:', err);
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

