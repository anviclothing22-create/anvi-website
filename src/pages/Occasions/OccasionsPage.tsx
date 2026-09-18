import React, { useMemo, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import { ProductCard } from '../../components/product/ProductCard';
import type { Product, ProductOccasion } from '../../lib/types';
import './OccasionsPage.css';

interface OccasionMeta {
  slug: string;
  name: string;
  seq: string;
  tagline: string;
  stylingTip: string;
  image: string;
  badge: string;
  occasionField: ProductOccasion;
}

const OCCASIONS_DIRECTORY: OccasionMeta[] = [
  {
    slug: 'everyday',
    name: 'Everyday',
    seq: '01',
    tagline: 'Breathable handlooms & easy cottons',
    stylingTip: 'Pair with minimalist brass studs and open-toe juttis.',
    image: '/images/occasions/occasion_everyday.jpg',
    badge: 'Everyday',
    occasionField: 'Everyday',
  },
  {
    slug: 'office',
    name: 'Office',
    seq: '02',
    tagline: 'Structured kurtas & tailored grace',
    stylingTip: 'Style with clean geometric cuffs and a structured tote.',
    image: '/images/occasions/occasion_office.jpg',
    badge: 'Office',
    occasionField: 'Office',
  },
  {
    slug: 'festive',
    name: 'Festive',
    seq: '03',
    tagline: 'Luminous Banarasi weaves & jewel tones',
    stylingTip: 'Accompany with antique temple jhumkas and fresh jasmine.',
    image: '/images/occasions/occasion_festive.jpg',
    badge: 'Festive',
    occasionField: 'Festive',
  },
];

type SortOption = 'featured' | 'price-low' | 'price-high';

export const OccasionsPage: React.FC = () => {
  const productsData = useLiveProducts();
  const [matchOccasion, paramsOccasion] = useRoute('/occasions/:slug');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Determine active occasion if on /occasions/:slug
  const activeOccasion = useMemo(() => {
    if (!matchOccasion || !paramsOccasion?.slug) return null;
    const slugLower = paramsOccasion.slug.toLowerCase();
    return OCCASIONS_DIRECTORY.find((o) => o.slug === slugLower) || null;
  }, [matchOccasion, paramsOccasion]);

  // Products filtered for the active occasion lookbook
  const occasionProducts = useMemo(() => {
    if (!activeOccasion) return [];
    const list = productsData.filter(
      (p) => p.occasion === activeOccasion.occasionField
    );

    switch (sortBy) {
      case 'price-low':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...list].sort((a, b) => b.price - a.price);
      case 'featured':
      default:
        return list;
    }
  }, [activeOccasion, productsData, sortBy]);

  // If on /occasions/:slug and valid occasion found, render dedicated Occasion Lookbook
  if (activeOccasion) {
    const otherOccasions = OCCASIONS_DIRECTORY.filter((o) => o.slug !== activeOccasion.slug);

    return (
      <div className="anvi-occasions-page">
        {/* Dedicated Occasion Header */}
        <header className="anvi-occasion-detail-header">
          <div className="anvi-occasion-detail-header-inner">
            {/* Breadcrumb Navigation */}
            <nav className="anvi-occasion-breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/occasions">Occasions</Link>
              <span>/</span>
              <span style={{ color: 'var(--color-charcoal, #2F2B2B)', fontWeight: 600 }}>
                {activeOccasion.name}
              </span>
            </nav>

            {/* Quick Switcher Tabs */}
            <div className="anvi-occasion-switcher" role="tablist">
              <Link href="/occasions" className="anvi-occasion-switcher-btn">
                ← All Occasions
              </Link>
              {OCCASIONS_DIRECTORY.map((occ) => (
                <Link
                  key={occ.slug}
                  href={`/occasions/${occ.slug}`}
                  className={`anvi-occasion-switcher-btn ${
                    occ.slug === activeOccasion.slug ? 'is-active' : ''
                  }`}
                >
                  {occ.name}
                </Link>
              ))}
            </div>

            {/* Clean Lookbook Hero Banner */}
            <div className="anvi-occasion-lookbook-clean-hero">
              <div>
                <span className="anvi-occasion-lookbook-badge">{activeOccasion.badge}</span>
                <h1 className="anvi-occasion-lookbook-title">{activeOccasion.name}</h1>
                <p className="anvi-occasion-lookbook-tagline">{activeOccasion.tagline}</p>
              </div>

              {/* Chic 1-Line Styling Tip Banner */}
              <div className="anvi-occasion-concierge-tip-strip">
                <span className="anvi-occasion-tip-icon">✦</span>
                <span className="anvi-occasion-tip-text">
                  <strong>Styling Note:</strong> {activeOccasion.stylingTip}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Lookbook Area */}
        <main className="anvi-occasions-container" style={{ marginTop: 'var(--space-6, 1.5rem)' }}>
          <div className="anvi-occasion-grid-topbar">
            <span className="anvi-occasion-piece-count">
              {occasionProducts.length} Pieces
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="occasion-sort" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Sort:
              </label>
              <select
                id="occasion-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="anvi-occasion-sort-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="anvi-occasion-products-grid">
            {occasionProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Next Occasion Teaser Rail */}
          <section className="anvi-occasion-next-rail" aria-label="Explore Other Occasions">
            <h3>Explore Other Occasions</h3>
            <div className="anvi-occasion-next-cards">
              {otherOccasions.map((other) => (
                <Link
                  key={other.slug}
                  href={`/occasions/${other.slug}`}
                  className="anvi-occasion-mini-card"
                >
                  <div className="anvi-occasion-mini-thumb">
                    <img src={other.image} alt={other.name} loading="lazy" />
                  </div>
                  <div className="anvi-occasion-mini-body">
                    <div>
                      <h4>{other.name}</h4>
                      <p>{other.tagline}</p>
                    </div>
                    <span className="anvi-occasion-mini-link">
                      View Lookbook →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  // Default Directory View (/occasions)
  // ------------------------------------------------------------------------
  return (
    <div className="anvi-occasions-page">
      {/* Minimal Editorial Hero */}
      <header className="anvi-occasions-hero">
        <span className="anvi-occasions-pretitle">Wardrobe Directory</span>
        <h1 className="anvi-occasions-title">Shop by Occasion</h1>
        <p className="anvi-occasions-lead">
          Silhouettes curated for the rhythm of your day.
        </p>

        {/* Quick Jump Pills */}
        <nav className="anvi-occasions-pills" aria-label="Quick jump to occasion moments">
          {OCCASIONS_DIRECTORY.map((occ) => (
            <a key={occ.slug} href={`#moment-${occ.slug}`} className="anvi-occasions-pill-link">
              {occ.name}
            </a>
          ))}
        </nav>
      </header>

      {/* Directory Moments List */}
      <main className="anvi-occasions-container">
        <div className="anvi-occasions-list">
          {OCCASIONS_DIRECTORY.map((occ, idx) => {
            const isReversed = idx % 2 === 1;
            const previewProducts = productsData
              .filter((p) => p.occasion === occ.occasionField)
              .slice(0, 3);

            return (
              <article
                key={occ.slug}
                id={`moment-${occ.slug}`}
                className={`anvi-occasion-moment-card ${isReversed ? 'is-reversed' : ''}`}
              >
                {/* Visual Side */}
                <div className="anvi-occasion-moment-visual">
                  <img
                    src={occ.image}
                    alt={occ.name}
                    className="anvi-occasion-moment-img"
                    loading="lazy"
                  />
                  <span className="anvi-occasion-moment-badge">{occ.badge}</span>
                </div>

                {/* Content Side */}
                <div className="anvi-occasion-moment-content">
                  <div>
                    <div className="anvi-occasion-moment-header">
                      <span className="anvi-occasion-moment-seq">{occ.seq}</span>
                      <h2 className="anvi-occasion-moment-title">{occ.name}</h2>
                      <span className="anvi-occasion-moment-subtitle">{occ.tagline}</span>
                    </div>

                    {/* Single Concise Styling Tip */}
                    <div className="anvi-occasion-mini-tip">
                      <span className="anvi-occasion-tip-icon">✦</span>
                      <span>{occ.stylingTip}</span>
                    </div>

                    {/* Lookbook Preview Strip */}
                    <div className="anvi-occasion-preview-strip">
                      <span className="anvi-occasion-preview-label">Curated Pieces</span>
                      <div className="anvi-occasion-preview-grid">
                        {previewProducts.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/product/${prod.slug}`}
                            className="anvi-occasion-preview-thumb"
                            title={prod.name}
                          >
                            <img src={prod.images[0] || ''} alt={prod.name} loading="lazy" />
                            <div className="anvi-occasion-preview-thumb-overlay">
                              <span className="anvi-occasion-preview-thumb-title">{prod.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <Link
                    href={`/occasions/${occ.slug}`}
                    className="anvi-occasion-moment-cta"
                  >
                    <span>View Lookbook</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Sleek 1-Line Concierge Bar */}
        <section className="anvi-occasions-concierge-strip" aria-label="Concierge Styling">
          <div className="anvi-occasions-concierge-strip-inner">
            <div className="anvi-occasions-concierge-strip-text">
              <span className="anvi-occasions-concierge-strip-tag">Studio Concierge</span>
              <p>Need personal styling guidance? Connect with our Coimbatore studio on WhatsApp.</p>
            </div>
            <a
              href="https://wa.me/919488212262?text=Hello%20ANVI%20Styling%20Concierge%2C%20I%20would%20like%20guidance%20on%20choosing%20an%20attire%20for%20an%20upcoming%20occasion."
              target="_blank"
              rel="noopener noreferrer"
              className="anvi-occasions-concierge-strip-btn"
            >
              <span>Chat with Stylist</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};
