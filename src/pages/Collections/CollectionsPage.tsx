import React, { useMemo } from 'react';
import { useRoute, Link } from 'wouter';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import { ProductCard } from '../../components/product/ProductCard';
import type { Product } from '../../lib/types';
import './CollectionsPage.css';

interface CollectionCapsule {
  id: string;
  slug: string;
  capsuleNum: string;
  title: string;
  tagline: string;
  craftTag: string;
  image: string;
  collectionField: string;
}

const CAPSULES: CollectionCapsule[] = [
  {
    id: 'capsule-new-arrivals',
    slug: 'new-arrivals',
    capsuleNum: 'Capsule 01',
    title: 'New Arrivals',
    tagline: 'Fresh Off the Looms',
    craftTag: 'Organic Mulmul · Handloom Linen · Limited Batch',
    image: '/images/hero/anvi_editorial_hero_1788956439054.jpg',
    collectionField: 'New Arrivals',
  },
  {
    id: 'capsule-bestsellers',
    slug: 'bestsellers',
    capsuleNum: 'Capsule 02',
    title: 'Bestsellers',
    tagline: 'Patron Favorites',
    craftTag: 'Chanderi Silk · Breathable Drape · Timeless Classics',
    image: '/images/campaigns/everyday_elevated.jpg',
    collectionField: 'Bestsellers',
  },
  {
    id: 'capsule-anvi-edit',
    slug: 'the-anvi-edit',
    capsuleNum: 'Capsule 03',
    title: 'The ANVI Edit',
    tagline: 'Foundational Handlooms',
    craftTag: 'Ajrakh Mud-Resist · Natural Indigo · Kutch & Bagru',
    image: '/images/hero/anvi_saree_hero.jpg',
    collectionField: 'The ANVI Edit',
  },
  {
    id: 'capsule-festive',
    slug: 'festive',
    capsuleNum: 'Capsule 04',
    title: 'Festive Edit',
    tagline: 'Luminous Heirlooms',
    craftTag: 'Mulberry Silk · Banarasi Zari · Varanasi & Coimbatore',
    image: '/images/campaigns/festive_campaign_main.jpg',
    collectionField: 'Festive Edit',
  },
  {
    id: 'capsule-premium',
    slug: 'premium',
    capsuleNum: 'Capsule 05',
    title: 'Premium',
    tagline: 'Couture Masterpieces',
    craftTag: 'Pure Mulberry Silk · Hand-woven Zardozi · Museum Heirlooms',
    image: '/images/occasions/occasion_premium.jpg',
    collectionField: 'Premium',
  },
];

const SLUG_ALIASES: Record<string, string> = {
  festive: 'festive',
  'festive-edit': 'festive',
  'the-anvi-edit': 'the-anvi-edit',
  'new-arrivals': 'new-arrivals',
  bestsellers: 'bestsellers',
  premium: 'premium',
};

