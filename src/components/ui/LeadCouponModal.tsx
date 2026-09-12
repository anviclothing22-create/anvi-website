import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { X, Sparkles, Tag, Copy, Check, ArrowRight, ShieldCheck, Gift, Mail, Phone } from 'lucide-react';
import { submitLead, WELCOME_COUPON } from '../../lib/leadsApi';
import { normalizePhone, IN_PHONE_E164 } from '../../lib/validators';
import './LeadCouponModal.css';

const COUPON_CODE = WELCOME_COUPON;
const POPUP_DELAY_MS = 5000; // 5 seconds

export const LeadCouponModal: React.FC = () => {
  const [location, setLocation] = useLocation();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('anvi_lead_submitted') === 'true';
  });
  const [copied, setCopied] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockedCoupon, setUnlockedCoupon] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('anvi_unlocked_coupon') : null;
  });

  // Clean up any stale permanent traces from localStorage so every fresh visit starts clean
  useEffect(() => {
    try {
      localStorage.removeItem('anvi_lead_submitted');
      localStorage.removeItem('anvi_unlocked_coupon');
      localStorage.removeItem('anvi_lead_popup_dismissed');
      sessionStorage.removeItem('anvi_lead_popup_dismissed');
    } catch {
      // ignore
    }
  }, []);

  // Open modal programmatically
  const openModal = useCallback((showCodeOnly: boolean = false) => {
    if (showCodeOnly) {
      setIsSuccess(true);
    }
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      setIsOpen(true);
    }
  }, []);

  // Close modal programmatically
  const closeModal = useCallback(() => {
    if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
      setIsOpen(false);
    }
  }, []);

  // Handler specifically when user clicks the corner floating privilege badge
  const handleFloatingBadgeClick = () => {
    openModal(true);
  };

  // 5-second timer trigger:
  // - When customer opens or navigates to any new page: if lead hasn't been given yet, keep following back after 5 seconds.
  // - Once customer HAS given lead in this session: stop following back completely.
  // - When customer closes the website and reopens it: fresh session begins, starts from first without stale traces.
  useEffect(() => {
    // Do not show popup on checkout page
    if (location === '/checkout') return;

    // Check if lead was already provided in this session
    const isSubmitted = sessionStorage.getItem('anvi_lead_submitted') === 'true';
    if (isSubmitted) {
      return; // Stop following back once lead is submitted!
    }

    // Customer hasn't given lead yet: set to lead form mode and start 5-second timer
    setIsSuccess(false);

    const timer = setTimeout(() => {
      if (window.location.pathname !== '/checkout') {
        const alreadySubmitted = sessionStorage.getItem('anvi_lead_submitted') === 'true';
        if (!alreadySubmitted && dialogRef.current && !dialogRef.current.open) {
          setIsSuccess(false);
          dialogRef.current.showModal();
          setIsOpen(true);
        }
      }
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [location]);

  // Light-dismiss click outside fallback according to modern-web-guidance
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleDialogClick = (event: MouseEvent) => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (!isDialogContent) {
          closeModal();
        }
      }
    };

    const handleCancel = () => {
      setIsOpen(false);
    };

    dialog.addEventListener('click', handleDialogClick);
    dialog.addEventListener('cancel', handleCancel);

    return () => {
      dialog.removeEventListener('click', handleDialogClick);
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [closeModal]);

  // Handle lead submission — Supabase-first, session unlock always applies
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Please provide your name so we can address you with honor.');
      return;
    }

    if (!cleanEmail) {
      setError('Please provide your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. patron@example.com).');
      return;
    }

    if (!cleanPhone) {
      setError('Please provide your WhatsApp phone number.');
      return;
    }

    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      return;
    }
    const e164 = normalizePhone(cleanPhone);
    if (!IN_PHONE_E164.test(e164)) {
      setError('Use an Indian mobile number starting 6–9 (e.g. +91 98765 43210).');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitLead({
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        source: 'website_popup',
      });
    } catch {
      // Offline or unreachable backend: keep the session unlock for UX.
      // Checkout validates the coupon server-side regardless.
      try {
        sessionStorage.setItem('anvi_unlocked_coupon', COUPON_CODE);
        sessionStorage.setItem('anvi_lead_submitted', 'true');
      } catch {
        // private mode — voucher still shown below
      }
    }

    setUnlockedCoupon(COUPON_CODE);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  // Copy coupon code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Proceed to shop
  const handleProceedToShop = () => {
    closeModal();
    setLocation('/shop');
  };

  return (
    <>
      {/* Floating reminder pill at bottom left if patron unlocked code or wants to open */}
      {unlockedCoupon && !isOpen && location !== '/checkout' && (
        <button
          type="button"
          onClick={handleFloatingBadgeClick}
          className="anvi-lead-floating-badge"
          aria-label="View your unlocked 10% privilege voucher"
        >
          <Tag className="w-4 h-4 text-anvi-gold" />
          <span>Privilege Code:</span>
          <span className="anvi-lead-floating-code">{unlockedCoupon}</span>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold">
            10% OFF
          </span>
        </button>
      )}

      {/* Main Modal Dialog */}
      <dialog
        ref={dialogRef}
        className="anvi-lead-dialog"
        closedby="any"
        aria-labelledby="lead-popup-title"
      >
        <div className="anvi-lead-modal-card">
          {/* Close button */}
          <button
            type="button"
            className="anvi-lead-close-btn"
            onClick={closeModal}
            aria-label="Close privilege invitation"
          >
            <X size={16} />
          </button>

          {/* Left Visual Banner (Desktop) */}
          <div className="anvi-lead-image-pane">
            <img
              src="/images/campaigns/festive_campaign_main.jpg"
              alt="ANVI Haute Couture Festive Heritage"
              className="anvi-lead-banner-img"
              loading="lazy"
            />
            <div className="anvi-lead-image-overlay">
              <span className="anvi-lead-image-seal">HOUSE OF ANVI</span>
              <p className="anvi-lead-image-quote">
                "Where pure zari weaves meet modern south-Indian grace."
              </p>
            </div>
          </div>

          {/* Right Column: Lead Form OR Voucher Reveal */}
          <div className="anvi-lead-content-pane">
            {!isSuccess ? (
              <>
                <div className="anvi-lead-kicker">
                  <Sparkles size={14} />
                  <span>The ANVI Privilege Circle</span>
                </div>

                <h2 id="lead-popup-title" className="anvi-lead-title">
                  Unlock 10% Off Your First Order
                </h2>

                <p className="anvi-lead-desc">
                  Join our bespoke circle for private salon previews, heirloom styling advice, and an instant 10% privilege voucher for your purchase.
                </p>

                <form onSubmit={handleSubmit} className="anvi-lead-form">
                  {error && <div className="anvi-lead-error" role="alert">{error}</div>}

                  <div className="anvi-lead-field-group">
                    <label htmlFor="lead-name" className="anvi-lead-label">
                      Your Full Name
                    </label>
                    <div className="anvi-lead-input-wrap">
                      <input
                        id="lead-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aaradhya Sharma"
                        className="anvi-lead-input"
                      />
                    </div>
                  </div>

                  <div className="anvi-lead-field-group">
                    <label htmlFor="lead-email" className="anvi-lead-label">
                      Email Address
                    </label>
                    <div className="anvi-lead-input-wrap">
                      <Mail size={15} className="anvi-lead-input-icon" />
                      <input
                        id="lead-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. patron@gmail.com"
                        className="anvi-lead-input anvi-lead-input-with-icon"
                      />
                    </div>
                  </div>

                  <div className="anvi-lead-field-group">
                    <label htmlFor="lead-phone" className="anvi-lead-label">
                      WhatsApp Number
                    </label>
                    <div className="anvi-lead-input-wrap">
                      <Phone size={15} className="anvi-lead-input-icon" />
                      <input
                        id="lead-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="anvi-lead-input anvi-lead-input-with-icon"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="anvi-lead-submit-btn"
                  >
                    <span>{isSubmitting ? 'Unlocking Privilege...' : 'Claim My 10% Privilege Code'}</span>
                    <ArrowRight size={15} />
                  </button>

                  <div className="anvi-lead-footer">
                    <span className="anvi-lead-privacy">
                      <ShieldCheck size={12} />
                      <span>Zero spam. Direct WhatsApp/email curation only.</span>
                    </span>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="anvi-lead-dismiss-link"
                    >
                      No thanks, I will shop at regular price
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success / Voucher Code Unlocked Screen */
              <div className="anvi-lead-success-pane">
                <div className="anvi-lead-success-badge">
                  <Gift size={28} />
                </div>

                <div className="anvi-lead-kicker">
                  <Sparkles size={14} />
                  <span>Welcome to the Family</span>
                </div>

                <h2 id="lead-popup-title" className="anvi-lead-success-title">
                  Your 10% Privilege Code
                </h2>

                <p className="anvi-lead-success-subtitle">
                  Warmest welcome, {fullName || 'esteemed patron'}! Use this privilege code during checkout to enjoy 10% off your entire order.
                </p>

                {/* Voucher Ticket Box */}
                <div className="anvi-voucher-ticket">
                  <p className="anvi-voucher-tagline">ANVI BOUTIQUE PRIVILEGE VOUCHER</p>
                  <div className="anvi-voucher-code-row">
                    <span className="anvi-voucher-code-text">{COUPON_CODE}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className={`anvi-voucher-copy-btn ${copied ? 'copied' : ''}`}
                    >
                      {copied ? (
                        <>
                          <Check size={14} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="anvi-voucher-terms">
                    Applicable on all handwoven Kanjeevarams, ready-to-wear & festive curations.
                  </p>
                  <div>
                    <span className="anvi-voucher-applied-pill">
                      <Check size={12} />
                      <span>Pre-activated for your checkout session</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="anvi-voucher-actions">
                  <button
                    type="button"
                    onClick={handleProceedToShop}
                    className="anvi-voucher-shop-btn"
                  >
                    <span>Shop Curations with 10% Off</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="anvi-voucher-continue-btn"
                  >
                    Continue browsing storefront
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
};

export default LeadCouponModal;
