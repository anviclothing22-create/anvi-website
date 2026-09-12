import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useLocation } from 'wouter';
import { productsData as staticProducts } from '../../data/products';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import { searchProducts } from '../../lib/productsApi';
import { ProductCard } from '../product/ProductCard';
import { SearchSkeleton } from '../skeleton';
import { useSearch } from '../../hooks/useSearch';
import { useScrollLock } from '../../hooks/useScrollLock';
import type { Product } from '../../lib/types';
import './SearchModal.css';

const TRENDING_SEARCHES = [
  'Ajrakh Chanderi Saree',
  'Indigo Co-ord Set',
  'Festive Kanjeevaram',
  'Bagru Cotton Salwar',
  'Linen Workwear',
  'Zardozi 3-Piece Set',
];

const ALL_SUGGESTION_PHRASES = [
  'Ajrakh Chanderi Silk Saree',
  'Handloom Silk Sarees',
  'Indigo Co-ord Set',
  'Festive Kanjeevaram',
  'Bagru Cotton Salwar',
  'Linen Workwear',
  'Zardozi 3-Piece Set',
  'Mulberry Silk Saree',
  'Chanderi Silk',
  'Pure Cotton',
  'Festive Edit',
  'Bestsellers',
];

const POPULAR_CATEGORIES = [
  'Sarees',
  'Salwars',
  'Co-ord Sets',
  '3-Piece Sets',
  'Kidswear',
];

/**
 * ANVI Premium Product Search Experience
 * Luxury Editorial Search Modal with real-time suggestions, multi-domain search,
 * and canonical ProductCard integration across all states.
 */
