import React from 'react';
import {
  RotateCcw,
  AlertCircle,
  WifiOff,
  CreditCard,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  Package,
} from 'lucide-react';
import './ErrorState.css';

export type ErrorVariant = 'full-page' | 'card' | 'inline' | 'banner';
export type ErrorScope = 'catalog' | 'payment' | 'cart' | 'network' | 'order' | 'general';

export interface ErrorAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ErrorStateProps {
  variant?: ErrorVariant;
  scope?: ErrorScope;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: ErrorAction;
  showConcierge?: boolean;
  onDismiss?: () => void;
  className?: string;
}

interface ScopeDefaults {
  title: string;
  message: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SCOPE_CONFIG: Record<ErrorScope, ScopeDefaults> = {
  catalog: {
    title: 'Unable to retrieve silhouettes at this moment.',
    message:
      'Our studio catalogue is taking a quiet pause. Please refresh or check back in a few moments to view our handcrafted pieces.',
    icon: Package,
  },
  payment: {
    title: 'Your payment could not be completed.',
    message:
      'Your card was not charged, and your chosen garments remain safely reserved in your bag. Please verify your payment details or try an alternative method such as UPI.',
    icon: CreditCard,
  },
  cart: {
    title: 'Unable to update your shopping bag.',
    message:
      'Your selected heirlooms remain safely preserved in our system. Please refresh to synchronize your bag.',
    icon: ShoppingBag,
  },
  network: {
    title: 'Connection momentarily paused.',
    message:
      'It appears your internet signal drifted away. We will gladly reconnect as soon as your network is restored.',
    icon: WifiOff,
  },
  order: {
    title: 'Unable to locate order details.',
    message:
      'We could not load this order record right now. Your purchase confirmation is secure in our studio records.',
    icon: AlertCircle,
  },
  general: {
    title: 'A momentary pause in our studio.',
    message:
      'We encountered an unexpected pause while tending to your request. Your selections remain safe.',
    icon: AlertCircle,
  },
};

/**
 * ANVI Unified Error State Component
 * Delivers human, polite, reassuring, and actionable error states
 * across full pages, cards, inline forms, and notification banners.
 * Never exposes raw technical exceptions to patrons.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  variant = 'card',
  scope = 'general',
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  secondaryAction,
  showConcierge = true,
  onDismiss,
  className = '',
}) => {
  const config = SCOPE_CONFIG[scope] || SCOPE_CONFIG.general;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const Icon = config.icon;

  // 1. BANNER VARIANT (e.g. Header or top notification bar)
  if (variant === 'banner') {
    return (
      <aside className={`anvi-error-banner ${className}`} role="alert">
        <div className="anvi-error-banner-text">
          <Icon size={16} />
          <span>{displayMessage}</span>
        </div>
        <div className="anvi-error-banner-actions">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="anvi-btn-banner-retry"
            >
              {retryLabel}
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="anvi-btn-banner-dismiss"
            >
              Dismiss
            </button>
          )}
        </div>
      </aside>
    );
  }

  // 2. INLINE VARIANT (e.g. Inside Checkout payment step or Address form)
  if (variant === 'inline') {
    return (
      <div className={`anvi-error-inline ${className}`} role="alert">
        <Icon size={18} className="anvi-error-inline-icon" />
        <div className="anvi-error-inline-content">
          <h4 className="anvi-error-inline-title">{displayTitle}</h4>
          <p className="anvi-error-inline-desc">{displayMessage}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="anvi-error-inline-action"
            >
              <RotateCcw size={13} />
              <span>{retryLabel}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. FULL PAGE VARIANT (e.g. Top-level boundary fallback)
  if (variant === 'full-page') {
    return (
      <div className={`anvi-error-full-page ${className}`} role="alert">
        <div className="anvi-error-container">
          <div className="anvi-error-icon-seal">
            <Icon size={28} />
          </div>
          <span className="anvi-error-eyebrow">Studio Client Care</span>
          <h1 className="anvi-error-title">{displayTitle}</h1>
          <p className="anvi-error-message">{displayMessage}</p>

          <div className="anvi-error-actions">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="anvi-error-btn anvi-error-btn--primary"
              >
                <RotateCcw size={15} />
                <span>{retryLabel}</span>
              </button>
            )}
            {secondaryAction &&
              (secondaryAction.href ? (
                <a
                  href={secondaryAction.href}
                  className="anvi-error-btn anvi-error-btn--secondary"
                >
                  <span>{secondaryAction.label}</span>
                  <ArrowRight size={14} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="anvi-error-btn anvi-error-btn--secondary"
                >
                  <span>{secondaryAction.label}</span>
                </button>
              ))}
          </div>

          {showConcierge && (
            <div className="anvi-error-concierge-hint">
              <MessageCircle size={15} color="#1e6d42" />
              <span>
                Need immediate styling or order assistance?{' '}
                <a
                  href="https://wa.me/919994837459?text=Hello%20ANVI%20Studio,%20I%20experienced%20an%20issue%20while%20browsing/shopping."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Converse with our WhatsApp concierge ↗
                </a>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. CARD VARIANT (Default: Section or Catalog fallback)
  return (
    <div className={`anvi-error-card ${className}`} role="alert">
      <div className="anvi-error-card-icon">
        <Icon size={24} />
      </div>
      <h3 className="anvi-error-card-title">{displayTitle}</h3>
      <p className="anvi-error-card-desc">{displayMessage}</p>

      <div className="anvi-error-actions">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="anvi-error-btn anvi-error-btn--primary"
          >
            <RotateCcw size={14} />
            <span>{retryLabel}</span>
          </button>
        )}
        {secondaryAction &&
          (secondaryAction.href ? (
            <a
              href={secondaryAction.href}
              className="anvi-error-btn anvi-error-btn--secondary"
            >
              <span>{secondaryAction.label}</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="anvi-error-btn anvi-error-btn--secondary"
            >
              <span>{secondaryAction.label}</span>
            </button>
          ))}
      </div>

      {showConcierge && (
        <div className="anvi-error-concierge-hint" style={{ marginTop: 8 }}>
          <MessageCircle size={14} color="#1e6d42" />
          <span>
            Have a question?{' '}
            <a
              href="https://wa.me/919994837459"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Studio Concierge
            </a>
          </span>
        </div>
      )}
    </div>
  );
};
