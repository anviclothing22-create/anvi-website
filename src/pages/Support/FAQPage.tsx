import React, { useState, useMemo } from 'react';
import { SupportLayout } from './SupportLayout';
import { ChevronDown, Search } from 'lucide-react';
import './SupportPages.css';

interface FAQItem {
  id: string;
  category: 'orders' | 'returns' | 'care' | 'payments';
  question: string;
  answer: React.ReactNode;
}

const FAQ_DATA: FAQItem[] = [
  // Category: Orders & Shipping
  {
    id: 'faq-ship-time',
    category: 'orders',
    question: 'How long does delivery take for domestic orders in India?',
    answer: (
      <>
        <p>
          Ready-to-wear pieces are typically dispatched from our Coimbatore studio within <strong>24 to 48 hours</strong> of order placement.
        </p>
        <p>
          Once dispatched, transit to metro cities (Chennai, Bengaluru, Mumbai, Delhi NCR, Hyderabad) takes <strong>2 to 4 business days</strong>. For tier-2 and tier-3 towns, delivery takes <strong>4 to 6 business days</strong>. For customized or stitched items, please allow an additional 3 to 5 tailoring days.
        </p>
      </>
    ),
  },
  {
    id: 'faq-ship-cost',
    category: 'orders',
    question: 'What are the shipping charges?',
    answer: (
      <p>
        We offer <strong>complimentary insured delivery</strong> on all orders across India with zero delivery charges at checkout.
      </p>
    ),
  },
  {
    id: 'faq-track-order',
    category: 'orders',
    question: 'How do I track my order status?',
    answer: (
      <p>
        The moment your package is dispatched, an automated notification containing your <strong>Air Waybill (AWB) tracking number</strong> is sent via SMS, WhatsApp, and email. You can also view live tracking updates anytime by visiting your <a href="/account" style={{ color: 'var(--color-deep-maroon)', textDecoration: 'underline' }}>ANVI Patron Account</a>.
      </p>
    ),
  },
  {
    id: 'faq-international',
    category: 'orders',
    question: 'Do you ship internationally outside India?',
    answer: (
      <p>
        Yes, ANVI delivers worldwide including the United States, United Kingdom, UAE, Singapore, Canada, and Australia via DHL Express and FedEx Priority. International transit typically takes 5 to 9 business days.
      </p>
    ),
  },

  // Category: Exchanges & Returns
  {
    id: 'faq-exchange-policy',
    category: 'returns',
    question: 'What is the ANVI exchange policy?',
    answer: (
      <p>
        We provide a <strong>7-day complimentary doorstep exchange guarantee</strong>. If your garment's size or drape doesn’t feel right, you can initiate an exchange within 7 days of delivery. Our courier team will arrange a reverse pickup from your doorstep at zero additional cost.
      </p>
    ),
  },
  {
    id: 'faq-how-exchange',
    category: 'returns',
    question: 'How do I initiate a size exchange?',
    answer: (
      <p>
        Simply send a WhatsApp message to our concierge at <a href="https://wa.me/919994837459" style={{ color: 'var(--color-deep-maroon)', textDecoration: 'underline' }}>+91 99948 37459</a> or email <a href="mailto:anviclothing22@gmail.com" style={{ color: 'var(--color-deep-maroon)', textDecoration: 'underline' }}>anviclothing22@gmail.com</a> with your order number and desired replacement size. We will book your reverse pickup and process your new size promptly.
      </p>
    ),
  },
  {
    id: 'faq-store-credit',
    category: 'returns',
    question: 'Can I exchange for a completely different silhouette or store credit?',
    answer: (
      <p>
        Yes. If the size you require is out of stock, or if you prefer a different design entirely, we issue <strong>100% store credit</strong> valid for 12 months with zero deductions or expiry pressure.
      </p>
    ),
  },
  {
    id: 'faq-custom-returns',
    category: 'returns',
    question: 'Are custom-tailored or altered garments eligible for exchange?',
    answer: (
      <p>
        Garments that have been tailored to bespoke body measurements, custom hemmed, or sarees where the blouse piece has already been detached and stitched are non-returnable. However, if any alteration issue arises, our Coimbatore studio will gladly adjust the fit for you.
      </p>
    ),
  },

  // Category: Fabrics, Sizing & Care
  {
    id: 'faq-size-guide',
    category: 'care',
    question: 'How do ANVI sizes fit? Should I size up or down?',
    answer: (
      <p>
        ANVI silhouettes are designed with an emphasis on relaxed contemporary elegance and ease of movement for Indian climates. If you fall between sizes, we recommend selecting your true bust measurement, as our cuts offer comfortable ease around the waist and hips. Detailed measurement guides are available on each product page.
      </p>
    ),
  },
  {
    id: 'faq-chanderi-care',
    category: 'care',
    question: 'How should I wash and care for handloom Chanderi and pure silks?',
    answer: (
      <p>
        We strongly advise <strong>professional dry cleaning</strong> for all pure Chanderi, raw silk, Tussar, and zari-embellished garments to preserve yarn luster and structure. Always store fine handlooms inside the unbleached cotton dust bag provided with your order, folded with tissue between zari folds.
      </p>
    ),
  },
  {
    id: 'faq-natural-dyes',
    category: 'care',
    question: 'Are botanical dyes (Bagru, Ajrakh, Indigo) colorfast?',
    answer: (
      <p>
        Authentic botanical vegetable dyes have a natural character. Hand-printed cottons should be hand-washed separately in cold water with mild liquid detergent during their initial washes. Do not soak, wring, or dry under harsh direct midday sunlight. Shade drying preserves dye vibrancy.
      </p>
    ),
  },
  {
    id: 'faq-custom-alter',
    category: 'care',
    question: 'Can I request custom sleeve length or kurta alterations?',
    answer: (
      <p>
        Yes. Before placing your order or immediately after checkout, message our concierge team on WhatsApp (+91 99948 37459) with your order ID and desired alteration specifications. Our in-house Coimbatore studio tailors will accommodate your request prior to dispatch.
      </p>
    ),
  },

  // Category: Payments & Security
  {
    id: 'faq-cod',
    category: 'payments',
    question: 'Do you offer Cash on Delivery (COD)?',
    answer: (
      <p>
        Yes, Cash on Delivery is supported for orders up to ₹10,000 across serviceable Indian pincodes. For orders above ₹10,000 or custom bespoke orders, we request secure prepaid digital payment (UPI, Credit/Debit Cards, or NetBanking).
      </p>
    ),
  },
  {
    id: 'faq-pay-methods',
    category: 'payments',
    question: 'Which payment methods are accepted?',
    answer: (
      <p>
        We accept all major payment modes: UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit/Debit cards (Visa, MasterCard, American Express, RuPay), NetBanking across 50+ banks, and Cash on Delivery. All transactions are protected by 256-bit SSL encryption.
      </p>
    ),
  },
  {
    id: 'faq-refund-time',
    category: 'payments',
    question: 'How quickly is a refund or store credit processed?',
    answer: (
      <p>
        For approved refunds, the reversal is initiated within <strong>24 to 48 hours</strong> of the garment passing quality inspection at our studio. The funds will reflect in your original bank/card account within 3 to 5 business days, depending on your bank's clearing cycle. Store credits are issued instantly via email.
      </p>
    ),
  },
];

