import React, { useState, useMemo, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useLiveProducts } from '../hooks/useLiveProducts';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/skeleton';
import { ErrorState } from '../components/ui';
import { useScrollLock } from '../hooks/useScrollLock';
import type { Product, ProductCategory, ProductOccasion } from '../lib/types';
import './ShopPage.css';

export type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high';

export interface ShopPageProps {
  initialCategory?: ProductCategory | 'All';
  initialOccasion?: ProductOccasion | 'All';
  initialCollection?: string;
}

const CATEGORIES: Array<ProductCategory | 'All'> = [
  'All',
  'Sarees',
  'Salwars',
  'Co-ord Sets',
  '3-Piece Sets',
  'Kidswear',
];

const OCCASIONS: Array<ProductOccasion | 'All'> = [
  'All',
  'Everyday',
  'Office',
  'Festive',
];

const COLLECTIONS = [
  'All',
  'New Arrivals',
  'Bestsellers',
  'The ANVI Edit',
  'Festive Edit',
  'Premium',
];

const SLUG_TO_CATEGORY: Record<string, ProductCategory> = {
  sarees: 'Sarees',
  salwars: 'Salwars',
  'co-ord-sets': 'Co-ord Sets',
  'co-ords': 'Co-ord Sets',
  '3-piece-sets': '3-Piece Sets',
  'three-piece': '3-Piece Sets',
  kidswear: 'Kidswear',
};

const SLUG_TO_COLLECTION: Record<string, string> = {
  'new-arrivals': 'New Arrivals',
  bestsellers: 'Bestsellers',
  'the-anvi-edit': 'The ANVI Edit',
  festive: 'Festive Edit',
  'festive-edit': 'Festive Edit',
  premium: 'Premium',
};

const SLUG_TO_OCCASION: Record<string, ProductOccasion> = {
  everyday: 'Everyday',
  office: 'Office',
  festive: 'Festive',
};

const CATEGORY_EDITORIAL: Record<string, { title: string; subtitle: string }> = {
  Sarees: {
    title: 'Sarees',
    subtitle: 'Handloom mulberry silks, Chanderi weaves, and fluid drapes.',
  },
  Salwars: {
    title: 'Salwars & Kurta Sets',
    subtitle: 'Tailored Bagru prints and breathable Kota Doria sets.',
  },
  'Co-ord Sets': {
    title: 'Co-ord Sets',
    subtitle: 'Pure natural cottons and contemporary matching sets.',
  },
  '3-Piece Sets': {
    title: '3-Piece Heirloom Sets',
    subtitle: 'Coordinating dupattas, jackets, and handwoven ensembles.',
  },
  Kidswear: {
    title: 'Little ANVI',
    subtitle: 'Gentle, breathable traditional garments for little ones.',
  },
};

const COLLECTION_EDITORIAL: Record<string, { title: string; subtitle: string }> = {
  'New Arrivals': {
    title: 'New Arrivals',
    subtitle: 'Our newest silhouettes and experimental weaves, freshly crafted in limited studio runs.',
  },
  Bestsellers: {
    title: 'Bestsellers',
    subtitle: 'The timeless silhouettes and treasured weaves most cherished by our patrons across India and beyond.',
  },
  'The ANVI Edit': {
    title: 'The ANVI Edit',
    subtitle: 'A definitive curation of foundational heirloom weaves, handcrafted silks, and essential coordinates.',
  },
  'Festive Edit': {
    title: 'Festive Edit',
    subtitle: 'Luminous zari borders, royal vermilions, and celebratory heirlooms designed for unforgettable occasions.',
  },
  Premium: {
    title: 'Premium',
    subtitle: 'Couture masterpieces, rare heritage motifs, and limited artisanal commissions.',
  },
};

const OCCASION_EDITORIAL: Record<string, { title: string; subtitle: string }> = {
  Everyday: {
    title: 'Everyday',
    subtitle: 'Lightweight handwoven cottons and easy cuts designed to bring mindful grace into daily life.',
  },
  Office: {
    title: 'Office',
    subtitle: 'Refined structured kurtas, breathable tailored sets, and subdued earth tones tailored for the workplace.',
  },
  Festive: {
    title: 'Festive',
    subtitle: 'Grand drapes, rich zari accents, and radiant jewel tones tailored for poojas, weddings, and celebratory gatherings.',
  },
};

