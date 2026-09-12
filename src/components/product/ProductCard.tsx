import React from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '../../lib/types';
import { formatPrice } from '../../lib/formatters';
import { useWishlist } from '../../hooks/useWishlist';
import './ProductCard.css';

export interface ProductCardProps {
  product?: Product;
  isLoading?: boolean;
  onCardClick?: (product: Product) => void;
  onWishlistToggle?: (productId: string, isWishlisted: boolean) => void;
  priority?: boolean;
  actionSlot?: React.ReactNode;
}

/**
 * ANVI Canonical Product Card
 * The single source of truth product card component reused throughout the entire website.
 * Visually quiet, product-focused, consistent 3:4 aspect ratio.
 * 
 * Supports:
 * - Hover state (smooth second image crossfade on desktop)
 * - Wishlist state (active fill & reactive context sync)
 * - Loading state (calm skeleton placeholder with zero layout shift)
 * - Out-of-stock state (subtle desaturation & quiet "Sold Out" tag)
 * - Sale state (bold sale price + subtle strikethrough original price)
 * - Optional second image
 * - Optional actionSlot (e.g. wishlist actions)
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isLoading = false,
  onCardClick,
  onWishlistToggle,
  priority = false,
  actionSlot,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  // ==========================================
  // 1. LOADING STATE
  // ==========================================
  if (isLoading || !product) {
    return (
      <article
        className="anvi-product-card anvi-product-card--loading"
        aria-hidden="true"
      >
        <div className="anvi-skeleton-image anvi-skeleton-pulse" />
        <div className="anvi-product-info">
          <div className="anvi-skeleton-line anvi-skeleton-line--meta anvi-skeleton-pulse" />
          <div className="anvi-skeleton-line anvi-skeleton-line--title anvi-skeleton-pulse" />
          <div className="anvi-skeleton-line anvi-skeleton-line--price anvi-skeleton-pulse" />
        </div>
      </article>
    );
  }

  // ==========================================
  // 2. PRODUCT CARD LOGIC
  // ==========================================
  const isWishlisted = isInWishlist(product.id);
  const isSoldOut = product.isOutOfStock || product.availability === 'Sold Out' || (typeof (product as any).stock === 'number' && (product as any).stock === 0);
  const hasSale = Boolean(
    product.isOnSale || 
    (product.originalPrice && product.originalPrice > product.price)
  );

  const primaryImage = product.images?.[0] || '';
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : null;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (onWishlistToggle) {
      onWishlistToggle(product.id, !isWishlisted);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.preventDefault();
      onCardClick(product);
    }
  };

  return (
    <article
      className={`anvi-product-card ${
        isSoldOut ? 'anvi-product-card--out-of-stock' : ''
      }`}
    >
      {/* Product Image Container (Consistent 3:4 Aspect Ratio) */}
      <a
        href={`/product/${product.slug}`}
        className="anvi-product-image-container"
        onClick={handleCardClick}
        aria-label={`View ${product.name}`}
      >
        <img
          src={primaryImage}
          alt={product.name}
          className={`anvi-product-img anvi-product-img--primary ${
            secondaryImage ? 'anvi-product-img--has-secondary' : ''
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />

        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate angle`}
            className="anvi-product-img anvi-product-img--secondary"
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
        )}

        {/* Out of stock quiet label */}
        {isSoldOut && (
          <span className="anvi-product-stock-tag">
            Sold Out
          </span>
        )}

        {/* Wishlist Control */}
        <button
          type="button"
          className={`anvi-product-wishlist-btn ${
            isWishlisted ? 'anvi-product-wishlist-btn--active' : ''
          }`}
          onClick={handleWishlistClick}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
        >
          <Heart
            size={16}
            strokeWidth={1.35}
            fill={isWishlisted ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
      </a>

      {/* Product Information Block */}
      <div className="anvi-product-info">
        <div className="anvi-product-meta-row">
          <span className="anvi-product-category">{product.category}</span>
          
          {/* Subtle sale or limited badge only when genuinely necessary */}
          {hasSale ? (
            <span className="anvi-product-quiet-badge">Sale</span>
          ) : product.availability === 'Limited Pieces' ? (
            <span className="anvi-product-quiet-badge">Limited</span>
          ) : null}
        </div>

        <a
          href={`/product/${product.slug}`}
          className="anvi-product-title-link"
          onClick={handleCardClick}
        >
          <h3 className="anvi-product-title">{product.name}</h3>
        </a>

        <div className="anvi-product-price-row">
          <span
            className={`anvi-product-price ${
              hasSale ? 'anvi-product-price--sale' : ''
            }`}
          >
            {formatPrice(product.price)}
          </span>

          {hasSale && product.originalPrice && (
            <span className="anvi-product-original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {actionSlot && (
          <div className="anvi-product-action-slot">
            {actionSlot}
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