type CategoryFilter = 'all' | 'orders' | 'returns' | 'care' | 'payments';

/**
 * ANVI FAQ Page with Accessible Interactive Accordions
 * Structured category filtering, search input, and expandable question sections.
 */
export const FAQPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItemIds, setOpenItemIds] = useState<Record<string, boolean>>({
    'faq-ship-time': true, // Keep first open by default
  });

  const toggleItem = (id: string) => {
    setOpenItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter questions based on category and search query
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Toggle expand all / collapse all
  const areAllExpanded = useMemo(() => {
    if (filteredFAQs.length === 0) return false;
    return filteredFAQs.every((item) => !!openItemIds[item.id]);
  }, [filteredFAQs, openItemIds]);

  const handleToggleAll = () => {
    if (areAllExpanded) {
      setOpenItemIds({});
    } else {
      const newOpenState: Record<string, boolean> = {};
      filteredFAQs.forEach((item) => {
        newOpenState[item.id] = true;
      });
      setOpenItemIds(newOpenState);
    }
  };

  return (
    <SupportLayout
      activeTab="faq"
      title="Frequently Asked Questions"
      subtitle="Answers to common inquiries regarding our handlooms, sizing, deliveries, and studio services."
    >
      <div className="anvi-policy-container">
        {/* Top Filter & Search Controls */}
        <div className="anvi-faq-top-bar">
          {/* Category Filter Pills */}
          <div className="anvi-faq-categories" role="tablist" aria-label="FAQ Categories">
            <button
              type="button"
              className={`anvi-faq-category-btn ${
                selectedCategory === 'all' ? 'anvi-faq-category-btn--active' : ''
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              All Questions
            </button>
            <button
              type="button"
              className={`anvi-faq-category-btn ${
                selectedCategory === 'orders' ? 'anvi-faq-category-btn--active' : ''
              }`}
              onClick={() => setSelectedCategory('orders')}
            >
              Orders & Shipping
            </button>
            <button
              type="button"
              className={`anvi-faq-category-btn ${
                selectedCategory === 'returns' ? 'anvi-faq-category-btn--active' : ''
              }`}
              onClick={() => setSelectedCategory('returns')}
            >
              Exchanges & Returns
            </button>
            <button
              type="button"
              className={`anvi-faq-category-btn ${
                selectedCategory === 'care' ? 'anvi-faq-category-btn--active' : ''
              }`}
              onClick={() => setSelectedCategory('care')}
            >
              Fabrics & Sizing
            </button>
            <button
              type="button"
              className={`anvi-faq-category-btn ${
                selectedCategory === 'payments' ? 'anvi-faq-category-btn--active' : ''
              }`}
              onClick={() => setSelectedCategory('payments')}
            >
              Payments & Security
            </button>
          </div>

          {/* Search Input & Expand All Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div className="anvi-faq-search-wrap">
              <Search size={16} className="anvi-faq-search-icon" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="anvi-faq-search-input"
                aria-label="Search questions"
              />
            </div>

            {filteredFAQs.length > 0 && (
              <button
                type="button"
                className="anvi-faq-toggle-all-btn"
                onClick={handleToggleAll}
              >
                {areAllExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            )}
          </div>
        </div>

        {/* Accordions List */}
        {filteredFAQs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#ffffff', borderRadius: 4, border: '1px solid var(--color-border-subtle)' }}>
            <p style={{ fontSize: '1rem', color: 'var(--color-deep-maroon)', marginBottom: 8, fontFamily: 'var(--font-serif)' }}>
              No matching questions found
            </p>
            <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: 16 }}>
              Can't find what you're looking for? Reach out directly to our Coimbatore studio concierge.
            </p>
            <a
              href="/contact"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: 'var(--color-deep-maroon)',
                color: 'var(--color-ivory)',
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderRadius: 4,
              }}
            >
              Contact ANVI Clothing
            </a>
          </div>
        ) : (
          <div className="anvi-faq-list" role="region" aria-label="FAQ Accordions">
            {filteredFAQs.map((item) => {
              const isOpen = !!openItemIds[item.id];
              return (
                <div
                  key={item.id}
                  className={`anvi-accordion-item ${
                    isOpen ? 'anvi-accordion-item--open' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="anvi-accordion-trigger"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                  >
                    <span className="anvi-accordion-title">{item.question}</span>
                    <div className="anvi-accordion-icon-wrap" aria-hidden="true">
                      <ChevronDown size={14} />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${item.id}`}
                      className="anvi-accordion-body"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SupportLayout>
  );
};
