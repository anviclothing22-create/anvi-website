import React from 'react';
import { SupportLayout } from './SupportLayout';
import { Lock, EyeOff, UserCheck, KeyRound, Building } from 'lucide-react';
import './SupportPages.css';

/**
 * ANVI Privacy Policy Page
 * Clear, transparent data practices, 256-bit encryption assurances,
 * compliance with Indian Information Technology Act and modern digital privacy standards.
 */
export const PrivacyPage: React.FC = () => {
  return (
    <SupportLayout
      activeTab="privacy"
      title="Privacy Policy"
      subtitle="Your privacy is sacred to our studio. We collect only what is essential to craft and deliver your garments."
      lastUpdated="September 2026"
    >
      <div className="anvi-policy-container">
        {/* Top Highlight Cards for Quick Scanning */}
        <div className="anvi-policy-highlights" aria-label="Key privacy principles">
          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <EyeOff size={18} />
            </div>
            <h3 className="anvi-highlight-title">Zero Data Selling</h3>
            <p className="anvi-highlight-desc">We never sell, rent, or trade your personal information with third-party advertisers.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <Lock size={18} />
            </div>
            <h3 className="anvi-highlight-title">256-Bit SSL Encryption</h3>
            <p className="anvi-highlight-desc">Bank-grade end-to-end cryptographic protection for all browsing and transactions.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <KeyRound size={18} />
            </div>
            <h3 className="anvi-highlight-title">No Card Storage</h3>
            <p className="anvi-highlight-desc">Payment credentials are processed by RBI-authorized gateways. We never store CVVs or card numbers.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <UserCheck size={18} />
            </div>
            <h3 className="anvi-highlight-title">Patron Rights</h3>
            <p className="anvi-highlight-desc">Request, review, or erase your customer profile and order data at any time.</p>
          </div>
        </div>

        {/* Section 1: Introduction */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">01</span>
            <h2 className="anvi-policy-h2">Our Studio Commitment to Privacy</h2>
          </div>
          <p className="anvi-policy-p">
            ANVI Clothing (“ANVI”, “we”, “our”, or “us”) is operated from our registered studio at Coimbatore, Tamil Nadu, India.
            This Privacy Policy sets out how we handle, store, and protect any information you entrust to us when you visit our online store, browse our collections, or make a purchase.
          </p>
          <p className="anvi-policy-p">
            We adhere strictly to the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and globally recognized data protection principles.
          </p>
        </section>

        {/* Section 2: Information We Collect */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">02</span>
            <h2 className="anvi-policy-h2">Information We Collect</h2>
          </div>
          <p className="anvi-policy-p">
            We collect only the information necessary to fulfill our artisanal and retail obligations to you:
          </p>
          <ul className="anvi-policy-list">
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Identity & Contact Details:</strong> Full name, billing and shipping address, email address, and mobile phone number for delivery coordination and dispatch alerts.
              </div>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Order & Fit Preferences:</strong> Purchased silhouettes, chosen sizes, saved wishlist pieces, and any bespoke fitting notes you share with our Coimbatore tailors.
              </div>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Technical & Device Data:</strong> IP address, device type, browser information, and session cookies used solely to keep your shopping bag intact while navigating our boutique.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 3: Payment Security & Gateways */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">03</span>
            <h2 className="anvi-policy-h2">Payment Security & Tokenization</h2>
          </div>
          <p className="anvi-policy-p">
            Online transactions on ANVI are conducted through PCI-DSS Level 1 certified payment processors (Razorpay / Cashfree / Stripe).
          </p>
          <div style={{ backgroundColor: '#faf6f0', padding: '16px 20px', borderRadius: 4, border: '1px solid #ede3d6', margin: '14px 0' }}>
            <p style={{ fontSize: '0.9rem', color: '#594f4a', lineHeight: 1.6, margin: 0 }}>
              <strong>Zero Card Data Retention:</strong> Neither ANVI nor its servers ever see, transmit, or store your 16-digit credit/debit card numbers, CVVs, or net banking passwords. All sensitive payment details are securely tokenized directly with your bank under Reserve Bank of India (RBI) directives.
            </p>
          </div>
        </section>

        {/* Section 4: Use of Information */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">04</span>
            <h2 className="anvi-policy-h2">How We Use Your Information</h2>
          </div>
          <p className="anvi-policy-p">
            Information collected is applied exclusively for legitimate boutique operations:
          </p>
          <ul className="anvi-policy-list">
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <span>Processing, packaging, and dispatching your garment orders.</span>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <span>Sending real-time Air Waybill (AWB) tracking updates via SMS, WhatsApp, and email.</span>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <span>Facilitating 7-day complimentary doorstep reverse pickups and exchanges.</span>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <span>Optional studio dispatches (new edition launches, seasonal festive previews) only when you explicitly opt in. You can unsubscribe at any instant with a single click.</span>
            </li>
          </ul>
        </section>

        {/* Section 5: Essential Service Disclosures */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">05</span>
            <h2 className="anvi-policy-h2">Third-Party Service Providers</h2>
          </div>
          <p className="anvi-policy-p">
            We share relevant customer data solely with vetted operational partners strictly required to deliver your order:
          </p>
          <ul className="anvi-policy-list">
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Express Logistics Partners:</strong> BlueDart Express, Delhivery, Speed Post, DHL Express (for international parcels). Only your recipient name, delivery address, and contact number are transmitted to complete delivery.
              </div>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>SMS & Dispatch Infrastructure:</strong> Secure communication partners facilitating OTP verification and tracking notices.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 6: Cookies & Session Storage */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">06</span>
            <h2 className="anvi-policy-h2">Cookies & Local Storage</h2>
          </div>
          <p className="anvi-policy-p">
            We use functional first-party cookies and modern local storage mechanisms to provide a seamless browsing experience: remembering items in your cart, retaining your saved wishlist across visits, and analyzing aggregated, anonymous page loading performance. We do not engage in cross-site tracking or selling cookie profiles to data brokers.
          </p>
        </section>

        {/* Section 7: Grievance Officer */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">07</span>
            <h2 className="anvi-policy-h2">Grievance Officer & Data Redressal</h2>
          </div>
          <p className="anvi-policy-p">
            In accordance with the Information Technology Act, 2000 and rules made thereunder, the name and contact details of our Grievance Officer are published below:
          </p>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border-subtle)', borderRadius: 4, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <Building size={24} color="var(--color-deep-maroon)" style={{ flexShrink: 0, marginTop: 4 }} />
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--color-deep-maroon)', marginBottom: 4 }}>Grievance Officer — ANVI Clothing</h4>
              <p style={{ fontSize: '0.88rem', color: '#594f4a', lineHeight: 1.6, margin: 0 }}>
                ANVI Studio, 146, Raju Naidu St, Sivananda Colony, Tatabad, Coimbatore, Tamil Nadu 641012, India<br />
                <strong>Email:</strong> <a href="mailto:anviclothing22@gmail.com" style={{ color: 'var(--color-deep-maroon)', textDecoration: 'underline' }}>anviclothing22@gmail.com</a><br />
                <strong>Response Window:</strong> Within 48 business hours as per statutory timelines.
              </p>
            </div>
          </div>
        </section>
      </div>
    </SupportLayout>
  );
};
