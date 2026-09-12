import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  circle?: boolean;
  pill?: boolean;
  aspectRatio?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Base ANVI Skeleton Primitive
 * Quiet, warm linen & champagne gold shimmer without aggressive flashing.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  radius,
  circle = false,
  pill = false,
  aspectRatio,
  className = '',
  style = {},
}) => {
  const customStyles: React.CSSProperties = {
    ...style,
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    borderRadius: radius !== undefined ? (typeof radius === 'number' ? `${radius}px` : radius) : undefined,
    aspectRatio: aspectRatio,
  };

  const classes = [
    'anvi-skeleton',
    circle ? 'anvi-skeleton--circle' : '',
    pill ? 'anvi-skeleton--pill' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} style={customStyles} aria-hidden="true" />;
};

/* ==========================================================================
   1. Product Card & Product Grid Skeletons
   ========================================================================== */
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`anvi-product-card-skeleton ${className}`} aria-hidden="true">
      {/* 3:4 Image Skeleton */}
      <Skeleton className="anvi-card-skeleton-image-wrap" />

      {/* Meta details */}
      <div className="anvi-card-skeleton-meta">
        <Skeleton width="45%" height={12} />
        <Skeleton width="85%" height={16} />
        <div className="anvi-card-skeleton-row">
          <Skeleton width="30%" height={15} />
          <Skeleton width={18} height={18} circle />
        </div>
      </div>
    </div>
  );
};

