import React from 'react';
import {
  customerReviewsData,
  reviewSummaryData,
  type CustomerReview,
  type ReviewSummary,
} from '../../data/reviews';
import './CustomerReviews.css';

export interface CustomerReviewsProps {
  heading?: string;
  eyebrow?: string;
  summary?: ReviewSummary;
  reviews?: CustomerReview[];
}

/**
 * Render 5 stars helper with gold fills
 */
const renderStars = (rating: number, maxRating: number = 5) => {
  return Array.from({ length: maxRating }).map((_, i) => (
    <span key={i} aria-hidden="true">
      {i < rating ? '★' : '☆'}
    </span>
  ));
};

/**
 * ANVI Customer Reviews Section
 * Heading: LOVED BY WOMEN LIKE YOU.
 * Authentic community experiences • Editorial grid on desktop • Fluid swipe on mobile.
 */
export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  heading = 'LOVED BY WOMEN LIKE YOU.',
  eyebrow = 'COMMUNITY VOICES',
  summary = reviewSummaryData,
  reviews = customerReviewsData,
}) => {
  return (
    <section className="anvi-reviews-section" aria-labelledby="reviews-section-heading">
      <div className="anvi-reviews-container">
        {/* Section Header with Overall Rating Summary */}
        <div className="anvi-reviews-header">
          <span className="anvi-reviews-eyebrow">{eyebrow}</span>
          <h2 id="reviews-section-heading" className="anvi-reviews-heading">
            {heading}
          </h2>

          {/* Overall Rating Summary */}
          <div
            className="anvi-reviews-summary-wrap"
            aria-label={`Rated ${summary.rating} out of ${summary.maxRating} stars across over ${summary.totalReviews} verified reviews`}
          >
            <div className="anvi-reviews-stars-wrap">
              {renderStars(Math.round(summary.rating), summary.maxRating)}
            </div>
            <span className="anvi-reviews-score">
              {summary.rating.toFixed(1)} / {summary.maxRating}
            </span>
            <span className="anvi-reviews-summary-sep" aria-hidden="true" />
            <span className="anvi-reviews-count">
              {summary.totalReviews.toLocaleString()}+ Verified Women
            </span>
          </div>
        </div>

        {/* Authentic Reviews Track (Desktop Grid / Mobile Native Horizontal Scroll) */}
        <div className="anvi-reviews-track" role="list">
          {reviews.map((item) => (
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
    </section>
  );
};

export default CustomerReviews;
