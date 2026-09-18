import React from 'react';
import { SupportLayout } from './SupportLayout';
import { Sparkles, Scale, IndianRupee, ShieldCheck } from 'lucide-react';
import './SupportPages.css';

/**
 * ANVI Terms & Conditions Page
 * Transparent terms of service for patrons. Highlights artisanal handloom characteristics,
 * fair commercial practices, pricing, intellectual property, and Coimbatore jurisdiction.
 */
export const TermsPage: React.FC = () => {
  return (
    <SupportLayout
      activeTab="terms"
      title="Terms & Conditions"
      subtitle="The principles that govern our relationship with every patron."
      lastUpdated="September 2026"
    >
      <div className="anvi-policy-container">
        {/* Top Highlight Cards for Instant Scanning */}
        <div className="anvi-policy-highlights" aria-label="Key terms summary">
          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <Sparkles size={18} />
            </div>
            <h3 className="anvi-highlight-title">Authentic Handcraft</h3>
            <p className="anvi-highlight-desc">Natural dye tones and weave slubs are celebrated marks of artisan origin, not flaws.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <IndianRupee size={18} />
            </div>
            <h3 className="anvi-highlight-title">Inclusive Pricing</h3>
            <p className="anvi-highlight-desc">All catalog prices are in INR and fully inclusive of statutory Goods & Services Tax (GST).</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <ShieldCheck size={18} />
            </div>
            <h3 className="anvi-highlight-title">7-Day Exchange</h3>
            <p className="anvi-highlight-desc">Complimentary size and style exchanges for unworn prêt garments within 7 days.</p>
          </div>

          <div className="anvi-highlight-card">
            <div className="anvi-highlight-card-icon">
              <Scale size={18} />
            </div>
            <h3 className="anvi-highlight-title">Jurisdiction</h3>
            <p className="anvi-highlight-desc">All transactions are governed under the exclusive jurisdiction of courts in Coimbatore, Tamil Nadu.</p>
          </div>
        </div>

        {/* Section 1: Overview */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">01</span>
            <h2 className="anvi-policy-h2">Terms Overview & Scope</h2>
          </div>
          <p className="anvi-policy-p">
            Welcome to ANVI Clothing. By browsing, creating an account, or purchasing any garments through our website or Coimbatore boutique, you agree to be bound by the terms, conditions, and notices contained herein. Please review them with care.
          </p>
          <p className="anvi-policy-p">
            We reserve the right to refine or update these terms periodically to reflect updates in consumer regulations or store capabilities. The date of the most recent revision will always be displayed at the top of this document.
          </p>
        </section>

        {/* Section 2: Artisanal Nuances & Handloom Character */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">02</span>
            <h2 className="anvi-policy-h2">Artisanal Handcraft & Natural Dye Characteristics</h2>
          </div>
          <p className="anvi-policy-p">
            At ANVI, our garments are crafted by traditional weavers and craft communities across Tamil Nadu, Madhya Pradesh, Gujarat, and Rajasthan. Unlike high-volume synthetic industrial textiles, genuine handlooms and botanical prints possess organic nuance:
          </p>
          <ul className="anvi-policy-list">
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Weave Slubs & Yarn Variations:</strong> Subtle variations in weave density, thread thickness, and selvedge texture are natural consequences of the hand-spinning and shuttle-loom process. These are hallmarks of authenticity.
              </div>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Natural Botanical Dyes:</strong> Hand-block prints (Bagru, Ajrakh, Kalamkari) utilize organic vegetable dyestuffs (madder root, indigo, harda). Minor shade differences between dye lots or slight bleeding during initial washes are standard characteristics of authentic plant dyes.
              </div>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <div>
                <strong>Color Calibration:</strong> While our photography is meticulously color-graded in daylight conditions, slight perceptual variations may occur depending on individual mobile or desktop display color profiles.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 3: Pricing, Taxes & Billing */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">03</span>
            <h2 className="anvi-policy-h2">Pricing, Invoicing & GST Compliance</h2>
          </div>
          <p className="anvi-policy-p">
            All prices listed on our digital catalog are quoted in Indian Rupees (INR) and are inclusive of the applicable Goods and Services Tax (GST) as mandated by Indian statutory tax laws.
          </p>
          <ul className="anvi-policy-list">
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <span>A valid GST tax invoice is generated with each order and enclosed physically in the shipping carton as well as emailed digitally upon dispatch.</span>
            </li>
            <li className="anvi-policy-list-item">
              <span className="anvi-policy-list-bullet">✦</span>
              <span>We endeavor to ensure all catalog pricing is accurate; however, in the rare event of a typographical pricing error, we reserve the right to contact you prior to dispatch to rectify or cancel the order with an immediate full refund.</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Order Acceptance & Cancellation */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">04</span>
            <h2 className="anvi-policy-h2">Order Acceptance & Hand-Inspection</h2>
          </div>
          <p className="anvi-policy-p">
            Receipt of an electronic order confirmation does not constitute our final acceptance of an order. Every item is hand-inspected by our Coimbatore quality team. We reserve the right to limit quantities or decline an order in situations where a fabric lot fails quality inspection or where address information cannot be verified.
          </p>
          <div style={{ backgroundColor: '#faf5ee', padding: '14px 18px', borderRadius: 4, marginTop: 12 }}>
            <p style={{ fontSize: '0.88rem', color: '#594f4a', lineHeight: 1.6, margin: 0 }}>
              <strong>Cancellation by Patron:</strong> You may cancel any order within 12 hours of placement or prior to dispatch by messaging our concierge. 100% of your payment is refunded immediately without deduction.
            </p>
          </div>
        </section>

        {/* Section 5: Intellectual Property */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">05</span>
            <h2 className="anvi-policy-h2">Intellectual Property Rights</h2>
          </div>
          <p className="anvi-policy-p">
            All visual content, garment silhouettes, proprietary print layouts, editorial photography, branding assets, copy, and logo designs on this website are the intellectual property of ANVI Clothing. Any reproduction, distribution, or unauthorized commercial exploitation without our written consent is strictly prohibited.
          </p>
        </section>

        {/* Section 6: Governing Law */}
        <section className="anvi-policy-section">
          <div className="anvi-policy-section-header">
            <span className="anvi-policy-num">06</span>
            <h2 className="anvi-policy-h2">Governing Law & Legal Jurisdiction</h2>
          </div>
          <p className="anvi-policy-p">
            These terms and all contracts entered into with ANVI Clothing shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, proceeding, or claim arising out of or relating to your interaction with ANVI shall be subject to the exclusive jurisdiction of the competent courts in <strong>Coimbatore, Tamil Nadu, India</strong>.
          </p>
        </section>
      </div>
    </SupportLayout>
  );
};