export const CollectionsPage: React.FC = () => {
  const productsData = useLiveProducts();
  const [matchSlug, paramsSlug] = useRoute('/collections/:slug');

  // Normalize slug
  const normalizedSlug = useMemo(() => {
    if (!matchSlug || !paramsSlug?.slug) return null;
    const raw = paramsSlug.slug.toLowerCase();
    return SLUG_ALIASES[raw] || raw;
  }, [matchSlug, paramsSlug]);

  const activeCapsule = useMemo(() => {
    if (!normalizedSlug) return null;
    return CAPSULES.find((c) => c.slug === normalizedSlug) || null;
  }, [normalizedSlug]);

  const capsuleProducts = useMemo(() => {
    if (!activeCapsule) return [];
    return productsData.filter((p) => p.collection === activeCapsule.collectionField);
  }, [activeCapsule, productsData]);

  const nextCapsule = useMemo(() => {
    if (!activeCapsule) return null;
    const currentIndex = CAPSULES.findIndex((c) => c.slug === activeCapsule.slug);
    const nextIndex = (currentIndex + 1) % CAPSULES.length;
    return CAPSULES[nextIndex];
  }, [activeCapsule]);

  // =========================================================================
  // VIEW 1: DEDICATED CAPSULE LOOKBOOK (/collections/:slug)
  // =========================================================================
  if (activeCapsule) {
    return (
      <div className="anvi-collections-page">
        <div className="anvi-collections-container">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="anvi-collections-breadcrumb">
            <Link href="/">Home</Link>
            <span className="anvi-collections-breadcrumb-sep">/</span>
            <Link href="/collections">Collections</Link>
            <span className="anvi-collections-breadcrumb-sep">/</span>
            <span className="anvi-collections-breadcrumb-current">{activeCapsule.title}</span>
          </nav>

          {/* Quick Switcher Pill Tabs */}
          <div className="anvi-collections-nav-bar" role="tablist">
            <Link href="/collections" className="anvi-collections-nav-btn">
              ← All Collections
            </Link>
            {CAPSULES.map((cap) => (
              <Link
                key={cap.id}
                href={`/collections/${cap.slug}`}
                className={`anvi-collections-nav-btn ${
                  cap.slug === activeCapsule.slug ? 'anvi-collections-nav-btn--active' : ''
                }`}
              >
                {cap.title}
              </Link>
            ))}
          </div>

          {/* Minimal Atmospheric Capsule Hero */}
          <section className="anvi-capsule-detail-hero" aria-label={activeCapsule.title}>
            <img
              src={activeCapsule.image}
              alt={activeCapsule.title}
              className="anvi-capsule-detail-hero-bg"
            />
            <div className="anvi-capsule-detail-hero-content">
              <span className="anvi-capsule-detail-badge">{activeCapsule.capsuleNum}</span>
              <h1 className="anvi-capsule-detail-title">{activeCapsule.title}</h1>
              <p className="anvi-capsule-detail-craft">{activeCapsule.craftTag}</p>
            </div>
          </section>

          {/* Capsule Lookbook Topbar */}
          <div className="anvi-capsule-lookbook-topbar">
            <div className="anvi-capsule-lookbook-count">
              <strong>{capsuleProducts.length}</strong> Pieces in Capsule
            </div>
          </div>

          {/* Lookbook Product Grid */}
          <div className="anvi-capsule-lookbook-grid" role="list">
            {capsuleProducts.map((product) => (
              <div key={product.id} role="listitem">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Next Capsule Teaser Rail */}
          {nextCapsule && (
            <section className="anvi-next-capsule-rail" aria-label="Next Collection">
              <h2 className="anvi-next-capsule-heading">Next Collection</h2>
              <Link
                href={`/collections/${nextCapsule.slug}`}
                className="anvi-next-capsule-card"
              >
                <div className="anvi-next-capsule-thumb">
                  <img src={nextCapsule.image} alt={nextCapsule.title} loading="lazy" />
                </div>
                <div className="anvi-next-capsule-info">
                  <span className="anvi-capsule-spread-num">{nextCapsule.capsuleNum}</span>
                  <h3 className="anvi-next-capsule-title">{nextCapsule.title}</h3>
                  <span className="anvi-next-capsule-link">
                    Explore Capsule →
                  </span>
                </div>
              </Link>
            </section>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: COLLECTIONS MONOGRAPH SPREADS (/collections)
  // =========================================================================
  return (
    <div className="anvi-collections-page">
      <div className="anvi-collections-container">
        {/* Minimal Editorial Monograph Header */}
        <header className="anvi-collections-header">
          <span className="anvi-collections-eyebrow">Design Monographs</span>
          <h1 className="anvi-collections-title">Collections</h1>
          <p className="anvi-collections-subtitle">
            Curated capsules in limited artisan editions.
          </p>
        </header>

        {/* Capsule Navigation Anchor Bar */}
        <nav aria-label="Capsule Filter" className="anvi-collections-nav-bar">
          {CAPSULES.map((cap) => (
            <Link
              key={cap.id}
              href={`/collections/${cap.slug}`}
              className="anvi-collections-nav-btn"
            >
              {cap.title}
            </Link>
          ))}
        </nav>

        {/* Magazine-Style Editorial Capsule Spreads */}
        <div className="anvi-capsules-list">
          {CAPSULES.map((capsule) => {
            const previewPieces: Product[] = productsData
              .filter((p) => p.collection === capsule.collectionField)
              .slice(0, 4);

            return (
              <article key={capsule.id} className="anvi-capsule-spread">
                {/* Visual Spread */}
                <div className="anvi-capsule-spread-hero">
                  <div className="anvi-capsule-spread-img-wrap">
                    <img
                      src={capsule.image}
                      alt={capsule.title}
                      className="anvi-capsule-spread-img"
                    />
                  </div>
                  <div className="anvi-capsule-spread-content">
                    <div>
                      <span className="anvi-capsule-spread-num">{capsule.capsuleNum}</span>
                      <h2 className="anvi-capsule-spread-title">{capsule.title}</h2>
                      <p className="anvi-capsule-spread-tagline">{capsule.tagline}</p>
                      <div className="anvi-capsule-craft-chip">
                        {capsule.craftTag}
                      </div>
                    </div>

                    <Link
                      href={`/collections/${capsule.slug}`}
                      className="anvi-capsule-spread-cta"
                    >
                      <span>Explore Lookbook</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>

                {/* Bottom Garment Preview Rail */}
                {previewPieces.length > 0 && (
                  <div className="anvi-capsule-preview-section">
                    <div className="anvi-capsule-preview-header">
                      <span className="anvi-capsule-preview-heading">Featured Pieces</span>
                      <Link
                        href={`/collections/${capsule.slug}`}
                        className="anvi-capsule-preview-link"
                      >
                        View All ({productsData.filter((p) => p.collection === capsule.collectionField).length}) →
                      </Link>
                    </div>
                    <div className="anvi-capsule-preview-grid" role="list">
                      {previewPieces.map((product) => (
                        <div key={product.id} role="listitem">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
