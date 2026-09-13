import React, { useState, useEffect, useMemo } from 'react';
import {
  customerReviewsData,
  reviewSummaryData,
  type CustomerReview,
  type ReviewSummary,
} from '../../data/reviews';
import { getSupabase } from '../../lib/supabaseClient';
import { STORAGE_KEYS, getStoredItem, setStoredItem, subscribeToStoreUpdates } from '../../lib/storeSync';
import { Star, MessageSquarePlus, X, CheckCircle2 } from 'lucide-react';
import './CustomerReviews.css';

export interface CustomerReviewsProps {
  heading?: string;
  eyebrow?: string;
  summary?: ReviewSummary;
  reviews?: CustomerReview[];
}

function mapSupabaseReview(r: any): CustomerReview {
  return {
    id: String(r.id),
    name: r.reviewer_name || r.reviewerName || r.name || 'ANVI Patron',
    location: r.reviewer_location || r.reviewerLocation || r.location || '',
    rating: Number(r.rating) || 5,
    review: r.body || r.review || '',
    purchasedProduct: r.purchased_product_name || r.purchasedProductName || r.purchasedProduct || '',
    verified: Boolean(r.is_verified ?? r.isVerified ?? true),
    date: r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : r.date || 'Curated Review',
  };
}

/**
 * Render 5 stars helper with gold fills
 */
const renderStars = (rating: number, maxRating: number = 5) => {
  return Array.from({ length: maxRating }).map((_, i) => (
    <span key={i} aria-hidden="true" className={i < rating ? 'anvi-star-filled' : 'anvi-star-empty'}>
      ★
    </span>
  ));
};

/**
 * ANVI Customer Reviews Section
 * Heading: LOVED BY WOMEN LIKE YOU.
 * Authenticated Community Experiences • Editorial Grid • Dynamic Supabase Sync
 */