export interface ProductGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 8,
  columns = 4,
  className = '',
}) => {
  return (
    <div
      className={`anvi-product-grid-skeleton ${className}`}
      style={{ '--grid-cols': columns } as React.CSSProperties}
      aria-label="Loading products"
      role="status"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

/* ==========================================================================
   2. Product Detail Page Skeleton (Preserves 2-Col Gallery & Info)
   ========================================================================== */
export const ProductPageSkeleton: React.FC = () => {
  return (
    <div className="anvi-pdp-skeleton" aria-label="Loading product details" role="status">
      {/* Breadcrumb skeleton */}
      <div className="anvi-pdp-skeleton-breadcrumbs">
        <Skeleton width={260} height={14} />
      </div>

      <div className="anvi-pdp-skeleton-grid">
        {/* Left: Gallery Column */}
        <div className="anvi-pdp-skeleton-gallery">
          <div className="anvi-pdp-skeleton-thumbs">
            <Skeleton className="anvi-pdp-skeleton-thumb-item" />
            <Skeleton className="anvi-pdp-skeleton-thumb-item" />
            <Skeleton className="anvi-pdp-skeleton-thumb-item" />
            <Skeleton className="anvi-pdp-skeleton-thumb-item" />
          </div>
          <Skeleton className="anvi-pdp-skeleton-main-img" />
        </div>

        {/* Right: Product Info Column */}
        <div className="anvi-pdp-skeleton-info">
          <div className="anvi-pdp-skeleton-header">
            <Skeleton width="28%" height={14} pill />
            <Skeleton width="90%" height={32} />
            <Skeleton width="40%" height={22} />
            <Skeleton width="35%" height={12} />
          </div>

          {/* Description paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width="100%" height={14} />
            <Skeleton width="95%" height={14} />
            <Skeleton width="80%" height={14} />
          </div>

          {/* Size Pills */}
          <div className="anvi-pdp-skeleton-sizes">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width={90} height={14} />
              <Skeleton width={70} height={14} />
            </div>
            <div className="anvi-pdp-skeleton-pills-row">
              <Skeleton width={52} height={44} radius={3} />
              <Skeleton width={52} height={44} radius={3} />
              <Skeleton width={52} height={44} radius={3} />
              <Skeleton width={52} height={44} radius={3} />
              <Skeleton width={52} height={44} radius={3} />
            </div>
          </div>

          {/* CTAs */}
          <div className="anvi-pdp-skeleton-ctas">
            <Skeleton width="70%" height={52} radius={4} />
            <Skeleton width="30%" height={52} radius={4} />
          </div>

          {/* Accordion list */}
          <div className="anvi-pdp-skeleton-accordions">
            <Skeleton width="100%" height={48} radius={2} />
            <Skeleton width="100%" height={48} radius={2} />
            <Skeleton width="100%" height={48} radius={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. Search Modal Skeleton
   ========================================================================== */
export const SearchSkeleton: React.FC = () => {
  return (
    <div className="anvi-search-skeleton" aria-label="Loading search results" role="status">
      <div className="anvi-search-skeleton-chips">
        <Skeleton width={110} height={28} pill />
        <Skeleton width={95} height={28} pill />
        <Skeleton width={120} height={28} pill />
        <Skeleton width={80} height={28} pill />
      </div>

      <div className="anvi-search-skeleton-grid">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
};

/* ==========================================================================
   4. Collections / Shop Header & Grid Skeleton
   ========================================================================== */
export const CollectionsSkeleton: React.FC = () => {
  return (
    <div className="anvi-collections-skeleton" aria-label="Loading collection" role="status">
      {/* Collection Hero */}
      <div className="anvi-collections-skeleton-hero">
        <Skeleton width={140} height={13} pill />
        <Skeleton width={320} height={38} />
        <Skeleton width={480} height={16} />
      </div>

      {/* Filter / Sort Toolbar */}
      <div className="anvi-collections-skeleton-toolbar">
        <div style={{ display: 'flex', gap: 10 }}>
          <Skeleton width={90} height={34} radius={3} />
          <Skeleton width={110} height={34} radius={3} />
          <Skeleton width={100} height={34} radius={3} />
        </div>
        <Skeleton width={140} height={34} radius={3} />
      </div>

      {/* Product Grid */}
      <ProductGridSkeleton count={8} columns={4} />
    </div>
  );
};

/* ==========================================================================
   5. Customer Account Suite Skeleton
   ========================================================================== */
export const AccountSkeleton: React.FC = () => {
  return (
    <div className="anvi-account-skeleton" aria-label="Loading patron account" role="status">
      {/* Account Hero Banner */}
      <div className="anvi-account-skeleton-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Skeleton width={64} height={64} circle />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width={120} height={12} />
            <Skeleton width={200} height={24} />
            <Skeleton width={160} height={14} />
          </div>
        </div>
        <Skeleton width={100} height={36} radius={4} />
      </div>

      {/* Tab bar */}
      <div className="anvi-account-skeleton-tabs">
        <Skeleton width={110} height={38} radius={30} />
        <Skeleton width={100} height={38} radius={30} />
        <Skeleton width={130} height={38} radius={30} />
        <Skeleton width={90} height={38} radius={30} />
      </div>

      {/* Order Cards List */}
      <div className="anvi-account-skeleton-cards">
        <div className="anvi-account-skeleton-card-item">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width={180} height={18} />
            <Skeleton width={90} height={22} pill />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Skeleton width={60} height={80} radius={2} />
            <Skeleton width={60} height={80} radius={2} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={14} />
            </div>
          </div>
          <Skeleton width="100%" height={40} radius={3} />
        </div>

        <div className="anvi-account-skeleton-card-item">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width={180} height={18} />
            <Skeleton width={90} height={22} pill />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Skeleton width={60} height={80} radius={2} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <Skeleton width="50%" height={16} />
              <Skeleton width="35%" height={14} />
            </div>
          </div>
          <Skeleton width="100%" height={40} radius={3} />
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   6. Cart Skeleton (Page & Drawer)
   ========================================================================== */
export interface CartSkeletonProps {
  mode?: 'page' | 'drawer';
}

export const CartSkeleton: React.FC<CartSkeletonProps> = ({ mode = 'page' }) => {
  if (mode === 'drawer') {
    return (
      <div className="anvi-cart-skeleton-drawer" aria-label="Loading shopping bag" role="status">
        {/* Free shipping meter skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          <Skeleton width="80%" height={14} />
          <Skeleton width="100%" height={6} radius={3} />
        </div>

        {/* 2 Item Rows */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 16, borderBottom: '1px solid var(--color-border-subtle)' }}>
            <Skeleton width={70} height={94} radius={2} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <Skeleton width="85%" height={16} />
              <Skeleton width="40%" height={12} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <Skeleton width={80} height={28} radius={2} />
                <Skeleton width={50} height={16} />
              </div>
            </div>
          </div>
        ))}

        {/* Drawer footer summary & checkout */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width={70} height={16} />
            <Skeleton width={80} height={18} />
          </div>
          <Skeleton width="100%" height={48} radius={3} />
          <Skeleton width="100%" height={40} radius={3} />
        </div>
      </div>
    );
  }

  // Full Cart Page Skeleton
  return (
    <div className="anvi-cart-skeleton-page" aria-label="Loading shopping bag" role="status">
      <Skeleton width={200} height={32} style={{ marginBottom: 32 }} />

      <div className="anvi-cart-skeleton-grid">
        {/* Cart Items List */}
        <div className="anvi-cart-skeleton-items">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="anvi-cart-skeleton-item-row">
              <Skeleton width={100} height={134} radius={3} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <Skeleton width="60%" height={20} />
                <Skeleton width="30%" height={14} />
                <Skeleton width="20%" height={18} />
                <div style={{ display: 'flex', gap: 16, marginTop: 'auto' }}>
                  <Skeleton width={100} height={36} radius={3} />
                  <Skeleton width={60} height={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="anvi-cart-skeleton-summary-box">
          <Skeleton width="50%" height={22} style={{ marginBottom: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="40%" height={14} />
            <Skeleton width="25%" height={14} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="30%" height={14} />
            <Skeleton width="20%" height={14} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-border-subtle)' }}>
            <Skeleton width="35%" height={20} />
            <Skeleton width="30%" height={22} />
          </div>
          <Skeleton width="100%" height={50} radius={4} style={{ marginTop: 12 }} />
        </div>
      </div>
    </div>
  );
};