export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useSearch();
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live catalog with bundled fallback (works offline)
  const liveProducts = useLiveProducts();
  const catalog = liveProducts.length > 0 ? liveProducts : staticProducts;
  const [serverResults, setServerResults] = useState<Product[] | null>(null);

  // Server full-text fallback: when live-list filter finds nothing,
  // try Supabase textSearch (handles stemming / large catalogs beyond live window).
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setServerResults(null);
      return;
    }
    const inMemoryHits = catalog.filter((product) => {
      const needle = q.toLowerCase();
      return (
        product.name.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle)
      );
    });
    if (inMemoryHits.length > 0) {
      setServerResults(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      void searchProducts(q, 12)
        .then((rows) => {
          if (!cancelled) setServerResults(rows);
        })
        .catch(() => {
          if (!cancelled) setServerResults(null);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQuery, catalog]);

  // Lock background scrolling while search modal is open
  useScrollLock(isSearchOpen);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Handle ESC key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  };

  // Clear loading state after simulated brief debounce
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Real-time matched auto-complete suggestions
  const matchingPhrases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_SUGGESTION_PHRASES.filter((phrase) => phrase.toLowerCase().includes(q)).slice(0, 4);
  }, [searchQuery]);

  // Multi-Domain Search Engine (live catalog, static fallback, server full-text)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const local = catalog.filter((product) => {
      // 1. Product Name
      if (product.name.toLowerCase().includes(q)) return true;

      // 2. Category
      if (product.category.toLowerCase().includes(q)) return true;

      // 3. Collection
      if (product.collection && product.collection.toLowerCase().includes(q)) return true;

      // 4. Occasion Terms
      if (product.occasion && product.occasion.toLowerCase().includes(q)) return true;

      // 5. Description & Tags
      if (product.description.toLowerCase().includes(q)) return true;
      if (product.tags?.some((tag) => tag.toLowerCase().includes(q))) return true;

      return false;
    });
    if (local.length > 0) return local;
    return serverResults ?? [];
  }, [searchQuery, catalog, serverResults]);

  // Curated fallback products for no-query or no-results
  const curatedProducts = useMemo(() => {
    return catalog.slice(0, 4);
  }, [catalog]);

  if (!isSearchOpen) return null;

  const handleProductSelect = (_product: Product) => {
    closeSearch();
  };

  const handleViewAllInShop = () => {
    closeSearch();
    setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleCategorySelect = (category: string) => {
    setSearchQuery(category);
  };

  return (
    <div
      className="anvi-search-modal-backdrop"
      onClick={closeSearch}
      role="dialog"
      aria-modal="true"
      aria-label="Search catalog"
    >
      <div
        className="anvi-search-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================
            1. SEARCH INPUT ROW
            ============================================================ */}
        <div className="anvi-search-input-row">
          <Search size={24} strokeWidth={1.35} className="anvi-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by silhouette, occasion, weave or collection..."
            className="anvi-search-input"
            aria-label="Search products"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => handleQueryChange('')}
              className="anvi-search-clear-btn"
              aria-label="Clear query"
            >
              ×
            </button>
          )}

          <button
            type="button"
            onClick={closeSearch}
            className="anvi-search-close-btn"
            aria-label="Close search"
          >
            <span>Close</span>
            <span className="anvi-search-esc-tag">ESC</span>
          </button>
        </div>

        {/* Real-time matched auto-complete suggestions */}
        {searchQuery.trim() && matchingPhrases.length > 0 && (
          <div className="anvi-search-chips-row" style={{ padding: '8px 0 16px', borderBottom: '1px solid rgba(47, 43, 43, 0.06)' }}>
            <span style={{ fontSize: 11, color: 'rgba(47, 43, 43, 0.5)', fontFamily: 'var(--font-sans)', alignSelf: 'center' }}>
              Suggestions:
            </span>
            {matchingPhrases.map((phrase) => (
              <button
                key={phrase}
                type="button"
                className="anvi-search-chip"
                onClick={() => handleQueryChange(phrase)}
              >
                <span style={{ fontSize: 9, color: 'var(--color-champagne-gold)' }}>✦</span>
                <span>{phrase}</span>
              </button>
            ))}
          </div>
        )}

        {/* ============================================================
            2. NO QUERY: TRENDING SUGGESTIONS & CURATED EDIT
            ============================================================ */}
        {!searchQuery.trim() && (
          <div className="anvi-search-suggestions-wrap">
            {/* Trending Searches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="anvi-search-section-title">Trending Searches</span>
              <div className="anvi-search-chips-row">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="anvi-search-chip"
                    onClick={() => handleQueryChange(term)}
                  >
                    <span style={{ fontSize: 9, color: 'var(--color-champagne-gold)' }}>✦</span>
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="anvi-search-section-title">Browse by Category</span>
              <div className="anvi-search-category-chips">
                {POPULAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="anvi-search-category-chip"
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Curated Pieces Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
              <span className="anvi-search-section-title">Curated For You</span>
              <div className="anvi-search-grid" role="list">
                {curatedProducts.map((product) => (
                  <div key={product.id} role="listitem">
                    <ProductCard
                      product={product}
                      onCardClick={handleProductSelect}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            3. LOADING STATE
            ============================================================ */}
        {searchQuery.trim() && isLoading && (
          <SearchSkeleton />
        )}

        {/* ============================================================
            4. RESULTS STATE
            ============================================================ */}
        {searchQuery.trim() && !isLoading && searchResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="anvi-search-results-meta">
              <span className="anvi-search-results-count">
                Found <strong>{searchResults.length}</strong> {searchResults.length === 1 ? 'piece' : 'pieces'} for "{searchQuery}"
              </span>
              <button
                type="button"
                onClick={handleViewAllInShop}
                className="anvi-search-view-all-link"
              >
                View all in catalogue →
              </button>
            </div>

            <div className="anvi-search-grid" role="list">
              {searchResults.map((product) => (
                <div key={product.id} role="listitem">
                  <ProductCard
                    product={product}
                    onCardClick={handleProductSelect}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            5. NO RESULTS STATE
            ============================================================ */}
        {searchQuery.trim() && !isLoading && searchResults.length === 0 && (
          <div className="anvi-search-no-results">
            <span className="anvi-search-no-results-glyph" aria-hidden="true">✦</span>
            <h3 className="anvi-search-no-results-title">
              No pieces found for "{searchQuery}"
            </h3>
            <p className="anvi-search-no-results-desc">
              We couldn't find exact matches for your search. Explore our most cherished categories or curated handlooms below:
            </p>

            {/* Category Suggestions */}
            <div className="anvi-search-category-chips" style={{ justifyContent: 'center' }}>
              {POPULAR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="anvi-search-category-chip"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Recommended Alternatives */}
            <div style={{ width: '100%', marginTop: 24 }}>
              <span
                className="anvi-search-section-title"
                style={{ display: 'block', marginBottom: 12, textAlign: 'left' }}
              >
                Recommended Heirlooms You May Love
              </span>
              <div className="anvi-search-grid" role="list">
                {curatedProducts.map((product) => (
                  <div key={product.id} role="listitem">
                    <ProductCard
                      product={product}
                      onCardClick={handleProductSelect}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
