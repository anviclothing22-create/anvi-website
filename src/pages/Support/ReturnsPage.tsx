import React from 'react';
import { SupportLayout } from './SupportLayout';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Shield, Clock } from 'lucide-react';
import './SupportPages.css';

/**
 * ANVI Exchanges & Returns Policy Page
 * Clear 7-day doorstep exchange guarantee, step-by-step reverse logistics,
 * eligibility criteria, and transparent store credit rules.
 */
export const ReturnsPage: React.FC = () => {
  return (
    <SupportLayout
      activeTab="returns"
      title="Exchanges & Returns"
      subtitle="We want every ANVI garment to fit your silhouette with natural grace and effortless confidence."
      lastUpdated="September 2026"
    >
      <div className="anvi-policy-container">
        {/* Top Highlight Cards for Quick Scanning */}
        <div className="anvi-policy-highlights" aria-label="Key exchange policy highlights">
          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <Clock size={18} />
            </div>
            <h3 className="anvi-highlight-title">7-Day Window</h3>
            <p className="anvi-highlight-desc">Request an exchange within 7 days of delivery with zero friction.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <RefreshCw size={18} />
            </div>
            <h3 className="anvi-highlight-title">Free Reverse Pickup</h3>
            <p className="anvi-highlight-desc">Complimentary doorstep courier pickup across 18,000+ Indian pincodes.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <Shield size={18} />
            </div>
            <h3 className="anvi-highlight-title">Size or Style Exchange</h3>
            <p className="anvi-highlight-desc">Swap sizes or receive 100% store credit valid for 12 months with zero fees.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="anvi-highlight-title">48h Quality Inspection</h3>
            <p className="anvi-highlight-desc">Replacement or store credit issued within 48h of studio receipt.</p>
          </div>
        </div>

        {/* 7-Day Assurance Banner */}
        <div className="anvi-policy-banner">
          <RefreshCw size={26} className="anvi-policy-banner-icon" />
          <div className="anvi-policy-banner-content">
            <h3>Our 7-Day Complimentary Doorstep Exchange Guarantee</h3>
            <p>
              Each ANVI silhouette is cut and hand-tailored with exacting care. If the fit, drape, or feel isn’t completely perfect,
              we arrange a prompt doorstep courier pickup and replacement size at no additional shipping charge to you.
            </p>
          </div>
        </div>

        {/* Section 1: The 4-Step Exchange Workflow */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">01</span>
            <h2 className="anvi-policy-h2">How to Initiate an Exchange in 4 Simple Steps</h2>
          </div>
          <p className="anvi-policy-p">
            We don’t believe in complicated automated phone menus or confusing paperwork. The entire exchange is handled through personal, direct concierge care:
          </p>

          <div className="anvi-steps-grid">
            <div className="anvi-step-card">
              <span className="anvi-step-num-badge">01</span>
              <h3 className="anvi-step-title">Reach Out to Us</h3>
              <p className="anvi-step-desc">
                WhatsApp our concierge at <a href="https://wa.me/919994837459" style={{ color: 'var(--color-deep-maroon)', textDecoration: 'underline' }}>+91 99948 37459</a> or email <a href="mailto:anviclothing22@gmail.com" style={{ color: 'var(--color-deep-maroon)', textDecoration: 'underline' }}>anviclothing22@gmail.com</a> within 7 days with your order ID.
              </p>
            </div>

            <div className="anvi-step-card">
              <span className="anvi-step-num-badge">02</span>
              <h3 className="anvi-step-title">Doorstep Reverse Pickup</h3>
              <p className="anvi-step-desc">
                Our logistics partner will arrive at your address within 24 to 48 hours to collect the packaged garment.
              </p>
            </div>

            <div className="anvi-step-card">
              <span className="anvi-step-num-badge">03</span>
              <h3 className="anvi-step-title">Studio Quality Check</h3>
              <p className="anvi-step-desc">
                Once received at our Coimbatore workshop, our master tailors inspect the garment (unworn, tags intact, unwashed).
              </p>
            </div>

            <div className="anvi-step-card">
              <span className="anvi-step-num-badge">04</span>
              <h3 className="anvi-step-title">Replacement or Credit</h3>
              <p className="anvi-step-desc">
                Your replacement size is air-dispatched, or an instant store credit coupon is emailed with 12 months validity.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Side-by-Side Eligibility Checklist */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">02</span>
            <h2 className="anvi-policy-h2">Exchange Eligibility Criteria</h2>
          </div>
          <p className="anvi-policy-p">
            To ensure the hygiene and artisanal integrity of every garment for our patron community, items must fulfill the following:
          </p>

          <div className="anvi-comparison-grid">
            <div className="anvi-eligibility-card anvi-eligibility-card--yes">
              <div className="anvi-eligibility-header">
                <span className="anvi-eligibility-badge anvi-eligibility-badge--yes">Eligible for Exchange</span>
              </div>
              <ul className="anvi-policy-list">
                <li className="anvi-policy-list-item">
                  <CheckCircle2 size={18} color="#1e6d42" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Garments in unworn, unwashed, and undamaged original state.</span>
                </li>
                <li className="anvi-policy-list-item">
                  <CheckCircle2 size={18} color="#1e6d42" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>All original brand tags, security loops, and fabric care tags attached.</span>
                </li>
                <li className="anvi-policy-list-item">
                  <CheckCircle2 size={18} color="#1e6d42" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Standard prêt/ready-to-wear sizes (XS, S, M, L, XL, XXL).</span>
                </li>
                <li className="anvi-policy-list-item">
                  <CheckCircle2 size={18} color="#1e6d42" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Handloom Sarees with unstitched blouse pieces intact and uncut.</span>
                </li>
              </ul>
            </div>

            <div className="anvi-eligibility-card anvi-eligibility-card--no">
              <div className="anvi-eligibility-header">
                <span className="anvi-eligibility-badge anvi-eligibility-badge--no">Ineligible for Return/Exchange</span>
              </div>
              <ul className="anvi-policy-list">
                <li className="anvi-policy-list-item">
                  <XCircle size={18} color="#c62828" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Garments altered, hemmed, or customized to custom body measurements.</span>
                </li>
                <li className="anvi-policy-list-item">
                  <XCircle size={18} color="#c62828" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Sarees with blouse pieces already cut, stitched, or fall/pico applied.</span>
                </li>
                <li className="anvi-policy-list-item">
                  <XCircle size={18} color="#c62828" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Garments exhibiting perfume scents, deodorant marks, or makeup stains.</span>
                </li>
                <li className="anvi-policy-list-item">
                  <XCircle size={18} color="#c62828" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Final clearance archive sale pieces marked "Non-Returnable".</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Reverse Pickup Coverage & Self-Ship */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">03</span>
            <h2 className="anvi-policy-h2">Reverse Pickup Coverage & Remote Pincodes</h2>
          </div>
          <p className="anvi-policy-p">
            Complimentary reverse pickup is available in over 18,000 pincodes across India. In the rare event that your pincode is outside our courier partner's reverse-pickup zone, we will kindly request you to send the parcel back via Speed Post or any reputed courier.
          </p>
          <div style={{ backgroundColor: '#faf6f0', padding: '16px 20px', borderRadius: 4, border: '1px solid #ede3d6', marginTop: 12 }}>
            <p style={{ fontSize: '0.88rem', color: '#594f4a', lineHeight: 1.6, margin: 0 }}>
              <strong>Self-Ship Reimbursement:</strong> If self-shipment is required, please email us the courier receipt with tracking details. We will credit a flat <strong>₹200 courier allowance</strong> into your account or refund it directly to your original payment method.
            </p>
          </div>
        </section>

        {/* Section 4: Damaged in Transit Guarantee */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">04</span>
            <h2 className="anvi-policy-h2">Transit Discrepancies & Craft Guarantee</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <AlertTriangle size={22} color="var(--color-primary-maroon)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="anvi-policy-p" style={{ marginBottom: 8 }}>
                Every parcel leaves our Coimbatore studio under strict double-checked tamper seals. In the improbable scenario that your package arrives visibly tampered, damaged, or with an incorrect garment:
              </p>
              <p className="anvi-policy-p" style={{ fontWeight: 500, color: 'var(--color-deep-maroon)' }}>
                Please share a photograph of the outer packaging and garment via WhatsApp (+91 99948 37459) within 48 hours of delivery. We will immediately dispatch a priority replacement or issue a 100% full refund to your bank/card without waiting for the return process.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Order Cancellations */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">05</span>
            <h2 className="anvi-policy-h2">Order Cancellation Before Dispatch</h2>
          </div>
          <p className="anvi-policy-p">
            You may cancel any unfulfilled order within 12 hours of placement or at any time before dispatch notification. Upon cancellation, 100% of your paid amount will be reversed to your original source (UPI / Card / NetBanking) within 3 to 5 business days. Once an order has been dispatched with our logistics carrier, it must follow our standard 7-day exchange procedure.
          </p>
        </section>
      </div>
    </SupportLayout>
  );
};
