import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { Heart, ZoomIn, Check } from 'lucide-react';
import { useLiveProducts } from '../hooks/useLiveProducts';
import { fetchProductBySlug, fetchRelatedProducts } from '../lib/productsApi';
import { sanitizeHtml } from '../lib/sanitize';
import { ProductCard } from '../components/product/ProductCard';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { formatPrice } from '../lib/formatters';
import type { Product } from '../lib/types';
import { ProductPageSkeleton } from '../components/skeleton';
import './ProductDetailPage.css';

export interface ProductDetailPageProps {
  productSlug?: string;
}

const DEFAULT_ACCORDIONS = [
  { id: 'details', title: 'Product Details' },
  { id: 'fabric', title: 'Fabric & Material' },
  { id: 'care', title: 'Care Instructions' },
  { id: 'shipping', title: 'Shipping & Delivery' },
  { id: 'returns', title: 'Exchange Policy' },
];

/**
 * ANVI Product Detail Page (PDP)
 * Dominant image gallery on the left • Sticky luxury info on the right
 * Hover magnifying zoom • Size modal • Detailed editorial accordions • Canonical recommendations
 */
export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productSlug: propSlug,
}) => {
  const productsData = useLiveProducts();
  const [, params] = useRoute('/product/:slug');
  const activeSlug = propSlug || params?.slug || 'ajrakh-chanderi-silk-saree';

  const [prevSlug, setPrevSlug] = useState(activeSlug);
  const [isLoading, setIsLoading] = useState(false);

  if (activeSlug !== prevSlug) {
    setPrevSlug(activeSlug);
    setIsLoading(true);
  }

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Find active product — live list first, server fallback for deep links
  // beyond the 200-item live window or cache misses.
  const [serverProduct, setServerProduct] = useState<Product | null>(null);
  const [serverRelated, setServerRelated] = useState<Product[] | null>(null);

  useEffect(() => {
    setServerProduct(null);
    setServerRelated(null);
    const inLive = productsData.some((p) => p.slug === activeSlug);
    if (inLive || !activeSlug) return;
    let cancelled = false;
    void fetchProductBySlug(activeSlug)
      .then((p) => {
        if (!cancelled && p) {
          setServerProduct(p);
          return fetchRelatedProducts(p, 4).then((rel) => {
            if (!cancelled) setServerRelated(rel);
          });
        }
      })
      .catch(() => {
        // live-list fallback below covers offline
      });
    return () => {
      cancelled = true;
    };
  }, [activeSlug, productsData]);

  const product: Product = useMemo(() => {
    const found = productsData.find((p) => p.slug === activeSlug);
    return found || serverProduct || productsData[0];
  }, [activeSlug, productsData, serverProduct]);

  // Persist viewed product to recently viewed storage
  useEffect(() => {
    if (!product?.id) return;
    try {
      const existing = localStorage.getItem('anvi_recently_viewed');
      let ids: string[] = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(ids)) ids = [];
      ids = [product.id, ...ids.filter((id) => id !== product.id)].slice(0, 8);
      localStorage.setItem('anvi_recently_viewed', JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [product?.id]);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = product.images && product.images.length > 0 ? product.images : ['/images/products/saree_ajrakh_1.jpg'];
  const activeImage = images[activeImageIndex] || images[0];

  // Zoom logic on desktop
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageFrameRef.current) return;
    const { left, top, width, height } = imageFrameRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.75)',
    });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center center' });
  };

  // Variants and sizing
  const defaultSize = product.variants && product.variants.length > 0 ? product.variants[0] : 'Free Size';
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Cart & Wishlist integration
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const handleAddToBag = () => {
    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: selectedSize,
      image: activeImage,
      slug: product.slug,
    });
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2200);
  };

  // Accordions open/close state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    details: true,
    fabric: false,
    care: false,
    shipping: false,
    returns: false,
  });

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Related products — server recommendations when available, else live-list filter.
  const relatedProducts = useMemo(() => {
    if (serverRelated && serverRelated.length > 0) return serverRelated;
    return productsData
      .filter((p) => p.id !== product.id && (p.category === product.category || p.occasion === product.occasion))
      .slice(0, 4);
  }, [product, productsData, serverRelated]);

  // You May Also Like (complementary silhouettes)
  const youMayAlsoLike = useMemo(() => {
    return productsData
      .filter((p) => p.id !== product.id && p.category !== product.category)
      .slice(0, 4);
  }, [product, productsData]);

  // Sale calculations
  const hasSale = Boolean(product.isOnSale || (product.originalPrice && product.originalPrice > product.price));
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isSoldOut = product.isOutOfStock || product.availability === 'Sold Out' || (typeof product.stock === 'number' && product.stock === 0);

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  return (
    <div className="anvi-pdp">
      <div className="anvi-pdp-container">
        {/* ============================================================
            1. BREADCRUMB
            ============================================================ */}
        <nav aria-label="Breadcrumb" className="anvi-pdp-breadcrumb">
          <Link href="/">Home</Link>
          <span className="anvi-pdp-breadcrumb-sep">/</span>
          <Link href="/shop">Shop</Link>
          <span className="anvi-pdp-breadcrumb-sep">/</span>
          <Link href={`/shop/${product.category.toLowerCase().replace(/\s+/g, '-')}`}>
            {product.category}
          </Link>
          <span className="anvi-pdp-breadcrumb-sep">/</span>
          <span className="anvi-pdp-breadcrumb-current">{product.name}</span>
        </nav>

        {/* ============================================================
            2. MAIN PRODUCT HERO SPREAD (DOMINANT GALLERY + INFO)
            ============================================================ */}
        <div className="anvi-pdp-spread">
          {/* LEFT: DOMINANT IMAGE GALLERY */}
          <div className="anvi-pdp-gallery-wrap">
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="anvi-pdp-thumbnails" role="tablist" aria-label="Product thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    role="tab"
                    aria-selected={activeImageIndex === idx}
                    aria-label={`View image ${idx + 1}`}
                    className={`anvi-pdp-thumb-btn ${
                      activeImageIndex === idx ? 'anvi-pdp-thumb-btn--active' : ''
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt="" className="anvi-pdp-thumb-img" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Frame with Smooth Magnifying Zoom on Desktop */}
            <div
              ref={imageFrameRef}
              className="anvi-pdp-main-frame"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={activeImage}
                alt={product.name}
                className="anvi-pdp-main-img"
                style={isZooming ? zoomStyle : undefined}
                loading="eager"
                decoding="async"
              />

              <div className="anvi-pdp-zoom-badge" aria-hidden="true">
                <ZoomIn size={14} />
                <span>Hover to inspect weave</span>
              </div>
            </div>
          </div>

          {/* RIGHT: STICKY PRODUCT INFORMATION PANEL */}
          <div className="anvi-pdp-info-panel">
            {/* Category Eyebrow */}
            <span className="anvi-pdp-category-eyebrow">
              {product.category} · {product.occasion || 'Heritage Handloom'}
            </span>

            {/* Product Title */}
            <h1 className="anvi-pdp-title">{product.name}</h1>

            {/* Price & Tax Row */}
            <div className="anvi-pdp-price-wrap">
              <span className="anvi-pdp-price">{formatPrice(product.price)}</span>
              {hasSale && product.originalPrice && (
                <>
                  <span className="anvi-pdp-original-price">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="anvi-pdp-discount-tag">Save {discountPercent}%</span>
                </>
              )}
            </div>
            <p className="anvi-pdp-tax-note">Inclusive of all taxes · Free shipping across India</p>

            {/* Availability Indicator */}
            <div className="anvi-pdp-availability-row">
              <span
                className={`anvi-pdp-availability-dot ${
                  isSoldOut
                    ? 'anvi-pdp-availability-dot--soldout'
                    : product.availability === 'Limited Pieces'
                    ? 'anvi-pdp-availability-dot--limited'
                    : ''
                }`}
              />
              <span>
                {isSoldOut
                  ? 'Currently Sold Out'
                  : product.availability === 'Limited Pieces'
                  ? 'Limited Edition · Only 2 pieces crafted'
                  : 'In Stock · Handcrafted in Coimbatore Studio'}
              </span>
            </div>

            {/* Storytelling Description — CMS rich text rendered via sanitized HTML */}
            <p
              className="anvi-pdp-description"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />

            {/* Size / Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="anvi-pdp-variant-section">
                <div className="anvi-pdp-variant-header">
                  <span className="anvi-pdp-variant-label">Select Size: {selectedSize}</span>
                  {product.category !== 'Sarees' && (
                    <button
                      type="button"
                      className="anvi-pdp-size-guide-btn"
                      onClick={() => setIsSizeModalOpen(true)}
                    >
                      Size Guide
                    </button>
                  )}
                </div>

                <div className="anvi-pdp-variant-pills" role="radiogroup" aria-label="Available sizes">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={selectedSize === v}
                      className={`anvi-pdp-variant-pill ${
                        selectedSize === v ? 'anvi-pdp-variant-pill--active' : ''
                      }`}
                      onClick={() => setSelectedSize(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="anvi-pdp-actions-row">
              {/* Stepper */}
              <div className="anvi-pdp-qty-stepper" aria-label="Quantity selector">
                <button
                  type="button"
                  className="anvi-pdp-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="anvi-pdp-qty-value">{quantity}</span>
                <button
                  type="button"
                  className="anvi-pdp-qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={isSoldOut}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Primary CTA: ADD TO BAG */}
              <button
                type="button"
                className="anvi-pdp-add-btn"
                onClick={handleAddToBag}
                disabled={isSoldOut}
              >
                {isAddedSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Added to Bag</span>
                  </>
                ) : isSoldOut ? (
                  <span>Sold Out</span>
                ) : (
                  <span>Add to Bag · {formatPrice(product.price * quantity)}</span>
                )}
              </button>

              {/* Secondary CTA: WISHLIST */}
              <button
                type="button"
                className={`anvi-pdp-wishlist-btn ${
                  isWishlisted ? 'anvi-pdp-wishlist-btn--active' : ''
                }`}
                onClick={() => toggleWishlist(product.id)}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart
                  size={18}
                  strokeWidth={1.4}
                  fill={isWishlisted ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Boutique Trust Strip */}
            <div className="anvi-pdp-trust-strip">
              <div className="anvi-pdp-trust-item">
                <span className="anvi-pdp-trust-glyph">✦</span>
                <span>Authentic Handloom Certified by South Indian Weavers</span>
              </div>
              <div className="anvi-pdp-trust-item">
                <span className="anvi-pdp-trust-glyph">✦</span>
                <span>Complimentary Insured Delivery on all orders</span>
              </div>
              <div className="anvi-pdp-trust-item">
                <span className="anvi-pdp-trust-glyph">✦</span>
                <span>7-Day Hassle-Free Boutique Exchange Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. EDITORIAL ACCORDIONS SECTION (BELOW PRIMARY INFO)
            ============================================================ */}
        <div className="anvi-pdp-details-section">
          {DEFAULT_ACCORDIONS.map((acc) => {
            const isOpen = !!openAccordions[acc.id];

            return (
              <div key={acc.id} className="anvi-pdp-accordion-item">
                <button
                  type="button"
                  className="anvi-pdp-accordion-trigger"
                  onClick={() => toggleAccordion(acc.id)}
                  aria-expanded={isOpen}
                  aria-controls={`pdp-acc-${acc.id}`}
                >
                  <span>{acc.title}</span>
                  <span className="anvi-pdp-accordion-icon" aria-hidden="true">
                    +
                  </span>
                </button>

                <div
                  id={`pdp-acc-${acc.id}`}
                  className={`anvi-pdp-accordion-content ${
                    isOpen ? 'anvi-pdp-accordion-content--open' : ''
                  }`}
                >
                  {acc.id === 'details' && (
                    <ul className="anvi-pdp-details-list">
                      <li className="anvi-pdp-details-list-item">
                        <span className="anvi-pdp-details-list-bullet">✦</span>
                        <span>
                          <strong>Silhouette:</strong> Authentic contemporary Indian drape tailored for natural comfort and refined poise.
                        </span>
                      </li>
                      <li className="anvi-pdp-details-list-item">
                        <span className="anvi-pdp-details-list-bullet">✦</span>
                        <span>
                          <strong>Origin:</strong> Handwoven and finished at our dedicated artisanal boutique in Coimbatore, Tamil Nadu.
                        </span>
                      </li>
                      <li className="anvi-pdp-details-list-item">
                        <span className="anvi-pdp-details-list-bullet">✦</span>
                        <span>
                          <strong>Collection:</strong> {product.collection || 'The ANVI Edit'} · Crafted in small ethical batches.
                        </span>
                      </li>
                    </ul>
                  )}

                  {acc.id === 'fabric' && (
                    <p>
                      {product.fabric ||
                        '100% pure authentic handloom textile. Treated with certified natural and azo-free dyes. Naturally breathable and gentle on skin throughout all seasons.'}
                    </p>
                  )}

                  {acc.id === 'care' && (
                    <p>
                      {product.care ||
                        'Dry clean recommended for silks, zari, and zardozi embellishments. For cottons and mulmuls, gentle handwash in cold water with mild liquid detergent. Shade dry inside out. Warm iron on reverse.'}
                    </p>
                  )}

                  {acc.id === 'shipping' && (
                    <p>
                      Dispatches within 24 to 48 business hours from our Coimbatore studio. Delivery within 3 to 5 business days across all metro cities in India. Delivered in tamper-evident, luxury keepsake packaging.
                    </p>
                  )}

                  {acc.id === 'returns' && (
                    <p>
                      We offer a 7-day hassle-free exchange policy from the date of delivery. Garments must be unworn, unwashed, with all original boutique security tags intact. Simply reach out via our Help page or WhatsApp for courier pickup.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================
            4. RELATED PRODUCTS
            ============================================================ */}
        {relatedProducts.length > 0 && (
          <section className="anvi-pdp-recs-section" aria-labelledby="related-products-heading">
            <div className="anvi-pdp-recs-header">
              <span className="anvi-pdp-recs-eyebrow">Harmonious Silhouettes</span>
              <h2 id="related-products-heading" className="anvi-pdp-recs-heading">
                Related Products
              </h2>
            </div>
            <div className="anvi-pdp-recs-grid" role="list">
              {relatedProducts.map((p) => (
                <div key={p.id} role="listitem">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            5. YOU MAY ALSO LIKE
            ============================================================ */}
        {youMayAlsoLike.length > 0 && (
          <section className="anvi-pdp-recs-section" aria-labelledby="you-may-also-like-heading">
            <div className="anvi-pdp-recs-header">
              <span className="anvi-pdp-recs-eyebrow">Curated Complements</span>
              <h2 id="you-may-also-like-heading" className="anvi-pdp-recs-heading">
                You May Also Like
              </h2>
            </div>
            <div className="anvi-pdp-recs-grid" role="list">
              {youMayAlsoLike.map((p) => (
                <div key={p.id} role="listitem">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ============================================================
          6. SIZE GUIDE MODAL
          ============================================================ */}
      {isSizeModalOpen && (
        <div
          className="anvi-pdp-modal-backdrop"
          onClick={() => setIsSizeModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Size Guide"
        >
          <div
            className="anvi-pdp-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="anvi-pdp-modal-header">
              <h3 className="anvi-pdp-modal-title">Garment Measurement Guide</h3>
              <button
                type="button"
                className="anvi-pdp-modal-close"
                onClick={() => setIsSizeModalOpen(false)}
                aria-label="Close size guide"
              >
                ×
              </button>
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(47, 43, 43, 0.7)' }}>
              All measurements are garment dimensions specified in inches. We recommend choosing a size with 1.5 - 2 inches ease for natural comfort.
            </p>

            <table className="anvi-pdp-size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Bust (in)</th>
                  <th>Waist (in)</th>
                  <th>Hip (in)</th>
                  <th>Kurta Length (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>XS</strong></td>
                  <td>34</td>
                  <td>30</td>
                  <td>38</td>
                  <td>45</td>
                </tr>
                <tr>
                  <td><strong>S</strong></td>
                  <td>36</td>
                  <td>32</td>
                  <td>40</td>
                  <td>45</td>
                </tr>
                <tr>
                  <td><strong>M</strong></td>
                  <td>38</td>
                  <td>34</td>
                  <td>42</td>
                  <td>46</td>
                </tr>
                <tr>
                  <td><strong>L</strong></td>
                  <td>40</td>
                  <td>36</td>
                  <td>44</td>
                  <td>46</td>
                </tr>
                <tr>
                  <td><strong>XL</strong></td>
                  <td>42</td>
                  <td>38</td>
                  <td>46</td>
                  <td>47</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
