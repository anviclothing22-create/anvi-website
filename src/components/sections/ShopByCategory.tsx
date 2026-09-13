import React, { useState, useEffect } from 'react';
import { categoriesData, type Category } from '../../data/categories';
import { CategoryCard } from '../ui/CategoryCard';
import { STORAGE_KEYS, getStoredItem, subscribeToStoreUpdates } from '../../lib/storeSync';
import { getSupabase } from '../../lib/supabaseClient';
import './ShopByCategory.css';


export interface ShopByCategoryProps {
  categories?: Category[];
  heading?: string;
  subtext?: string;
  onCategoryClick?: (category: Category) => void;
}

function normalizeStorefrontCategory(c: any): Category {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    image: c.image || c.imageUrl || '/images/categories/sarees.jpg',
    shortDescription: c.shortDescription || c.description || '',
    featured: Boolean(c.featured || c.name?.toLowerCase().includes('saree')),
  };
}

/**
 * SHOP BY CATEGORY SECTION
 * Dynamically synchronized with Supabase & Admin Command.
 */
export const ShopByCategory: React.FC<ShopByCategoryProps> = ({
  categories: propCategories,
  heading = 'FIND YOUR ANVI',
  subtext,
  onCategoryClick,
}) => {
  const [liveCategories, setLiveCategories] = useState<Category[]>(() => {
    if (propCategories) return propCategories;
    const stored = getStoredItem<any[]>(STORAGE_KEYS.CATEGORIES, []);
    return stored.length > 0 ? stored.map(normalizeStorefrontCategory) : categoriesData;
  });

  // Fetch live categories from Supabase
  useEffect(() => {
    if (propCategories) return;
    let cancelled = false;
    const sb = getSupabase();
    if (sb) {
      (async () => {
        try {
          const { data, error } = await sb
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });
          if (!error && data && data.length > 0 && !cancelled) {
            setLiveCategories(data.map((c: any) => normalizeStorefrontCategory({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.short_description || c.description || '',
              imageUrl: c.image_url || '/images/products/saree_ajrakh_1.jpg',
              featured: Boolean(c.featured),
            })));
          }
        } catch {
          // ignore network failure, fallback to initial state
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [propCategories]);

  useEffect(() => {
    if (propCategories) return;
    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'CATEGORIES_UPDATED') {
        const stored = getStoredItem<any[]>(STORAGE_KEYS.CATEGORIES, []);
        if (stored.length > 0) {
          setLiveCategories(stored.map(normalizeStorefrontCategory));
        }
      }
    });
    return unsubscribe;
  }, [propCategories]);

  const categories = propCategories || liveCategories;
  const featuredCategory = categories.find((c) => c.featured) || categories[0];
  const otherCategories = featuredCategory ? categories.filter((c) => c.id !== featuredCategory.id) : categories;

  return (
    <section className="anvi-category-section" aria-labelledby="category-section-heading">
      <div className="anvi-category-container">
        {/* Section Header */}
        <div className="anvi-category-header">
          <span className="anvi-category-section-eyebrow">Distinct Silhouettes</span>
          <h2 id="category-section-heading" className="anvi-category-section-heading">
            {heading}
          </h2>
          {subtext && <p className="anvi-category-section-subtext">{subtext}</p>}
        </div>

        {/* Editorial Multi-Column Composition */}
        <div className="anvi-category-layout">
          {/* Left Column: Featured Category (Sarees) */}
          {featuredCategory && (
            <div className="anvi-category-featured-col">
              <CategoryCard
                category={featuredCategory}
                featured={true}
                onCategoryClick={onCategoryClick}
              />
            </div>
          )}

          {/* Right Column: 2x2 Grid (Salwars, Co-ords, 3-Piece, Kidswear) */}
          <div className="anvi-category-grid-col">
            {otherCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                featured={false}
                onCategoryClick={onCategoryClick}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
