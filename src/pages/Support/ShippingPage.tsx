import React from 'react';
import { SupportLayout } from './SupportLayout';
import { Truck, ShieldCheck, Clock, Globe, PackageCheck, AlertCircle } from 'lucide-react';
import './SupportPages.css';

/**
 * ANVI Shipping & Delivery Page
 * Clear, scannable delivery timelines, complimentary shipping thresholds,
 * courier partnerships, and textile safety handling.
 */
export const ShippingPage: React.FC = () => {
  return (
    <SupportLayout
      activeTab="shipping"
      title="Shipping & Delivery"
      subtitle="Carefully folded, insured, and delivered directly to your doorstep across India and worldwide."
      lastUpdated="September 2026"
    >
      <div className="anvi-policy-container">
        {/* Top Highlight Cards for Instant Scanning */}
        <div className="anvi-policy-highlights" aria-label="Key shipping highlights">
          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <Truck size={18} />
            </div>
            <h3 className="anvi-highlight-title">Free Domestic Shipping</h3>
            <p className="anvi-highlight-desc">Complimentary insured delivery on all orders across India.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <Clock size={18} />
            </div>
            <h3 className="anvi-highlight-title">24–48h Dispatch</h3>
            <p className="anvi-highlight-desc">Ready-to-wear pieces leave our Coimbatore studio within 1–2 business days.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <ShieldCheck size={18} />
            </div>
            <h3 className="anvi-highlight-title">Insured Transit</h3>
            <p className="anvi-highlight-desc">Dispatched via trusted tier-1 carriers (BlueDart, Delhivery, Speed Post).</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <Globe size={18} />
            </div>
            <h3 className="anvi-highlight-title">Global Delivery</h3>
            <p className="anvi-highlight-desc">Express delivery across US, UK, UAE, Singapore, Canada, and Australia.</p>
          </div>
        </div>

        {/* Reassurance Banner */}
        <div className="anvi-policy-banner">
          <PackageCheck size={26} className="anvi-policy-banner-icon" />
          <div className="anvi-policy-banner-content">
            <h3>Textile Safety & Packaging Guarantee</h3>
            <p>
              Every ANVI creation is steamed, inspected by our senior master tailors, and hand-wrapped in a breathable,
              reusable unbleached cotton dust bag before dispatch to protect natural fibers, zari, and delicate vegetable dyes.
            </p>
          </div>
        </div>

        {/* Section 1: Domestic Rates & Timelines */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">01</span>
            <h2 className="anvi-policy-h2">Domestic Shipping Rates & Delivery Estimates</h2>
          </div>
          <p className="anvi-policy-p">
            We partner with India’s leading air express logistics networks to ensure your garments reach you swiftly and safely.
            Shipping costs and transit windows are transparently outlined below:
          </p>

          <div className="anvi-table-wrap">
            <table className="anvi-policy-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Estimated Delivery</th>
                  <th>Order Value</th>
                  <th>Shipping Charge</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Metro Cities</strong> (Chennai, Bengaluru, Mumbai, Delhi NCR, Hyderabad, Kolkata)</td>
                  <td>2 to 4 business days</td>
                  <td>All Orders</td>
                  <td><strong style={{ color: '#1e6d42' }}>FREE</strong></td>
                </tr>
                <tr>
                  <td><strong>Rest of India</strong> (Tier 2 & Tier 3 cities, Towns)</td>
                  <td>4 to 6 business days</td>
                  <td>All Orders</td>
                  <td><strong style={{ color: '#1e6d42' }}>FREE</strong></td>
                </tr>
                <tr>
                  <td><strong>Special Regions</strong> (North-East, J&K, Andaman & Nicobar)</td>
                  <td>6 to 8 business days</td>
                  <td>All Orders</td>
                  <td><strong style={{ color: '#1e6d42' }}>FREE</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="anvi-policy-p" style={{ fontSize: '0.86rem', color: '#736b65' }}>
            *Note: Made-to-measure orders or customized blouse stitching typically require an additional 3 to 5 business days for studio hand-tailoring prior to dispatch.
          </p>
        </section>

        {/* Section 2: Real-time Order Tracking */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">02</span>
            <h2 className="anvi-policy-h2">Order Dispatch & Real-Time Tracking</h2>
          </div>
          <p className="anvi-policy-p">
            We believe in complete transparency at every step of your garment’s journey:
          </p>
          <ul className="anvi-policy-list">
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Instant SMS & WhatsApp Notification:</strong> As soon as your package is dispatched from our Coimbatore studio, you will receive an automated notification containing your unique Air Waybill (AWB) number and direct carrier tracking link.
              </div>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Live Account Portal:</strong> You can also track shipment status anytime under your <a href="/account" style={{ color: 'var(--color-deep-maroon)', textDecoration: 'underline' }}>ANVI Patron Account</a>.
              </div>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Delivery Verification:</strong> For high-value handloom ensembles, delivery will be confirmed via OTP sent to your registered phone number to prevent unauthorized handovers.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 3: International Shipping */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">03</span>
            <h2 className="anvi-policy-h2">Worldwide International Shipping</h2>
          </div>
          <p className="anvi-policy-p">
            ANVI proudly dresses patrons across the globe. International parcels are handled via premium international couriers (DHL Express and FedEx Priority).
          </p>
          <div className="anvi-table-wrap">
            <table className="anvi-policy-table">
              <thead>
                <tr>
                  <th>Country / Zone</th>
                  <th>Transit Window</th>
                  <th>Shipping Charges</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>United States & Canada</strong></td>
                  <td>6 to 9 business days</td>
                  <td>₹2,800 (~$34 USD) flat fee</td>
                </tr>
                <tr>
                  <td><strong>United Kingdom & Europe</strong></td>
                  <td>5 to 8 business days</td>
                  <td>₹2,500 (~£24 GBP) flat fee</td>
                </tr>
                <tr>
                  <td><strong>UAE & GCC Countries</strong></td>
                  <td>4 to 7 business days</td>
                  <td>₹2,200 (~98 AED) flat fee</td>
                </tr>
                <tr>
                  <td><strong>Singapore, Malaysia, Australia</strong></td>
                  <td>6 to 10 business days</td>
                  <td>₹2,600 flat fee</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, backgroundColor: '#faf5ee', padding: '14px 18px', borderRadius: 4, marginTop: 16 }}>
            <AlertCircle size={18} color="var(--color-primary-maroon)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.86rem', color: '#594f4a', lineHeight: 1.5 }}>
              <strong>Customs Duties & Import Taxes:</strong> Any customs duties or import taxes levied by the destination country are the responsibility of the recipient. These tariffs vary by nation and are collected directly by the local postal or customs authority upon arrival.
            </p>
          </div>
        </section>

        {/* Section 4: Address Changes & Failed Deliveries */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">04</span>
            <h2 className="anvi-policy-h2">Delivery Attempts & Address Amendments</h2>
          </div>
          <p className="anvi-policy-p">
            Our courier partners will make up to <strong>three delivery attempts</strong> before returning a shipment to our studio.
            If you need to change your delivery address or contact number, please notify us within 12 hours of placing your order by contacting our concierge at <a href="mailto:anviclothing22@gmail.com" style={{ color: 'var(--color-deep-maroon)', textDecoration: 'underline' }}>anviclothing22@gmail.com</a> or WhatsApp at <a href="https://wa.me/919994837459" style={{ color: 'var(--color-deep-maroon)', textDecoration: 'underline' }}>+91 99948 37459</a>.
          </p>
        </section>
      </div>
    </SupportLayout>
  );
};
