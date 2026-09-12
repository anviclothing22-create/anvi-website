import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Lock, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../lib/formatters';
import { CartSkeleton } from '../../components/skeleton';
import './CartPage.css';

/**
 * ANVI Cart Page
 * A clean, spacious, editorial shopping bag experience.
 *
 * Requirements:
 * - Table/list of cart items (Image, Name, Variant, Quantity stepper, Unit Price, Line Total, Remove)
 * - Sticky Order Summary (Subtotal, Shipping, Discount if applicable, Total)
 * - Primary CTA: PROCEED TO CHECKOUT
 * - Useful shipping & exchange information
 * - Elegant empty state: "Your bag is waiting." + "SHOP NOW"
 */
export const CartPage: React.FC = () => {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Free delivery for all orders for now
  const isFreeShipping = true;
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  const handleCheckout = () => {
    setLocation('/checkout');
  };

  if (isLoading) {
    return <CartSkeleton mode="page" />;
  }

  return (
    <div className="anvi-cart-page">
      <div className="anvi-cart-page-container">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="anvi-cart-page-breadcrumb">
          <Link href="/">Home</Link>
          <span className="anvi-cart-page-breadcrumb-sep">/</span>
          <span className="anvi-cart-page-breadcrumb-current">Shopping Bag</span>
        </nav>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="anvi-cart-page-empty">
            <h1 className="anvi-cart-page-empty-title">Your bag is waiting.</h1>
            <p className="anvi-cart-page-empty-text">
              Discover pieces selected for your everyday and special moments.
            </p>
            <Link href="/collections/new-arrivals" className="anvi-cart-page-empty-btn">
              Shop New Arrivals
            </Link>

            <div className="anvi-cart-page-empty-curations">
              <p className="anvi-cart-page-empty-curations-title">
                Explore The ANVI Edit
              </p>
              <div className="anvi-cart-page-empty-curations-links">
                <Link href="/shop/sarees">Handloom Sarees</Link>
                <Link href="/shop/salwars">Contemporary Salwars</Link>
                <Link href="/shop/co-ord-sets">Modern Co-ords</Link>
                <Link href="/collections/festive">Festive Collection</Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="anvi-cart-page-header">
              <h1 className="anvi-cart-page-title">Shopping Bag</h1>
              <span className="anvi-cart-page-item-count">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Main Layout Grid */}
            <div className="anvi-cart-page-layout">
              {/* Left Column: Items Table */}
              <div className="anvi-cart-page-items">
                {/* Table Header (Desktop) */}
                <div className="anvi-cart-table-head" aria-hidden="true">
                  <span>Product</span>
                  <span>Price</span>
                  <span>Quantity</span>
                  <span className="anvi-cart-table-head-right">Total</span>
                </div>

                {/* Items List */}
                <div role="list">
                  {items.map((item) => {
                    const itemSlug = item.slug || 'ajrakh-chanderi-silk-saree';

                    return (
                      <div
                        key={item.id}
                        role="listitem"
                        className="anvi-cart-page-item-row"
                      >
                        {/* Product Thumbnail & Details */}
                        <div className="anvi-cart-product-cell">
                          <Link
                            href={`/product/${itemSlug}`}
                            className="anvi-cart-product-thumb"
                          >
                            <img
                              src={
                                item.image ||
                                '/images/products/saree_ajrakh_1.jpg'
                              }
                              alt={item.name}
                            />
                          </Link>
                          <div className="anvi-cart-product-info">
                            <Link
                              href={`/product/${itemSlug}`}
                              className="anvi-cart-product-name"
                            >
                              {item.name}
                            </Link>
                            {item.size && (
                              <span className="anvi-cart-product-variant">
                                Size: {item.size}
                              </span>
                            )}
                            <button
                              type="button"
                              className="anvi-cart-product-remove-btn"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name} from bag`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="anvi-cart-price-cell">
                          {formatPrice(item.price)}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="anvi-cart-qty-cell">
                          <div
                            className="anvi-cart-page-stepper"
                            aria-label={`Quantity for ${item.name}`}
                          >
                            <button
                              type="button"
                              className="anvi-cart-page-stepper-btn"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="anvi-cart-page-stepper-value">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="anvi-cart-page-stepper-btn"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="anvi-cart-total-cell">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <aside className="anvi-cart-page-summary">
                <h2 className="anvi-cart-summary-title">Order Summary</h2>

                <div className="anvi-cart-summary-rows">
                  <div className="anvi-cart-summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="anvi-cart-summary-row">
                    <span>Shipping</span>
                    <span
                      className={
                        isFreeShipping ? 'anvi-cart-summary-row--highlight' : ''
                      }
                    >
                      {isFreeShipping ? 'Complimentary' : formatPrice(shippingCost)}
                    </span>
                  </div>

                  <div className="anvi-cart-summary-row">
                    <span>Boutique Keepsake Box</span>
                    <span className="anvi-cart-summary-row--highlight">
                      Included
                    </span>
                  </div>

                  <div className="anvi-cart-summary-total-row">
                    <span className="anvi-cart-summary-total-label">
                      Estimated Total
                    </span>
                    <span className="anvi-cart-summary-total-val">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <p className="anvi-cart-summary-taxes-note">
                  All taxes included. Free insured delivery and boutique packaging
                  on all orders.
                </p>

                {/* Primary CTA: PROCEED TO CHECKOUT */}
                <button
                  type="button"
                  className="anvi-cart-summary-checkout-btn"
                  onClick={handleCheckout}
                >
                  <Lock size={15} strokeWidth={2} />
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={15} strokeWidth={2} />
                </button>

                <Link href="/shop" className="anvi-cart-summary-continue-link">
                  Continue Shopping
                </Link>

                {/* Useful Shipping / Exchange Information */}
                <div className="anvi-cart-page-info-box">
                  <div className="anvi-cart-info-item">
                    <Truck size={16} className="anvi-cart-info-glyph" />
                    <span>
                      <strong>Dispatches in 24–48 Hours:</strong> Express insured
                      courier dispatch from our Coimbatore studio with real-time
                      tracking.
                    </span>
                  </div>

                  <div className="anvi-cart-info-item">
                    <RefreshCw size={16} className="anvi-cart-info-glyph" />
                    <span>
                      <strong>7-Day Boutique Exchanges:</strong> Seamless doorstep
                      exchange if the drape or sizing isn't completely perfect.
                    </span>
                  </div>

                  <div className="anvi-cart-info-item">
                    <ShieldCheck size={16} className="anvi-cart-info-glyph" />
                    <span>
                      <strong>Certified Handloom:</strong> Ethically woven with
                      authentic natural fibers and azo-free dyes.
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
