import React, { useEffect } from 'react';
import { X, ShoppingBag, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useCart } from '../../hooks/useCart';
import { useScrollLock } from '../../hooks/useScrollLock';
import { formatPrice } from '../../lib/formatters';
import './CartDrawer.css';


export interface CartDrawerProps {
  onCheckout?: () => void;
  onViewBag?: () => void;
}

/**
 * ANVI Cart Drawer
 * Desktop: Refined side drawer (480px)
 * Mobile: Full-height dedicated bag experience
 *
 * Features:
 * - Real-time CartContext synchronization
 * - Product image, name, variant, stepper quantity, price, remove action
 * - Subtotal & dynamic complimentary shipping meter
 * - Added-to-bag clear success notification state
 * - "Do not interrupt shopping" easy dismissal
 * - Primary Checkout & Secondary View Bag CTAs
 */
export const CartDrawer: React.FC<CartDrawerProps> = ({
  onCheckout,
  onViewBag,
}) => {
  const {
    items,
    itemCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    lastAddedItem,
    clearLastAddedItem,
  } = useCart();

  // Lock background scroll when drawer is open
  useScrollLock(isCartOpen);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  const [, setLocation] = useLocation();

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const handleCheckoutClick = () => {
    handleClose();
    if (onCheckout) {
      onCheckout();
    } else {
      setLocation('/checkout');
    }
  };

  const handleViewBagClick = () => {
    handleClose();
    if (onViewBag) {
      onViewBag();
    }
  };

  const shippingRemaining = 0;
  // Free delivery for all orders for now
  const isFreeShipping = true;
  const shippingPercent = 100;

  return (
    <>
      {/* Dimmed Backdrop */}
      <div
        className={`anvi-cart-backdrop ${
          isCartOpen ? 'anvi-cart-backdrop--open' : ''
        }`}
        onClick={handleClose}
        aria-hidden={!isCartOpen}
      />

      {/* Side / Full-Height Drawer */}
      <aside
        className={`anvi-cart-drawer ${
          isCartOpen ? 'anvi-cart-drawer--open' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
        aria-hidden={!isCartOpen}
      >
        {/* Header */}
        <div className="anvi-cart-header">
          <div className="anvi-cart-header-title-wrap">
            <h2 className="anvi-cart-header-title">Shopping Bag</h2>
            <span className="anvi-cart-header-count">
              ({itemCount} {itemCount === 1 ? 'piece' : 'pieces'})
            </span>
          </div>
          <button
            type="button"
            className="anvi-cart-close-btn"
            onClick={handleClose}
            aria-label="Close shopping bag"
          >
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>

        {/* Clear Success State Banner when item is added */}
        {lastAddedItem && (
          <div className="anvi-cart-success-banner" role="status">
            <div className="anvi-cart-success-left">
              <Check size={15} strokeWidth={2.5} />
              <span>
                <strong>{lastAddedItem.name}</strong> added to bag
              </span>
            </div>
            <button
              type="button"
              className="anvi-cart-success-dismiss"
              onClick={clearLastAddedItem}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Shipping Progress Meter */}
        {items.length > 0 && (
          <div className="anvi-cart-shipping-bar">
            <p className="anvi-cart-shipping-text">
              {isFreeShipping ? (
                <>
                  <span>✦</span> You have qualified for{' '}
                  <strong>Complimentary Insured Delivery</strong> across India
                </>
              ) : (
                <>
                  Add <strong>{formatPrice(shippingRemaining)}</strong> more for{' '}
                  <strong>Complimentary Insured Delivery</strong>
                </>
              )}
            </p>
            <div
              className="anvi-cart-progress-track"
              role="progressbar"
              aria-valuenow={shippingPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`anvi-cart-progress-fill ${
                  isFreeShipping ? 'anvi-cart-progress-fill--complete' : ''
                }`}
                style={{ width: `${shippingPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Items or Empty State */}
        <div className="anvi-cart-items-container">
          {items.length === 0 ? (
            <div className="anvi-cart-empty">
              <div className="anvi-cart-empty-icon">
                <ShoppingBag size={24} strokeWidth={1.2} />
              </div>
              <h3 className="anvi-cart-empty-title">Your bag is waiting.</h3>
              <p className="anvi-cart-empty-text">
                Discover pieces selected for your everyday and special moments.
              </p>
              <Link
                href="/collections/new-arrivals"
                className="anvi-cart-empty-btn"
                onClick={handleClose}
              >
                Shop New Arrivals
              </Link>
            </div>
          ) : (
            <div role="list">
              {items.map((item) => {
                const isNewlyAdded = lastAddedItem?.id === item.id;
                const itemSlug = item.slug || 'ajrakh-chanderi-silk-saree';

                return (
                  <div
                    key={item.id}
                    role="listitem"
                    className={`anvi-cart-item ${
                      isNewlyAdded ? 'anvi-cart-item--highlight' : ''
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <Link
                      href={`/product/${itemSlug}`}
                      className="anvi-cart-item-img-wrap"
                      onClick={handleClose}
                    >
                      <img
                        src={item.image || '/images/products/saree_ajrakh_1.jpg'}
                        alt={item.name}
                        className="anvi-cart-item-img"
                      />
                    </Link>

                    {/* Details */}
                    <div className="anvi-cart-item-details">
                      <div className="anvi-cart-item-top">
                        <div>
                          <Link
                            href={`/product/${itemSlug}`}
                            className="anvi-cart-item-title-link"
                            onClick={handleClose}
                          >
                            <h4 className="anvi-cart-item-title">{item.name}</h4>
                          </Link>
                          {item.size && (
                            <p className="anvi-cart-item-variant">
                              Size: {item.size}
                            </p>
                          )}
                        </div>
                        <span className="anvi-cart-item-price">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Bottom Controls */}
                      <div className="anvi-cart-item-bottom">
                        {/* Stepper */}
                        <div
                          className="anvi-cart-stepper"
                          aria-label={`Quantity for ${item.name}`}
                        >
                          <button
                            type="button"
                            className="anvi-cart-stepper-btn"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="anvi-cart-stepper-value">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="anvi-cart-stepper-btn"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          className="anvi-cart-remove-btn"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from bag`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Checkout Area (Visible when items exist) */}
        {items.length > 0 && (
          <div className="anvi-cart-footer">
            <div className="anvi-cart-subtotal-row">
              <span className="anvi-cart-subtotal-label">Subtotal</span>
              <span className="anvi-cart-subtotal-value">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="anvi-cart-tax-notice">
              All taxes included · Complimentary delivery across India
            </p>

            <div className="anvi-cart-actions">
              {/* Primary CTA: Checkout */}
              <button
                type="button"
                className="anvi-cart-checkout-btn"
                onClick={handleCheckoutClick}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>

              {/* Secondary CTA: View Bag */}
              <Link
                href="/cart"
                className="anvi-cart-view-bag-btn"
                onClick={handleViewBagClick}
              >
                View Bag &amp; Continue
              </Link>

              {/* Graceful continue shopping link */}
              <button
                type="button"
                className="anvi-cart-continue-link"
                onClick={handleClose}
              >
                Continue Shopping
              </button>
            </div>

            <div className="anvi-cart-security-badge">
              <ShieldCheck size={14} strokeWidth={1.4} />
              <span>Authentic Handloom · 7-Day Boutique Exchanges</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
