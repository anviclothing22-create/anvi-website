import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Lock,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowLeft,
  Tag,
  X,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import { formatPrice } from '../../lib/formatters';
import type { Order, OrderItem } from '../../data/orders';
import type { CartItem } from '../../context/cart-context';
import { STORAGE_KEYS, getStoredItem, setStoredItem, broadcastStoreUpdate } from '../../lib/storeSync';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { validateCoupon } from '../../lib/couponsApi';
import { attachVerifiedPayment, createOrder, fetchOrderById, toStorefrontOrder, type ServerOrder } from '../../lib/ordersApi';
import { getUnlockedCoupon } from '../../lib/leadsApi';
import { IN_PINCODE, IN_PHONE_E164, normalizePhone } from '../../lib/validators';
import {
  MIN_ORDER_PAISE,
  createRazorpayOrder,
  isRazorpayConfigured,
  loadRazorpayScript,
  openRazorpayCheckout,
  verifyRazorpayPayment,
  type RazorpaySuccessResponse,
} from '../../lib/razorpayApi';
import './CheckoutPage.css';

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  isActive?: boolean;
  endDate?: string;
  description?: string;
}

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minSpend: 0,
    maxDiscount: 2000,
    isActive: true,
    description: '10% privilege discount unlocked via 5s storefront lead popup.',
  },
  {
    code: 'FIRSTANVI',
    type: 'percentage',
    value: 10,
    minSpend: 2500,
    maxDiscount: 1000,
    isActive: true,
    description: '10% off for first-time website patrons on orders above ₹2,500.',
  },
  {
    code: 'FESTIVE500',
    type: 'fixed',
    value: 500,
    minSpend: 4000,
    isActive: true,
    description: 'Flat ₹500 discount on festive sarees & sets above ₹4,000.',
  },
  {
    code: 'BOUTIQUE15',
    type: 'percentage',
    value: 15,
    minSpend: 5000,
    isActive: true,
    description: 'Special Coimbatore boutique launch celebration code: 15% off.',
  },
];

/**
 * ANVI Checkout Experience
 * Connected purchasing architecture, order persistence,
 * 6-stage visual order tracking timeline, and error recovery.
 */