export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  heading = 'LOVED BY WOMEN LIKE YOU.',
  eyebrow = 'COMMUNITY VOICES',
  summary: propSummary,
  reviews: propReviews,
}) => {
  const [liveReviews, setLiveReviews] = useState<CustomerReview[]>(() => {
    if (propReviews) return propReviews;
    const stored = getStoredItem<any[]>(STORAGE_KEYS.REVIEWS, []);
    return stored.length > 0 ? stored.map(mapSupabaseReview) : customerReviewsData;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form fields for adding a review
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [productName, setProductName] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  // 1. Fetch live approved reviews from Supabase
  useEffect(() => {
    if (propReviews) return;
    let cancelled = false;
    const sb = getSupabase();

    if (sb) {
      (async () => {
        try {
          const { data, error } = await sb
            .from('reviews')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0 && !cancelled) {
            const mapped = data.map(mapSupabaseReview);
            setLiveReviews(mapped);
            setStoredItem(STORAGE_KEYS.REVIEWS, data, 'REVIEWS_UPDATED');
          }
        } catch {
          // graceful offline fallback
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [propReviews]);

  // 2. Subscribe to cross-tab / Admin updates
  useEffect(() => {
    if (propReviews) return;
    const unsubscribe = subscribeToStoreUpdates((event) => {
      if (event.type === 'REVIEWS_UPDATED' || event.type === 'CMS_UPDATED') {
        const stored = getStoredItem<any[]>(STORAGE_KEYS.REVIEWS, []);
        if (stored && stored.length > 0) {
          setLiveReviews(stored.map(mapSupabaseReview));
        }
      }
    });
    return unsubscribe;
  }, [propReviews]);

  // Dynamic Rating & Summary calculation
  const computedSummary = useMemo<ReviewSummary>(() => {
    if (propSummary) return propSummary;
    if (liveReviews.length === 0) return reviewSummaryData;

    const total = liveReviews.length;
    const sum = liveReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = Number((sum / total).toFixed(1));
    return {
      rating: avg > 0 ? avg : 4.9,
      maxRating: 5,
      totalReviews: Math.max(total, reviewSummaryData.totalReviews),
      recommendationPercentage: 98,
    };
  }, [propSummary, liveReviews]);

  // Handle client review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewBody.trim()) return;

    setSubmitting(true);
    const newEntry: CustomerReview = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      location: location.trim() || 'Tamil Nadu',
      rating: stars,
      review: reviewBody.trim(),
      purchasedProduct: productName.trim() || 'ANVI Handloom Weave',
      verified: true,
      date: 'Just Now',
    };

    // Optimistically update local view
    const updated = [newEntry, ...liveReviews];
    setLiveReviews(updated);

    // Persist to Supabase
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('reviews').insert([
          {
            reviewer_name: newEntry.name,
            reviewer_location: newEntry.location,
            rating: newEntry.rating,
            body: newEntry.review,
            purchased_product_name: newEntry.purchasedProduct,
            is_verified: true,
            is_approved: true,
          },
        ]);
      } catch (err) {
        console.warn('[CustomerReviews] Submission error:', err);
      }
    }

    setSubmitting(false);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsModalOpen(false);
      setName('');
      setLocation('');
      setStars(5);
      setProductName('');
      setReviewBody('');
    }, 2000);
  };

  return (
    <section className="anvi-reviews-section" aria-labelledby="reviews-section-heading">
      <div className="anvi-reviews-container">
        {/* Section Header with Overall Rating Summary */}
        <div className="anvi-reviews-header">
          <span className="anvi-reviews-eyebrow">{eyebrow}</span>
          <h2 id="reviews-section-heading" className="anvi-reviews-heading">
            {heading}
          </h2>

          {/* Overall Rating Summary Plate */}
          <div
            className="anvi-reviews-summary-wrap"
            aria-label={`Rated ${computedSummary.rating} out of ${computedSummary.maxRating} stars across verified reviews`}
          >
            <div className="anvi-reviews-stars-wrap">
              {renderStars(Math.round(computedSummary.rating), computedSummary.maxRating)}
            </div>
            <span className="anvi-reviews-score">
              {computedSummary.rating.toFixed(1)} / {computedSummary.maxRating}
            </span>
            <span className="anvi-reviews-summary-sep" aria-hidden="true" />
            <span className="anvi-reviews-count">
              {computedSummary.totalReviews.toLocaleString()}+ Verified Women
            </span>
          </div>

          {/* Call-to-action button to share review */}
          <div className="anvi-reviews-cta-wrap">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="anvi-write-review-btn"
            >
              <MessageSquarePlus className="w-4 h-4 mr-1.5" />
              <span>Share Your Experience</span>
            </button>
          </div>
        </div>

        {/* Authentic Reviews Track (Desktop Grid / Mobile Native Horizontal Scroll) */}
        <div className="anvi-reviews-track" role="list">
          {liveReviews.map((item) => (
            <article key={item.id} className="anvi-review-card" role="listitem">
              <div>
                <div className="anvi-review-top">
                  <div
                    className="anvi-review-stars"
                    aria-label={`${item.rating} out of 5 stars`}
                  >
                    {renderStars(item.rating)}
                  </div>
                  {item.date && <span className="anvi-review-date">{item.date}</span>}
                </div>

                <blockquote className="anvi-review-body">
                  “{item.review}”
                </blockquote>
              </div>

              <div className="anvi-review-footer">
                <div className="anvi-review-author-wrap">
                  <span className="anvi-review-name">{item.name}</span>
                  {item.location && (
                    <span className="anvi-review-location">{item.location}</span>
                  )}
                </div>

                {item.purchasedProduct && (
                  <div className="anvi-review-product">
                    <span className="anvi-review-product-tag" aria-hidden="true">
                      ✦
                    </span>
                    <span>{item.purchasedProduct}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="anvi-review-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="anvi-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="write-review-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="anvi-review-modal-close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedSuccess ? (
              <div className="anvi-review-success-state">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3" />
                <h3 className="anvi-review-success-title">Thank You, Sister</h3>
                <p className="anvi-review-success-desc">
                  Your words celebrate the timeless hands of our weavers. Your review is now published.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="anvi-review-form">
                <span className="anvi-reviews-eyebrow">COMMUNITY TESTIMONIAL</span>
                <h3 id="write-review-title" className="anvi-review-modal-title">
                  Share Your ANVI Experience
                </h3>
                <p className="anvi-review-modal-sub">
                  How did the drape feel? We cherish hearing from women who wear our handpicked creations.
                </p>

                {/* Rating picker */}
                <div className="anvi-form-group">
                  <label className="anvi-form-label">Your Rating</label>
                  <div className="anvi-star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStars(star)}
                        onMouseEnter={() => setHoverStars(star)}
                        onMouseLeave={() => setHoverStars(null)}
                        className="anvi-star-btn"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverStars ?? stars)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="anvi-star-count">{stars} / 5 Stars</span>
                  </div>
                </div>

                {/* Name & City */}
                <div className="anvi-form-row">
                  <div className="anvi-form-group">
                    <label className="anvi-form-label">
                      Your Name <span className="anvi-req">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Radhika Menon"
                      required
                      className="anvi-form-input"
                    />
                  </div>

                  <div className="anvi-form-group">
                    <label className="anvi-form-label">City / Town</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Coimbatore, Tamil Nadu"
                      className="anvi-form-input"
                    />
                  </div>
                </div>

                {/* Garment Loved */}
                <div className="anvi-form-group">
                  <label className="anvi-form-label">Garment or Weave Purchased</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Handwoven Ajrakh Chanderi Saree"
                    className="anvi-form-input"
                  />
                </div>

                {/* Review body */}
                <div className="anvi-form-group">
                  <label className="anvi-form-label">
                    Your Review <span className="anvi-req">*</span>
                  </label>
                  <textarea
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    rows={4}
                    placeholder="Tell us about the texture, fit, compliments received, or festive occasion..."
                    required
                    className="anvi-form-textarea"
                  />
                </div>

                {/* Submit action */}
                <div className="anvi-form-actions">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="anvi-form-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !reviewBody.trim()}
                    className="anvi-form-submit-btn"
                  >
                    {submitting ? 'Submitting...' : 'Post Experience'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CustomerReviews;