const SEARCH_SUGGESTIONS = [
  'Ajrakh Chanderi',
  'Handloom Saree',
  'Indigo Co-ord',
  'Festive Silk',
  'Cotton Salwar',
  'Zardozi',
  'Mulberry Silk',
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹3,500', min: 0, max: 3500 },
  { label: '₹3,500 – ₹7,000', min: 3500, max: 7000 },
  { label: 'Above ₹7,000', min: 7000, max: Infinity },
];

const AVAILABILITY_OPTIONS = [
  { label: 'All Items', value: 'all' },
  { label: 'In Stock Only', value: 'in-stock' },
  { label: 'Limited Editions', value: 'limited' },
];

const PAGE_SIZE = 8;

/**
 * ANVI Shop Page Catalogue
 * Connected discovery, responsive routing, dynamic editorial headers,
 * auto-suggestions, zero-results recovery, and recently viewed products.
 */
export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = 'All',
  initialOccasion = 'All',
  initialCollection = 'All',
}) => {
  const productsData = useLiveProducts();

  // Wouter Route Matches
  const [matchCat, paramsCat] = useRoute('/shop/:category');
  const [matchCol, paramsCol] = useRoute('/collections/:slug');
  const [matchOcc, paramsOcc] = useRoute('/occasions/:slug');
  const [matchSearch] = useRoute('/search');

  // Route-derived active values
  const routeCategory = matchCat && paramsCat?.category ? SLUG_TO_CATEGORY[paramsCat.category.toLowerCase()] : undefined;
  const routeCollection = matchCol && paramsCol?.slug ? SLUG_TO_COLLECTION[paramsCol.slug.toLowerCase()] : undefined;
  const routeOccasion = matchOcc && paramsOcc?.slug ? SLUG_TO_OCCASION[paramsOcc.slug.toLowerCase()] : undefined;

  // Read URL query parameters
  const queryParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const [searchQuery, setSearchQuery] = useState(() => {
    return queryParams.get('q') || queryParams.get('search') || '';
  });

  const [filterCategory, setFilterCategory] = useState<ProductCategory | 'All'>(() => {
    const fromQuery = queryParams.get('category');
    if (fromQuery && CATEGORIES.includes(fromQuery as ProductCategory)) {
      return fromQuery as ProductCategory;
    }
    return initialCategory;
  });

  const [filterOccasion, setFilterOccasion] = useState<ProductOccasion | 'All'>(() => {
    const fromQuery = queryParams.get('occasion');
    if (fromQuery) {
      const matched = OCCASIONS.find((o) => o.toLowerCase() === fromQuery.toLowerCase());
      if (matched) return matched;
    }
    return initialOccasion;
  });

  const [filterCollection, setFilterCollection] = useState<string>(() => {
    const fromQuery = queryParams.get('collection');
    if (fromQuery && COLLECTIONS.includes(fromQuery)) {
      return fromQuery;
    }
    return initialCollection;
  });

  // Effective values prioritized: user filter override, then route, then initial
  const selectedCategory = filterCategory !== 'All' ? filterCategory : (routeCategory || 'All');
  const selectedCollection = filterCollection !== 'All' ? filterCollection : (routeCollection || 'All');
  const selectedOccasion = filterOccasion !== 'All' ? filterOccasion : (routeOccasion || 'All');

  const setSelectedCategory = setFilterCategory;
  const setSelectedCollection = setFilterCollection;
  const setSelectedOccasion = setFilterOccasion;

  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0);
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // States: loading, error
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Recently Viewed state loaded directly from localStorage
  const [recentlyViewedProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('anvi_recently_viewed');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        if (Array.isArray(ids) && ids.length > 0) {
          return ids
            .map((id) => productsData.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p))
            .slice(0, 4);
        }
      }
    } catch {
      // ignore JSON parse error
    }
    return [];
  });

  useScrollLock(isMobileFilterOpen);

  // Initial simulated load for smooth skeleton demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...productsData];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 3. Occasion
    if (selectedOccasion !== 'All') {
      result = result.filter((p) => p.occasion === selectedOccasion);
    }

    // 4. Collection
    if (selectedCollection !== 'All') {
      result = result.filter((p) => p.collection === selectedCollection);
    }

    // 5. Price Range
    const priceRange = PRICE_RANGES[selectedPriceRangeIndex];
    if (priceRange.min > 0 || priceRange.max < Infinity) {
      result = result.filter(
        (p) => p.price >= priceRange.min && p.price <= priceRange.max
      );
    }

    // 6. Availability
    if (selectedAvailability === 'in-stock') {
      result = result.filter((p) => !p.isOutOfStock && p.availability !== 'Sold Out');
    } else if (selectedAvailability === 'limited') {
      result = result.filter((p) => p.availability === 'Limited Pieces');
    }

    // 7. Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
      default:
        // default preserve curated sequence
        break;
    }

    return result;
  }, [
    productsData,
    searchQuery,
    selectedCategory,
    selectedOccasion,
    selectedCollection,
    selectedPriceRangeIndex,
    selectedAvailability,
    sortBy,
  ]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (selectedOccasion !== 'All') count++;
    if (selectedCollection !== 'All') count++;
    if (selectedPriceRangeIndex !== 0) count++;
    if (selectedAvailability !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [
    selectedCategory,
    selectedOccasion,
    selectedCollection,
    selectedPriceRangeIndex,
    selectedAvailability,
    searchQuery,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedOccasion('All');
    setSelectedCollection('All');
    setSelectedPriceRangeIndex(0);
    setSelectedAvailability('all');
    setSearchQuery('');
    setVisibleCount(PAGE_SIZE);
  };

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  // Helper counts per category
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    map['All'] = productsData.length;
    CATEGORIES.forEach((cat) => {
      if (cat !== 'All') {
        map[cat] = productsData.filter((p) => p.category === cat).length;
      }
    });
    return map;
  }, [productsData]);

  // Dynamic Editorial Header & Breadcrumb Computation
  const { pageTitle, pageSubtitle, breadcrumbTrail } = useMemo(() => {
    if (matchSearch || searchQuery.trim()) {
      const displayQuery = searchQuery.trim() || 'All Pieces';
      return {
        pageTitle: `Search: "${displayQuery}"`,
        pageSubtitle: `Explore handcrafted heirlooms, pure silks, and tailored silhouettes matching your search.`,
        breadcrumbTrail: [
          { label: 'Shop', href: '/shop' },
          { label: `Search: "${displayQuery}"`, href: '' },
        ],
      };
    }

    if (matchCol && selectedCollection !== 'All' && COLLECTION_EDITORIAL[selectedCollection]) {
      return {
        pageTitle: COLLECTION_EDITORIAL[selectedCollection].title,
        pageSubtitle: COLLECTION_EDITORIAL[selectedCollection].subtitle,
        breadcrumbTrail: [
          { label: 'Collections', href: '/collections' },
          { label: selectedCollection, href: '' },
        ],
      };
    }

    if (matchOcc && selectedOccasion !== 'All' && OCCASION_EDITORIAL[selectedOccasion]) {
      return {
        pageTitle: OCCASION_EDITORIAL[selectedOccasion].title,
        pageSubtitle: OCCASION_EDITORIAL[selectedOccasion].subtitle,
        breadcrumbTrail: [
          { label: 'Occasions', href: '/occasions' },
          { label: selectedOccasion, href: '' },
        ],
      };
    }

    if (selectedCategory !== 'All' && CATEGORY_EDITORIAL[selectedCategory]) {
      return {
        pageTitle: CATEGORY_EDITORIAL[selectedCategory].title,
        pageSubtitle: CATEGORY_EDITORIAL[selectedCategory].subtitle,
        breadcrumbTrail: [
          { label: 'Shop', href: '/shop' },
          { label: selectedCategory, href: '' },
        ],
      };
    }

    if (selectedCollection !== 'All' && COLLECTION_EDITORIAL[selectedCollection]) {
      return {
        pageTitle: COLLECTION_EDITORIAL[selectedCollection].title,
        pageSubtitle: COLLECTION_EDITORIAL[selectedCollection].subtitle,
        breadcrumbTrail: [
          { label: 'Collections', href: '/collections' },
          { label: selectedCollection, href: '' },
        ],
      };
    }

    if (selectedOccasion !== 'All' && OCCASION_EDITORIAL[selectedOccasion]) {
      return {
        pageTitle: OCCASION_EDITORIAL[selectedOccasion].title,
        pageSubtitle: OCCASION_EDITORIAL[selectedOccasion].subtitle,
        breadcrumbTrail: [
          { label: 'Occasions', href: '/occasions' },
          { label: selectedOccasion, href: '' },
        ],
      };
    }

    return {
      pageTitle: 'Discover ANVI',
      pageSubtitle: 'Thoughtfully curated Indian silhouettes, handwoven textiles, and contemporary everyday elegance.',
      breadcrumbTrail: [{ label: 'Shop', href: '' }],
    };
  }, [matchSearch, searchQuery, matchCol, selectedCollection, matchOcc, selectedOccasion, selectedCategory]);

  return (
    <div className="anvi-shop-page">
      <div className="anvi-shop-container">
        {/* ============================================================
            1. BREADCRUMB & PAGE HEADING
            ============================================================ */}
        <header className="anvi-shop-header">
          <nav aria-label="Breadcrumb" className="anvi-shop-breadcrumb">
            <Link href="/">Home</Link>
            {breadcrumbTrail.map((crumb, idx) => (
              <React.Fragment key={crumb.label + idx}>
                <span className="anvi-shop-breadcrumb-sep">/</span>
                {crumb.href ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span className="anvi-shop-breadcrumb-current">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="anvi-shop-title-wrap">
            <h1 className="anvi-shop-title">{pageTitle}</h1>
            <p className="anvi-shop-subtitle">{pageSubtitle}</p>
          </div>
        </header>

        {/* Error State Fallback Banner */}
        {hasError && (
          <div style={{ marginBottom: 24 }}>
            <ErrorState
              variant="banner"
              scope="catalog"
              message="Live studio inventory is momentarily paused. Displaying our verified catalogue."
              onRetry={() => setHasError(false)}
              retryLabel="Refresh"
              onDismiss={() => setHasError(false)}
            />
          </div>
        )}

        {/* ============================================================
            2. MAIN CATALOGUE LAYOUT (SIDEBAR + GRID)
            ============================================================ */}
        <div className="anvi-shop-layout">
          {/* Desktop Filter Sidebar */}
          <aside className="anvi-shop-sidebar" aria-label="Product Filters">
            {/* Search Input */}
            <div className="anvi-shop-search-wrap">
              <input
                type="text"
                placeholder="Search collection, fabric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="anvi-shop-search-input"
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="anvi-shop-search-clear"
                  aria-label="Clear search query"
                >
                  ×
                </button>
              )}
            </div>

            {/* Real-time Search Suggestion Quick Pills */}
            <div className="anvi-shop-suggestions-wrap">
              <span className="anvi-shop-suggestions-label">Popular Searches</span>
              <div className="anvi-shop-suggestions-row">
                {SEARCH_SUGGESTIONS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="anvi-shop-suggestion-pill"
                    onClick={() => {
                      setSearchQuery(term);
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="anvi-filter-group">
              <h2 className="anvi-filter-title">Category</h2>
              <div className="anvi-filter-options">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`anvi-filter-option-btn ${
                      selectedCategory === cat ? 'anvi-filter-option-btn--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    <span>{cat}</span>
                    <span className="anvi-filter-count">({categoryCounts[cat] || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Collection Filter */}
            <div className="anvi-filter-group">
              <h2 className="anvi-filter-title">Collection</h2>
              <div className="anvi-filter-options">
                {COLLECTIONS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`anvi-filter-option-btn ${
                      selectedCollection === col ? 'anvi-filter-option-btn--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedCollection(col);
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    <span>{col}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion Filter */}
            <div className="anvi-filter-group">
              <h2 className="anvi-filter-title">Occasion</h2>
              <div className="anvi-filter-options">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    className={`anvi-filter-option-btn ${
                      selectedOccasion === occ ? 'anvi-filter-option-btn--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedOccasion(occ);
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    <span>{occ}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="anvi-filter-group">
              <h2 className="anvi-filter-title">Price</h2>
              <div className="anvi-filter-options">
                {PRICE_RANGES.map((range, index) => (
                  <button
                    key={range.label}
                    type="button"
                    className={`anvi-filter-option-btn ${
                      selectedPriceRangeIndex === index ? 'anvi-filter-option-btn--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedPriceRangeIndex(index);
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    <span>{range.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="anvi-filter-group">
              <h2 className="anvi-filter-title">Availability</h2>
              <div className="anvi-filter-options">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`anvi-filter-option-btn ${
                      selectedAvailability === opt.value ? 'anvi-filter-option-btn--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedAvailability(opt.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Sidebar Action */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="anvi-filter-reset-sidebar-btn"
              >
                Clear All Filters ({activeFiltersCount})
              </button>
            )}
          </aside>

          {/* Main Product Grid Area */}
          <section className="anvi-shop-main" aria-label="Product Catalogue">
            {/* Top Action Bar */}
            <div className="anvi-shop-topbar">
              {/* Mobile Filter Trigger */}
              <button
                type="button"
                className="anvi-mobile-filter-trigger"
                onClick={() => setIsMobileFilterOpen(true)}
                aria-label="Open filter drawer"
              >
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="anvi-mobile-filter-badge">{activeFiltersCount}</span>
                )}
              </button>

              {/* Product Count & Active Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span className="anvi-shop-count">
                  Showing{' '}
                  <span className="anvi-shop-count-highlight">
                    {filteredProducts.length === 0
                      ? 0
                      : Math.min(visibleCount, filteredProducts.length)}
                  </span>{' '}
                  of{' '}
                  <span className="anvi-shop-count-highlight">
                    {filteredProducts.length}
                  </span>{' '}
                  pieces
                </span>

                {/* Active Filter Pills */}
                {activeFiltersCount > 0 && (
                  <div className="anvi-active-pills">
                    {selectedCategory !== 'All' && (
                      <span className="anvi-active-pill">
                        Category: {selectedCategory}
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('All')}
                          className="anvi-active-pill-remove"
                          aria-label={`Remove category filter ${selectedCategory}`}
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {selectedOccasion !== 'All' && (
                      <span className="anvi-active-pill">
                        Occasion: {selectedOccasion}
                        <button
                          type="button"
                          onClick={() => setSelectedOccasion('All')}
                          className="anvi-active-pill-remove"
                          aria-label={`Remove occasion filter ${selectedOccasion}`}
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {selectedCollection !== 'All' && (
                      <span className="anvi-active-pill">
                        Collection: {selectedCollection}
                        <button
                          type="button"
                          onClick={() => setSelectedCollection('All')}
                          className="anvi-active-pill-remove"
                          aria-label={`Remove collection filter ${selectedCollection}`}
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {selectedPriceRangeIndex !== 0 && (
                      <span className="anvi-active-pill">
                        {PRICE_RANGES[selectedPriceRangeIndex].label}
                        <button
                          type="button"
                          onClick={() => setSelectedPriceRangeIndex(0)}
                          className="anvi-active-pill-remove"
                          aria-label="Remove price filter"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {selectedAvailability !== 'all' && (
                      <span className="anvi-active-pill">
                        {selectedAvailability === 'in-stock' ? 'In Stock' : 'Limited Editions'}
                        <button
                          type="button"
                          onClick={() => setSelectedAvailability('all')}
                          className="anvi-active-pill-remove"
                          aria-label="Remove availability filter"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {searchQuery && (
                      <span className="anvi-active-pill">
                        "{searchQuery}"
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="anvi-active-pill-remove"
                          aria-label="Remove search filter"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="anvi-active-pill-clear-all"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Sort Control */}
              <div className="anvi-shop-sort-wrap">
                <label htmlFor="shop-sort-select" className="anvi-shop-sort-label">
                  Sort By:
                </label>
                <select
                  id="shop-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="anvi-shop-sort-select"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest Additions</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* ============================================================
                3. PRODUCT GRID / LOADING / EMPTY STATES
                ============================================================ */}
            {isLoading ? (
              <ProductGridSkeleton count={8} columns={4} />
            ) : filteredProducts.length === 0 ? (
              /* Empty State: Never a dead end */
              <div className="anvi-shop-empty-state" role="status">
                <span className="anvi-shop-empty-icon" aria-hidden="true">
                  ✦
                </span>
                <h3 className="anvi-shop-empty-title">No pieces match your selection</h3>
                <p className="anvi-shop-empty-desc">
                  Try broadening your search terms or explore our signature handcrafted collections below:
                </p>
                <div className="anvi-shop-empty-recovery-btns">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="anvi-shop-empty-reset-btn"
                  >
                    Reset All Filters
                  </button>
                  <Link href="/shop/sarees" className="anvi-shop-empty-recovery-pill">
                    Browse Sarees
                  </Link>
                  <Link href="/collections/festive" className="anvi-shop-empty-recovery-pill">
                    Festive Edit
                  </Link>
                  <Link href="/collections/new-arrivals" className="anvi-shop-empty-recovery-pill">
                    New Arrivals
                  </Link>
                  <Link href="/shop/co-ord-sets" className="anvi-shop-empty-recovery-pill">
                    Co-ord Sets
                  </Link>
                </div>

                <div className="anvi-shop-empty-recommended">
                  <h4 className="anvi-shop-empty-recommended-title">
                    Signature Pieces You May Love
                  </h4>
                  <div className="anvi-shop-grid" role="list">
                    {productsData.slice(0, 4).map((p) => (
                      <div key={p.id} role="listitem">
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Canonical Product Grid (4-col Desktop / 3-col Tablet / 2-col Mobile) */
              <>
                <div className="anvi-shop-grid" role="list">
                  {visibleProducts.map((product) => (
                    <div key={product.id} role="listitem">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination / Controlled Infinite Loading */}
                {hasMore && (
                  <div className="anvi-shop-pagination-wrap">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="anvi-shop-load-more-btn"
                    >
                      <span>Load More Pieces</span>
                      <span aria-hidden="true">↓</span>
                    </button>
                    <div
                      className="anvi-shop-progress-bar"
                      role="progressbar"
                      aria-valuenow={visibleProducts.length}
                      aria-valuemin={0}
                      aria-valuemax={filteredProducts.length}
                    >
                      <div
                        className="anvi-shop-progress-fill"
                        style={{
                          width: `${(visibleProducts.length / filteredProducts.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="anvi-shop-progress-text">
                      Showing {visibleProducts.length} of {filteredProducts.length} pieces
                    </span>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* ============================================================
            RECENTLY VIEWED SECTION (NEVER A DEAD END)
            ============================================================ */}
        {recentlyViewedProducts.length > 0 && (
          <section className="anvi-recently-viewed-section" aria-label="Recently Viewed Products">
            <div className="anvi-recently-viewed-header">
              <h2 className="anvi-recently-viewed-title">Recently Viewed</h2>
              <p className="anvi-recently-viewed-subtitle">
                Revisit the handcrafted pieces you explored earlier.
              </p>
            </div>
            <div className="anvi-recently-viewed-grid" role="list">
              {recentlyViewedProducts.map((product) => (
                <div key={product.id} role="listitem">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ============================================================
          4. MOBILE FILTER BOTTOM SHEET / DRAWER
          ============================================================ */}
      {isMobileFilterOpen && (
        <div
          className="anvi-mobile-filter-backdrop"
          onClick={() => setIsMobileFilterOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="anvi-mobile-filter-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="anvi-mobile-filter-header">
              <h2 className="anvi-mobile-filter-heading">Filters</h2>
              <button
                type="button"
                className="anvi-mobile-filter-close"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                ×
              </button>
            </div>

            {/* Filter Body */}
            <div className="anvi-mobile-filter-body">
              {/* Category */}
              <div className="anvi-filter-group">
                <h3 className="anvi-filter-title">Category</h3>
                <div className="anvi-filter-options">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`anvi-filter-option-btn ${
                        selectedCategory === cat ? 'anvi-filter-option-btn--active' : ''
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span>{cat}</span>
                      <span className="anvi-filter-count">({categoryCounts[cat] || 0})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Collection */}
              <div className="anvi-filter-group">
                <h3 className="anvi-filter-title">Collection</h3>
                <div className="anvi-filter-options">
                  {COLLECTIONS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      className={`anvi-filter-option-btn ${
                        selectedCollection === col ? 'anvi-filter-option-btn--active' : ''
                      }`}
                      onClick={() => setSelectedCollection(col)}
                    >
                      <span>{col}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div className="anvi-filter-group">
                <h3 className="anvi-filter-title">Occasion</h3>
                <div className="anvi-filter-options">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      className={`anvi-filter-option-btn ${
                        selectedOccasion === occ ? 'anvi-filter-option-btn--active' : ''
                      }`}
                      onClick={() => setSelectedOccasion(occ)}
                    >
                      <span>{occ}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="anvi-filter-group">
                <h3 className="anvi-filter-title">Price Range</h3>
                <div className="anvi-filter-options">
                  {PRICE_RANGES.map((range, index) => (
                    <button
                      key={range.label}
                      type="button"
                      className={`anvi-filter-option-btn ${
                        selectedPriceRangeIndex === index ? 'anvi-filter-option-btn--active' : ''
                      }`}
                      onClick={() => setSelectedPriceRangeIndex(index)}
                    >
                      <span>{range.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="anvi-filter-group">
                <h3 className="anvi-filter-title">Availability</h3>
                <div className="anvi-filter-options">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`anvi-filter-option-btn ${
                        selectedAvailability === opt.value ? 'anvi-filter-option-btn--active' : ''
                      }`}
                      onClick={() => setSelectedAvailability(opt.value)}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="anvi-mobile-filter-footer">
              <button
                type="button"
                onClick={clearAllFilters}
                className="anvi-mobile-filter-clear-btn"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="anvi-mobile-filter-apply-btn"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