export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart, addItem } = useCart();
  const { user } = useAuth();
  const liveProducts = useLiveProducts();
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  // Mobile summary accordion toggle
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Promo Code State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Auto-apply privilege coupon unlocked from storefront lead popup.
  // Signed-in patrons validate server-side; guests use the local boutique list.
  useEffect(() => {
    const unlocked = getUnlockedCoupon();
    if (!unlocked) return;
    const code = unlocked.toUpperCase();
    if (user && isSupabaseConfigured()) {
      void validateCoupon(code, subtotal)
        .then((res) => {
          if (res.valid) {
            setAppliedCoupon({ code, type: 'fixed', value: res.discount_int, description: 'Server-validated privilege voucher.' });
            setCouponSuccess(`Privilege voucher "${code}" applied! Enjoy your boutique discount.`);
          }
        })
        .catch(() => {
          // offline — patron can still apply manually at checkout
        });
      return;
    }
    const allCoupons = getStoredItem<Coupon[]>(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
    const found = allCoupons.find((c) => c.code.toUpperCase() === code && c.isActive !== false);
    if (found) {
      setAppliedCoupon(found);
      setCouponSuccess(`Privilege voucher "${found.code}" applied! Enjoy 10% off.`);
    }
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    contact: '',
    whatsappUpdates: true,
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    phone: '',
  });

  // Delivery method selection
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>(
    'standard'
  );

  // Payment method selection (online methods go through Razorpay Standard Checkout)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>(
    'cod'
  );

  // Submission & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Set only after server-side signature verification — never on modal callback alone.
  const [verifiedPayment, setVerifiedPayment] = useState<{ paymentId: string; orderId: string } | null>(null);

  // Shipping calculations (Free delivery for all orders for now)
  const standardShippingCost = 0;
  const expressShippingCost = 0;
  const shippingFee = 0;

  // Coupon Discount calculation
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      const calculated = Math.round((subtotal * appliedCoupon.value) / 100);
      return appliedCoupon.maxDiscount ? Math.min(calculated, appliedCoupon.maxDiscount) : calculated;
    }
    return Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (user && isSupabaseConfigured()) {
      try {
        const res = await validateCoupon(cleanCode, subtotal);
        if (!res.valid) {
          setCouponError(res.reason || 'This coupon code is not valid for your order.');
          return;
        }
        setAppliedCoupon({
          code: cleanCode,
          type: 'fixed',
          value: res.discount_int,
          description: 'Server-validated coupon',
        });
        setCouponSuccess(`Coupon code "${cleanCode}" applied successfully!`);
        setCouponInput('');
        return;
      } catch {
        // fallback to local list if server call fails
      }
    }

    const allCoupons = getStoredItem<Coupon[]>(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
    const match = allCoupons.find(
      (c) => c.code.toUpperCase() === cleanCode && c.isActive !== false
    );

    if (!match) {
      setCouponError('Invalid coupon code. Try FIRSTANVI or FESTIVE500.');
      return;
    }

    if (match.minSpend && subtotal < match.minSpend) {
      setCouponError(
        `This code requires a minimum purchase of ${formatPrice(match.minSpend)}.`
      );
      return;
    }

    setAppliedCoupon(match);
    setCouponSuccess(`Coupon code "${match.code}" applied successfully!`);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resolveProductId = (item: CartItem): string | null => {
    if (item.productId) return item.productId;
    const match = liveProducts.find(
      (p) => (item.slug && p.slug === item.slug) || p.id === item.id || p.name === item.name
    );
    return match ? match.id : null;
  };

  const orderItemsFromCart = (): OrderItem[] =>
    items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size || 'Free Size',
      image: item.image || '/images/products/saree_ajrakh_1.jpg',
      slug: item.slug || 'ajrakh-chanderi-silk-saree',
    }));

  const shippingAddressFromForm = (): { name: string; street: string; city: string; state: string; pincode: string; phone: string } => ({
    name: `${formData.firstName} ${formData.lastName}`.trim() || 'Valued Patron',
    street: [formData.address, formData.apartment].filter(Boolean).join(', ') || '146, Raju Naidu St, Tatabad',
    city: formData.city || 'Coimbatore',
    state: formData.state || 'Tamil Nadu',
    pincode: formData.pincode || '641012',
    phone: formData.phone || '+91 99948 37459',
  });

  const paymentLabel = (): string =>
    paymentMethod === 'upi'
      ? 'UPI (Instant Verification)'
      : paymentMethod === 'card'
      ? 'Credit / Debit Card'
      : paymentMethod === 'netbanking'
      ? 'Net Banking'
      : 'Cash on Delivery (Verified)';

  /** Display label for placed orders — marks server-verified prepaid payments. */
  const displayPaymentMethod = (): string =>
    verifiedPayment ? `${paymentLabel()} · Prepaid (Razorpay)` : paymentLabel();

  const deliveryLabel = (): string =>
    deliveryMethod === 'standard' ? 'Standard Insured Delivery' : 'Express Air Courier';

  /** Server-authoritative order: re-priced, stock-checked, coupon-validated. */
  const placeServerOrder = async (verified?: { paymentId: string; orderId: string } | null): Promise<void> => {
    setIsSubmitting(true);
    try {
      const lines = items.map((item) => {
        const pid = resolveProductId(item);
        if (!pid) {
          throw new Error(`We could not find "${item.name}" in the live catalog. Please remove it from your bag and try again.`);
        }
        return { product_id: pid, quantity: item.quantity, size: item.size || 'Free Size' };
      });
      const addr = shippingAddressFromForm();
      const created = await createOrder({
        items: lines,
        address: { ...addr, contact: formData.contact },
        deliveryMethod,
        paymentMethod,
        couponCode: appliedCoupon?.code ?? null,
        idempotencyKey,
      });

      // Flip the order to paid by consuming the one-time server-side confirmation.
      if (verified) {
        try {
          await attachVerifiedPayment(created.order_id, verified.orderId, verified.paymentId);
        } catch {
          // Signature was already verified; leave the order pending for manual
          // reconciliation rather than risking a wrong paid state.
        }
      }

      // Authoritative confirmation screen
      let finalOrder: Order;
      try {
        const full = (await fetchOrderById(created.order_id)) as ServerOrder;
        finalOrder = toStorefrontOrder(full);
      } catch {
        const orderDate = new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
        finalOrder = {
          id: created.order_number,
          date: orderDate,
          status: 'In Studio Preparation',
          items: orderItemsFromCart(),
          subtotal,
          discount: discountAmount,
          couponCode: appliedCoupon?.code,
          shipping: shippingFee,
          total: created.total_int,
          deliveryMethod: deliveryLabel(),
          courier: 'BlueDart Express',
          trackingNumber: undefined,
          shippingAddress: addr,
          paymentMethod: displayPaymentMethod(),
        };
      }
      setPlacedOrder(finalOrder);

      // Persist and broadcast across ports to admin dashboard
      try {
        const existing = getStoredItem<any[]>(STORAGE_KEYS.ORDERS, []);
        setStoredItem(STORAGE_KEYS.ORDERS, [finalOrder, ...existing], 'ORDER_PLACED');
      } catch {
        // ignore
      }
      setIsSubmitting(false);
      setIsOrderPlaced(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(
        err instanceof Error ? err.message : 'Your order could not be placed. Your bag is preserved — please try again.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setPaymentFailed(false);
    // Production validation — Indian PIN + E.164 phone. Server re-validates via create_order.
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      setSubmitError('Please enter your first name.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.address.trim() || formData.address.trim().length < 8) {
      setSubmitError('Please enter your full street address (min 8 characters).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.city.trim()) {
      setSubmitError('Please enter your city.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!IN_PINCODE.test(formData.pincode.trim())) {
      setSubmitError('Enter a valid 6-digit PIN code (e.g. 641012).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const e164 = normalizePhone(formData.phone || '');
    if (!IN_PHONE_E164.test(e164)) {
      setSubmitError('Enter a valid Indian mobile number starting 6–9 (+91 …).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Online methods (UPI / card / netbanking) collect payment via Razorpay
    // Standard Checkout first; the ANVI order is placed only after verification.
    if (paymentMethod !== 'cod') {
      void startRazorpayFlow(e164);
      return;
    }
    if (user && isSupabaseConfigured()) {
      void placeServerOrder();
      return;
    }
    // Guest COD orders are local-only (never reach Supabase — see create_order auth policy).
    placeLocalOrder();
  };

  /**
   * Razorpay Standard Checkout flow:
   * 1. create order server-side (Edge Function holds KEY_SECRET)
   * 2. open checkout.js modal
   * 3. verify signature server-side -> then place the ANVI order.
   * The bag is preserved on dismiss / failure / verification errors.
   */
  const startRazorpayFlow = async (e164phone: string): Promise<void> => {
    if (items.length === 0) {
      setSubmitError('Your bag is empty. Add a garment before paying.');
      return;
    }
    if (!isRazorpayConfigured()) {
      setSubmitError('Online payments are not enabled yet. Please choose Cash on Delivery or reach our concierge on WhatsApp.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const amountPaise = Math.round(total * 100);
    if (!Number.isFinite(amountPaise) || amountPaise < MIN_ORDER_PAISE) {
      setSubmitError('Order total is below the minimum online payable amount (₹1).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsSubmitting(true);
    try {
      await loadRazorpayScript();
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Could not load the payment window. Try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    let rzpOrder;
    try {
      rzpOrder = await createRazorpayOrder({
        amountPaise,
        receipt: `anvi-${idempotencyKey.replace(/-/g, '')}`,
        notes: {
          boutique: 'ANVI Clothing',
          delivery_method: deliveryMethod,
          coupon: appliedCoupon?.code ?? '',
        },
      });
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Could not start the payment. Try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const digits = e164phone.replace(/\D/g, '');
    const contact10 = digits.length >= 10 ? digits.slice(-10) : '';
    const email = /.+@.+\..+/.test(formData.contact.trim()) ? formData.contact.trim() : '';
    try {
      openRazorpayCheckout({
        order: rzpOrder,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim() || 'ANVI Patron',
          email,
          contact: contact10,
        },
        description: `ANVI boutique order · ${items.length} item${items.length === 1 ? '' : 's'}`,
        onSuccess: (response) => {
          void handleRazorpaySuccess(response);
        },
        onDismiss: () => {
          setIsSubmitting(false);
          setSubmitError('Payment window was closed before completion. Your bag is preserved — try again or choose Cash on Delivery.');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onFailed: (message) => {
          setIsSubmitting(false);
          setPaymentFailed(true);
          setSubmitError(message);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Could not open the payment window. Try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /** Verify the gateway signature server-side, then place the ANVI order. Never trusts the modal callback alone. */
  const handleRazorpaySuccess = async (response: RazorpaySuccessResponse): Promise<void> => {
    let verified: { paymentId: string; orderId: string } | null = null;
    try {
      const result = await verifyRazorpayPayment({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
      });
      verified = { paymentId: result.payment_id, orderId: result.order_id };
      setVerifiedPayment(verified);
    } catch (err) {
      setIsSubmitting(false);
      setPaymentFailed(true);
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Payment verification failed. Do not retry blindly — contact ANVI support with your payment reference.',
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (user && isSupabaseConfigured()) {
      await placeServerOrder(verified);
      return;
    }
    // Guest prepaid orders: payment verified server-side, order recorded locally.
    placeLocalOrder();
  };

  /** Guest/offline fallback: local boutique order, preserved bag on failure. */
  const placeLocalOrder = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `ANVI-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      });

      const orderItems: OrderItem[] = orderItemsFromCart();

      const newOrder: Order = {
        id: orderId,
        date: orderDate,
        status: 'In Studio Preparation',
        items: orderItems,
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        shipping: shippingFee,
        total,
        deliveryMethod: deliveryLabel(),
        courier: 'BlueDart Express',
        trackingNumber: `BLU-${Math.floor(10000000 + Math.random() * 90000000)}IN`,
        shippingAddress: shippingAddressFromForm(),
        paymentMethod: displayPaymentMethod(),
      };

      // Persist order into shared customer orders store and broadcast to admin
      try {
        const existing = getStoredItem<any[]>(STORAGE_KEYS.ORDERS, []);
        setStoredItem(STORAGE_KEYS.ORDERS, [newOrder, ...existing], 'ORDER_PLACED');
        broadcastStoreUpdate({
          type: 'ORDER_PLACED',
          timestamp: Date.now(),
          payload: newOrder,
        });
      } catch {
        // fallback
      }

      setPlacedOrder(newOrder);
      setIsSubmitting(false);
      setIsOrderPlaced(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  const renderPromoSection = () => (
    <div style={{ margin: '1rem 0', padding: '0.875rem', background: 'rgba(212, 178, 124, 0.09)', border: '1px solid rgba(212, 178, 124, 0.35)', borderRadius: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-maroon)' }}>
        <Tag size={14} />
        <span>Boutique Promo Voucher</span>
      </div>

      {appliedCoupon ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '0.5rem 0.75rem', border: '1px solid #16a34a', borderRadius: '3px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#15803d', letterSpacing: '0.05em' }}>
              {appliedCoupon.code}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(47, 43, 43, 0.7)' }}>
              {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% discount applied` : `₹${appliedCoupon.value} discount applied`}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            <X size={14} /> Remove
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="e.g. FIRSTANVI"
            value={couponInput}
            onChange={(e) => {
              setCouponInput(e.target.value);
              setCouponError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyCoupon();
              }
            }}
            style={{
              flex: 1,
              padding: '0.45rem 0.65rem',
              fontSize: '0.8125rem',
              border: '1px solid rgba(91, 23, 39, 0.25)',
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          />
          <button
            type="button"
            onClick={() => handleApplyCoupon()}
            style={{
              padding: '0.45rem 0.875rem',
              background: 'var(--color-maroon)',
              color: '#FAF7F2',
              border: 'none',
              borderRadius: '3px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>
      )}

      {couponError && (
        <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>
          {couponError}
        </p>
      )}
      {couponSuccess && (
        <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#15803d' }}>
          {couponSuccess}
        </p>
      )}
    </div>
  );

  const handleAddSampleItem = () => {
    addItem({
      id: 'demo-saree',
      name: 'Ajrakh Chanderi Silk Saree',
      price: 8900,
      quantity: 1,
      size: 'Free Size',
      image: '/images/products/saree_ajrakh_1.jpg',
      slug: 'ajrakh-chanderi-silk-saree',
      openDrawer: false,
    });
  };

  // =========================================================================
  // 1. ORDER CONFIRMATION / SUCCESS VIEW WITH 6-STAGE TRACKING TIMELINE
  // =========================================================================
  if (isOrderPlaced && placedOrder) {
    return (
      <div className="anvi-checkout-page">
        <header className="anvi-checkout-header">
          <div className="anvi-checkout-header-inner">
            <Link href="/" className="anvi-checkout-logo-link" aria-label="ANVI Home">
              <img
                src="/images/brand/anvi_logo.png"
                alt="ANVI"
                className="anvi-checkout-logo-img"
              />
            </Link>
            <div className="anvi-checkout-trust-badge">
              <ShieldCheck size={16} className="anvi-checkout-trust-badge-icon" />
              <span>Order Confirmed</span>
            </div>
          </div>
        </header>

        <div className="anvi-checkout-success">
          <div className="anvi-checkout-success-icon" aria-hidden="true">
            <Check size={32} strokeWidth={2.5} />
          </div>

          <h1 className="anvi-checkout-success-title">
            Thank you for your order.
          </h1>

          <p className="anvi-checkout-success-order-id">
            Order Reference: <strong>#{placedOrder.id}</strong>
          </p>
          {verifiedPayment && (
            <p className="anvi-checkout-success-order-id">
              Razorpay Payment ID: <strong>{verifiedPayment.paymentId}</strong> · signature verified
            </p>
          )}

          <div className="anvi-checkout-success-card">
            <h2 className="anvi-checkout-success-card-title">
              Studio Keepsake Preparation · Coimbatore
            </h2>
            <p className="anvi-checkout-success-card-text">
              We have received your order. Our master artisans and finishing team have begun inspecting your handloom piece in our signature keepsake box. Dispatch details and live courier updates will be sent to{' '}
              <strong>{formData.contact || 'your contact'}</strong>.
            </p>
          </div>

          {/* Purchased Garments Breakdown */}
          <div className="anvi-checkout-confirmation-items">
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-maroon)', margin: '0 0 0.75rem' }}>
              Garments in this Order ({placedOrder.items.length})
            </h3>
            {placedOrder.items.map((item) => (
              <div key={item.id} className="anvi-checkout-confirmation-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="anvi-checkout-confirmation-thumb"
                />
                <div className="anvi-checkout-confirmation-details">
                  <h4 className="anvi-checkout-confirmation-name">{item.name}</h4>
                  <span className="anvi-checkout-confirmation-meta">
                    Size: {item.size || 'Free Size'} · Qty: {item.quantity}
                  </span>
                </div>
                <span className="anvi-checkout-confirmation-price">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(47, 43, 43, 0.1)', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--color-charcoal)' }}>
              <span>Total Paid:</span>
              <span style={{ color: 'var(--color-maroon)' }}>{formatPrice(placedOrder.total)}</span>
            </div>
          </div>

          {/* Order Actions */}
          <div className="anvi-checkout-success-actions" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href={`https://wa.me/919994837459?text=${encodeURIComponent(
                `Hello ANVI Studio, I have placed order #${placedOrder.id} for ${formatPrice(placedOrder.total)}. Please confirm my order details.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="anvi-checkout-success-btn"
              style={{ background: '#1e6d42', borderColor: '#1e6d42', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <MessageCircle size={16} />
              <span>Confirm on WhatsApp (+91 99948 37459)</span>
            </a>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/account/orders" className="anvi-checkout-success-btn" style={{ flex: 1, textAlign: 'center' }}>
                View in My Orders
              </Link>
              <Link href="/shop" className="anvi-checkout-success-btn anvi-checkout-success-btn--secondary" style={{ flex: 1, textAlign: 'center' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. EMPTY CART VIEW
  // =========================================================================
  if (items.length === 0) {
    return (
      <div className="anvi-checkout-page">
        <header className="anvi-checkout-header">
          <div className="anvi-checkout-header-inner">
            <Link href="/" className="anvi-checkout-logo-link" aria-label="ANVI Home">
              <img
                src="/images/brand/anvi_logo.png"
                alt="ANVI"
                className="anvi-checkout-logo-img"
              />
            </Link>
            <Link href="/cart" className="anvi-checkout-return-cart">
              Return to Bag
            </Link>
          </div>
        </header>

        <div style={{ maxWidth: 540, margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-maroon)' }}>
            Your bag is waiting.
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(47, 43, 43, 0.7)', margin: '1rem 0 2rem' }}>
            Please select an heirloom garment from our collections before proceeding to checkout.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.875rem 2rem',
                backgroundColor: 'var(--color-maroon)',
                color: '#FAF7F2',
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: 2,
              }}
            >
              Explore Collections
            </Link>
            <button
              type="button"
              onClick={handleAddSampleItem}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.875rem 1.5rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(91, 23, 39, 0.3)',
                color: 'var(--color-maroon)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: 2,
                cursor: 'pointer',
              }}
            >
              + Add Demo Saree
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. MAIN CHECKOUT VIEW
  // =========================================================================
  return (
    <div className="anvi-checkout-page">
      {/* Top Header */}
      <header className="anvi-checkout-header">
        <div className="anvi-checkout-header-inner">
          <Link href="/" className="anvi-checkout-logo-link" aria-label="ANVI Home">
            <img
              src="/images/brand/anvi_logo.png"
              alt="ANVI"
              className="anvi-checkout-logo-img"
            />
          </Link>

          <div className="anvi-checkout-trust-badge">
            <Lock size={14} className="anvi-checkout-trust-badge-icon" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>

          <Link href="/cart" className="anvi-checkout-return-cart">
            <ArrowLeft size={13} style={{ display: 'inline', marginRight: 4 }} />
            Return to Bag
          </Link>
        </div>
      </header>

      {/* Mobile Collapsible Order Summary Bar */}
      <button
        type="button"
        className="anvi-checkout-mobile-summary-toggle"
        onClick={() => setIsMobileSummaryOpen((prev) => !prev)}
        aria-expanded={isMobileSummaryOpen}
      >
        <span className="anvi-checkout-mobile-summary-left">
          <span>{isMobileSummaryOpen ? 'Hide' : 'Show'} order summary</span>
          {isMobileSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
        <span className="anvi-checkout-mobile-summary-total">
          {formatPrice(total)}
        </span>
      </button>

      {/* Mobile Drawer Content */}
      <div
        className={`anvi-checkout-mobile-summary-drawer ${
          isMobileSummaryOpen ? 'anvi-checkout-mobile-summary-drawer--open' : ''
        }`}
      >
        <div className="anvi-checkout-items-list">
          {items.map((item) => (
            <div key={item.id} className="anvi-checkout-item">
              <div className="anvi-checkout-item-thumb-wrap">
                <img
                  src={item.image || '/images/products/saree_ajrakh_1.jpg'}
                  alt={item.name}
                  className="anvi-checkout-item-thumb"
                />
                <span className="anvi-checkout-item-qty-badge">
                  {item.quantity}
                </span>
              </div>
              <div className="anvi-checkout-item-info">
                <span className="anvi-checkout-item-name">{item.name}</span>
                {item.size && (
                  <span className="anvi-checkout-item-variant">
                    Size: {item.size}
                  </span>
                )}
              </div>
              <span className="anvi-checkout-item-price">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {renderPromoSection()}

        <div className="anvi-checkout-totals">
          <div className="anvi-checkout-total-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {appliedCoupon && discountAmount > 0 && (
            <div className="anvi-checkout-total-row" style={{ color: '#15803d' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tag size={13} /> Coupon ({appliedCoupon.code})
              </span>
              <span>- {formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="anvi-checkout-total-row">
            <span>Shipping</span>
            <span className={shippingFee === 0 ? 'anvi-checkout-total-row--highlight' : ''}>
              {shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}
            </span>
          </div>
          <div className="anvi-checkout-total-row">
            <span>Boutique Gift Packaging</span>
            <span className="anvi-checkout-total-row--highlight">Included</span>
          </div>
          <div className="anvi-checkout-total-row anvi-checkout-total-row--final">
            <span className="anvi-checkout-final-label">Total</span>
            <span className="anvi-checkout-final-amount">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Sticky Summary Right */}
      <div className="anvi-checkout-container">
        {/* Left Column: Form Steps */}
        <form className="anvi-checkout-main" onSubmit={handlePlaceOrder}>
          {/* Payment Failure Recovery Banner */}
          {(paymentFailed || submitError) && (
            <div className="anvi-checkout-failure-banner" role="alert">
              <div>
                <strong>{submitError ? 'Order could not be placed.' : 'Payment was not completed.'}</strong>
                <div>{submitError ?? 'Your bag and checkout details remain securely preserved.'}</div>
              </div>
              <button
                type="button"
                className="anvi-checkout-failure-retry-btn"
                onClick={() => {
                  setPaymentFailed(false);
                  setSubmitError(null);
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Guest nudge: signed-in patrons get server-validated coupons, live order tracking */}
          {!user && (
            <div style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', background: 'rgba(212, 178, 124, 0.09)', border: '1px solid rgba(212, 178, 124, 0.35)', borderRadius: '4px', fontSize: '0.8125rem', color: 'rgba(47, 43, 43, 0.8)' }}>
              <Link href={`/login?next=${encodeURIComponent('/checkout')}`} style={{ color: 'var(--color-maroon)', fontWeight: 700 }}>
                Sign in
              </Link>{' '}
              for server-verified vouchers, live order tracking in My Orders, and faster checkout. You may also continue as a guest.
            </div>
          )}

          {/* SECTION 1: Contact Information */}
          <section className="anvi-checkout-section" aria-labelledby="contact-heading">
            <div className="anvi-checkout-section-header">
              <h2 id="contact-heading" className="anvi-checkout-section-title">
                <span className="anvi-checkout-section-num">1</span>
                <span>Contact Information</span>
              </h2>
              <span className="anvi-checkout-section-subtitle">
                For order confirmation and dispatch notices
              </span>
            </div>

            <div className="anvi-checkout-form-grid">
              <div className="anvi-form-group anvi-form-group--full">
                <label htmlFor="contact" className="anvi-form-label">
                  Email Address or Mobile Number *
                </label>
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  required
                  placeholder="e.g. ananya@example.com or +91 98765 43210"
                  className="anvi-form-input"
                  value={formData.contact}
                  onChange={handleInputChange}
                />
              </div>

              <div className="anvi-form-group--full">
                <label className="anvi-form-checkbox-label">
                  <input
                    name="whatsappUpdates"
                    type="checkbox"
                    checked={formData.whatsappUpdates}
                    onChange={handleInputChange}
                    className="anvi-form-checkbox"
                  />
                  <span>
                    Receive dispatch notifications and tracking updates via WhatsApp
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* SECTION 2: Shipping Address */}
          <section className="anvi-checkout-section" aria-labelledby="shipping-heading">
            <div className="anvi-checkout-section-header">
              <h2 id="shipping-heading" className="anvi-checkout-section-title">
                <span className="anvi-checkout-section-num">2</span>
                <span>Shipping Address</span>
              </h2>
              <span className="anvi-checkout-section-subtitle">
                Delivered across all states in India
              </span>
            </div>

            <div className="anvi-checkout-form-grid">
              <div className="anvi-form-group">
                <label htmlFor="firstName" className="anvi-form-label">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="e.g. Ananya"
                  className="anvi-form-input"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="anvi-form-group">
                <label htmlFor="lastName" className="anvi-form-label">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="e.g. Sundaram"
                  className="anvi-form-input"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="anvi-form-group anvi-form-group--full">
                <label htmlFor="address" className="anvi-form-label">
                  Street Address &amp; House / Flat No. *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  placeholder="e.g. 146, Raju Naidu St, Sivananda Colony, Tatabad"
                  className="anvi-form-input"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="anvi-form-group anvi-form-group--full">
                <label htmlFor="apartment" className="anvi-form-label">
                  Apartment, Suite, Landmark (Optional)
                </label>
                <input
                  id="apartment"
                  name="apartment"
                  type="text"
                  placeholder="e.g. Near Coimbatore Club"
                  className="anvi-form-input"
                  value={formData.apartment}
                  onChange={handleInputChange}
                />
              </div>

              <div className="anvi-form-group">
                <label htmlFor="city" className="anvi-form-label">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  placeholder="e.g. Coimbatore"
                  className="anvi-form-input"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>

              <div className="anvi-form-group">
                <label htmlFor="state" className="anvi-form-label">
                  State *
                </label>
                <select
                  id="state"
                  name="state"
                  className="anvi-form-input"
                  value={formData.state}
                  onChange={handleInputChange}
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Other">Other State / UT</option>
                </select>
              </div>

              <div className="anvi-form-group">
                <label htmlFor="pincode" className="anvi-form-label">
                  PIN Code *
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 641018"
                  className="anvi-form-input"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>

              <div className="anvi-form-group">
                <label htmlFor="phone" className="anvi-form-label">
                  Phone Number for Courier *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  className="anvi-form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          {/* SECTION 3: Delivery Method */}
          <section className="anvi-checkout-section" aria-labelledby="delivery-heading">
            <div className="anvi-checkout-section-header">
              <h2 id="delivery-heading" className="anvi-checkout-section-title">
                <span className="anvi-checkout-section-num">3</span>
                <span>Delivery Method</span>
              </h2>
            </div>

            <div className="anvi-delivery-options" role="radiogroup" aria-label="Delivery options">
              {/* Option 1: Standard */}
              <label
                className={`anvi-delivery-option ${
                  deliveryMethod === 'standard' ? 'anvi-delivery-option--active' : ''
                }`}
              >
                <div className="anvi-delivery-option-left">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="standard"
                    checked={deliveryMethod === 'standard'}
                    onChange={() => setDeliveryMethod('standard')}
                    className="anvi-delivery-option-radio"
                  />
                  <div>
                    <h3 className="anvi-delivery-option-title">
                      Standard Insured Courier (3–5 Business Days)
                    </h3>
                    <p className="anvi-delivery-option-desc">
                      Dispatches within 24–48 hours from Coimbatore studio.
                    </p>
                  </div>
                </div>
                <span className="anvi-delivery-option-price">
                  {standardShippingCost === 0 ? 'FREE' : formatPrice(standardShippingCost)}
                </span>
              </label>

              {/* Option 2: Express Studio Priority */}
              <label
                className={`anvi-delivery-option ${
                  deliveryMethod === 'express' ? 'anvi-delivery-option--active' : ''
                }`}
              >
                <div className="anvi-delivery-option-left">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="express"
                    checked={deliveryMethod === 'express'}
                    onChange={() => setDeliveryMethod('express')}
                    className="anvi-delivery-option-radio"
                  />
                  <div>
                    <h3 className="anvi-delivery-option-title">
                      Studio Priority Express (1–2 Business Days)
                    </h3>
                    <p className="anvi-delivery-option-desc">
                      Same-day inspection and priority air courier handling.
                    </p>
                  </div>
                </div>
                <span className="anvi-delivery-option-price">
                  {expressShippingCost === 0 ? 'FREE' : formatPrice(expressShippingCost)}
                </span>
              </label>
            </div>
          </section>

          {/* SECTION 4: Payment Method */}
          <section className="anvi-checkout-section" aria-labelledby="payment-heading">
            <div className="anvi-checkout-section-header">
              <h2 id="payment-heading" className="anvi-checkout-section-title">
                <span className="anvi-checkout-section-num">4</span>
                <span>Payment Method</span>
              </h2>
              <span className="anvi-checkout-section-subtitle">
                All transactions are encrypted and secure
              </span>
            </div>

            <div className="anvi-payment-options" role="radiogroup" aria-label="Payment options">
              {/* UPI */}
              <label
                className={`anvi-payment-option ${
                  paymentMethod === 'upi' ? 'anvi-payment-option--active' : ''
                }`}
              >
                <div className="anvi-payment-option-header">
                  <div className="anvi-payment-option-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                    />
                    <span className="anvi-payment-option-title">
                      UPI (Google Pay, PhonePe, Paytm, QR)
                    </span>
                  </div>
                  <div className="anvi-payment-badges">
                    <span className="anvi-payment-badge">Instant</span>
                  </div>
                </div>
                {paymentMethod === 'upi' && (
                  <div className="anvi-payment-option-content">
                    After clicking &ldquo;Pay Securely&rdquo;, a Razorpay window opens —
                    scan the UPI QR or approve the collect request in Google Pay,
                    PhonePe or Paytm. Zero extra fees. Instant guest checkout — no account required.
                  </div>
                )}
              </label>

              {/* Cards */}
              <label
                className={`anvi-payment-option ${
                  paymentMethod === 'card' ? 'anvi-payment-option--active' : ''
                }`}
              >
                <div className="anvi-payment-option-header">
                  <div className="anvi-payment-option-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <span className="anvi-payment-option-title">
                      Credit / Debit Card
                    </span>
                  </div>
                  <div className="anvi-payment-badges">
                    <span className="anvi-payment-badge">Visa</span>
                    <span className="anvi-payment-badge">Mastercard</span>
                    <span className="anvi-payment-badge">RuPay</span>
                  </div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="anvi-payment-option-content">
                    After clicking &ldquo;Pay Securely&rdquo;, a Razorpay window opens —
                    pay with Visa, Mastercard, RuPay or American Express with
                    3D Secure OTP verification.
                  </div>
                )}
              </label>

              {/* Net Banking */}
              <label
                className={`anvi-payment-option ${
                  paymentMethod === 'netbanking' ? 'anvi-payment-option--active' : ''
                }`}
              >
                <div className="anvi-payment-option-header">
                  <div className="anvi-payment-option-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                    />
                    <span className="anvi-payment-option-title">Net Banking</span>
                  </div>
                  <div className="anvi-payment-badges">
                    <span className="anvi-payment-badge">All Banks</span>
                  </div>
                </div>
                {paymentMethod === 'netbanking' && (
                  <div className="anvi-payment-option-content">
                    After clicking &ldquo;Pay Securely&rdquo;, a Razorpay window opens —
                    select your bank (HDFC, ICICI, SBI, Axis, Kotak, etc.) on the
                    secure gateway.
                  </div>
                )}
              </label>

              {/* Cash on Delivery */}
              <label
                className={`anvi-payment-option ${
                  paymentMethod === 'cod' ? 'anvi-payment-option--active' : ''
                }`}
              >
                <div className="anvi-payment-option-header">
                  <div className="anvi-payment-option-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <span className="anvi-payment-option-title">
                      Cash / Pay on Delivery
                    </span>
                  </div>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="anvi-payment-option-content">
                    Pay via cash or UPI to the courier agent upon doorstep delivery.
                    Please have exact change ready.
                  </div>
                )}
              </label>
            </div>
          </section>

          {/* Primary CTA: PLACE ORDER */}
          <div className="anvi-checkout-cta-wrap">
            <button
              type="submit"
              disabled={isSubmitting}
              className="anvi-checkout-place-btn"
            >
              <Lock size={16} strokeWidth={2} />
              <span>
                {isSubmitting
                  ? 'Securing Order...'
                  : paymentMethod === 'cod'
                    ? `Place Order · ${formatPrice(total)}`
                    : `Pay Securely · ${formatPrice(total)}`}
              </span>
            </button>

            {/* Concise Reassurance Strip */}
            <div className="anvi-checkout-reassurance">
              <div className="anvi-checkout-reassurance-item">
                <ShieldCheck size={16} className="anvi-checkout-reassurance-icon" />
                <span>256-Bit SSL Secured</span>
              </div>
              <div className="anvi-checkout-reassurance-item">
                <Truck size={16} className="anvi-checkout-reassurance-icon" />
                <span>Insured Doorstep Courier</span>
              </div>
              <div className="anvi-checkout-reassurance-item">
                <RefreshCw size={16} className="anvi-checkout-reassurance-icon" />
                <span>7-Day Boutique Exchanges</span>
              </div>
            </div>
          </div>
        </form>

        {/* Right Column: Sticky Order Summary (Desktop) */}
        <aside className="anvi-checkout-sidebar" aria-label="Order Summary">
          <h2 className="anvi-checkout-sidebar-title">
            Order Summary ({items.length})
          </h2>

          <div className="anvi-checkout-items-list" role="list">
            {items.map((item) => (
              <div key={item.id} role="listitem" className="anvi-checkout-item">
                <div className="anvi-checkout-item-thumb-wrap">
                  <img
                    src={item.image || '/images/products/saree_ajrakh_1.jpg'}
                    alt={item.name}
                    className="anvi-checkout-item-thumb"
                  />
                  <span className="anvi-checkout-item-qty-badge">
                    {item.quantity}
                  </span>
                </div>
                <div className="anvi-checkout-item-info">
                  <span className="anvi-checkout-item-name">{item.name}</span>
                  {item.size && (
                    <span className="anvi-checkout-item-variant">
                      Size: {item.size}
                    </span>
                  )}
                </div>
                <span className="anvi-checkout-item-price">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {renderPromoSection()}

          <div className="anvi-checkout-totals">
            <div className="anvi-checkout-total-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div className="anvi-checkout-total-row" style={{ color: '#15803d' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Tag size={13} /> Coupon ({appliedCoupon.code})
                </span>
                <span>- {formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="anvi-checkout-total-row">
              <span>Delivery</span>
              <span className={shippingFee === 0 ? 'anvi-checkout-total-row--highlight' : ''}>
                {shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}
              </span>
            </div>

            <div className="anvi-checkout-total-row">
              <span>Boutique Keepsake Box</span>
              <span className="anvi-checkout-total-row--highlight">Included</span>
            </div>

            <div className="anvi-checkout-total-row anvi-checkout-total-row--final">
              <span className="anvi-checkout-final-label">Total</span>
              <span className="anvi-checkout-final-amount">
                {formatPrice(total)}
              </span>
            </div>
            <p className="anvi-checkout-tax-note">
              Inclusive of all taxes. No hidden charges.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
