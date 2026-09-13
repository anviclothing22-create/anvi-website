import { useState, useCallback, useMemo, useEffect } from 'react';
import { initialMockProducts } from '../data/mockProducts';
import type { Product, ProductFormData } from '../types/product';
import { generateUUID, isUUID } from '../lib/utils';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../lib/storeSync';
import { supabase } from '../lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => {
    return getStoredItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialMockProducts);
  });

  // Fetch live products from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function loadLiveProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(url,is_primary,display_order)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0 && !cancelled) {
          const mapped: Product[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku || `ANV-${String(p.id).slice(0, 4).toUpperCase()}`,
            category: p.category || 'Sarees',
            categorySlug: (p.category || 'Sarees').toLowerCase().replace(/\s+/g, '-'),
            price: p.price_int ?? p.price ?? 0,
            originalPrice: p.original_price_int ?? p.originalPrice ?? undefined,
            stock: 15,
            stockQuantity: 15,
            description: p.description || '',
            fabric: p.fabric || undefined,
            images: p.product_images && p.product_images.length > 0
              ? p.product_images
                  .slice()
                  .sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order)
                  .map((img: any) => img.url)
              : ['/images/products/saree_ajrakh_1.jpg'],
            tags: [],
            isActive: p.is_active ?? true,
            isNewArrival: p.is_new_arrival ?? false,
            isBestseller: p.is_bestseller ?? false,
            availability: p.availability || (p.is_out_of_stock ? 'Out of Stock' : 'In Stock'),
            createdAt: p.created_at,
          }));
          setProducts(mapped);
          setStoredItem(STORAGE_KEYS.PRODUCTS, mapped, 'PRODUCTS_UPDATED');
        }
      } catch (err) {
        console.warn('[useProducts] Load live products error:', err);
      }
    }

    void loadLiveProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // Keep in sync with storefront across ports
    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'PRODUCTS_UPDATED') {
        const fresh = getStoredItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialMockProducts);
        setProducts(fresh);
      }
    });
    return unsubscribe;
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('All');

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    setStoredItem(STORAGE_KEYS.PRODUCTS, updated, 'PRODUCTS_UPDATED');
  };

  const addProduct = useCallback((formData: ProductFormData) => {
    const rawImages = formData.images || [];
    const normalizedImages = rawImages.length > 0
      ? rawImages
      : ['/images/products/saree_ajrakh_1.jpg'];

    const productId = generateUUID();
    const newProduct: Product = {
      ...formData,
      id: productId,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: formData.category || (formData.categorySlug ? formData.categorySlug.replace('-', ' ') : 'Sarees'),
      categorySlug: formData.categorySlug || (formData.category ? formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'sarees'),
      price: Number(formData.price || 0),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stock: formData.stock ?? formData.stockQuantity ?? 15,
      stockQuantity: formData.stockQuantity ?? formData.stock ?? 15,
      images: normalizedImages,
      tags: formData.tags || [],
      createdAt: new Date().toISOString(),
      isActive: formData.isActive ?? true,
    };
    const updated = [newProduct, ...products];
    saveProducts(updated);

    // Asynchronously replicate to Supabase
    try {
      void supabase.from('products').insert({
        id: productId,
        name: newProduct.name,
        slug: newProduct.slug,
        sku: newProduct.sku,
        category: newProduct.category,
        price_int: newProduct.price,
        original_price_int: newProduct.originalPrice ?? null,
        description: newProduct.description || '',
        fabric: newProduct.fabric || null,
        is_active: newProduct.isActive ?? true,
        is_bestseller: newProduct.isBestseller ?? false,
        is_new_arrival: newProduct.isNewArrival ?? false,
        availability: newProduct.availability || 'In Stock',
        is_out_of_stock: (newProduct.stock ?? 15) === 0,
      }).then(({ error }) => {
        if (error) {
          console.error('[useProducts] Supabase insert product error:', error);
        } else if (newProduct.images && newProduct.images.length > 0) {
          const imgs = newProduct.images.map((img: any, idx: number) => ({
            product_id: productId,
            url: typeof img === 'string' ? img : img.url,
            is_primary: idx === 0,
            display_order: idx,
          }));
          void supabase.from('product_images').insert(imgs);
        }
      });
    } catch (err) {
      console.warn('[useProducts] Supabase insert product exception:', err);
    }

    return newProduct;
  }, [products]);

  const updateProduct = useCallback((id: string, formData: Partial<ProductFormData>) => {
    let targetUpdatedProduct: Product | undefined;
    const updated = products.map((p) => {
      if (p.id !== id) return p;
      const updatedP: Product = {
        ...p,
        ...formData,
        price: formData.price !== undefined ? Number(formData.price) : p.price,
        originalPrice: formData.originalPrice !== undefined ? Number(formData.originalPrice) : p.originalPrice,
        stock: formData.stock ?? formData.stockQuantity ?? p.stock,
        stockQuantity: formData.stockQuantity ?? formData.stock ?? p.stockQuantity,
      };
      targetUpdatedProduct = updatedP;
      return updatedP;
    });
    saveProducts(updated);

    // Asynchronously replicate to Supabase
    if (targetUpdatedProduct) {
      const p = targetUpdatedProduct;
      try {
        const payload = {
          name: p.name,
          price_int: p.price,
          original_price_int: p.originalPrice ?? null,
          description: p.description || '',
          category: p.category,
          fabric: p.fabric || null,
          is_active: p.isActive ?? true,
          is_bestseller: p.isBestseller ?? false,
          is_new_arrival: p.isNewArrival ?? false,
          availability: p.availability || 'In Stock',
          is_out_of_stock: (p.stockQuantity ?? p.stock ?? 15) === 0,
        };

        const updateQuery = isUUID(id)
          ? supabase.from('products').update(payload).eq('id', id)
          : supabase.from('products').update(payload).or(`legacy_id.eq.${id},slug.eq.${p.slug}`);

        void updateQuery.then(({ error }) => {
          if (error) console.error('[useProducts] Supabase update product error:', error);
        });

        if (p.images && p.images.length > 0 && isUUID(id)) {
          const imgs = p.images.map((img: any, idx: number) => ({
            product_id: id,
            url: typeof img === 'string' ? img : img.url,
            is_primary: idx === 0,
            display_order: idx,
          }));
          void supabase.from('product_images').delete().eq('product_id', id).then(() => {
            void supabase.from('product_images').insert(imgs);
          });
        }
      } catch (err) {
        console.warn('[useProducts] Supabase update product exception:', err);
      }
    }
  }, [products]);

  const toggleProductStatus = useCallback((id: string, currentStatus?: boolean) => {
    const nextStatus = !currentStatus;
    const updated = products.map((p) => (p.id === id ? { ...p, isActive: nextStatus } : p));
    saveProducts(updated);

    try {
      const query = isUUID(id)
        ? supabase.from('products').update({ is_active: nextStatus }).eq('id', id)
        : supabase.from('products').update({ is_active: nextStatus }).or(`legacy_id.eq.${id},id.eq.${id}`);
      void query.then(({ error }) => {
        if (error) console.error('[useProducts] Supabase toggle status error:', error);
      });
    } catch (err) {
      console.warn('[useProducts] Supabase toggle status exception:', err);
    }
  }, [products]);

  const deleteProduct = useCallback((id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);

    try {
      if (isUUID(id)) {
        void supabase.from('product_images').delete().eq('product_id', id).then(() => {
          void supabase.from('products').delete().eq('id', id);
        });
      } else {
        void supabase.from('products').delete().or(`legacy_id.eq.${id},slug.eq.${id}`);
      }
    } catch (err) {
      console.warn('[useProducts] Supabase delete product exception:', err);
    }
  }, [products]);

  const refreshProducts = useCallback(() => {
    const saved = getStoredItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialMockProducts);
    setProducts(saved);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const itemStock = item.stockQuantity ?? item.stock ?? 0;
      const matchesStock =
        selectedStockStatus === 'All' ||
        (selectedStockStatus === 'Low Stock' && itemStock <= 3 && itemStock > 0) ||
        (selectedStockStatus === 'Out of Stock' && itemStock === 0) ||
        (selectedStockStatus === 'In Stock' && itemStock > 3);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, selectedStockStatus]);

  return {
    products,
    filteredProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStockStatus,
    setSelectedStockStatus,
    addProduct,
    updateProduct,
    toggleProductStatus,
    deleteProduct,
    refreshProducts,
  };
}
