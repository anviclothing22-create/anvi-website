import React from 'react';
import { ArrowRight } from 'lucide-react';
import './NotFoundPage.css';

/**
 * Premium ANVI 404 Page
 * Minimal, refined luxury aesthetic with subtle editorial typography and muted studio imagery.
 */
export const NotFoundPage: React.FC = () => {
  return (
    <div className="anvi-404-page">
      <div className="anvi-404-container">
        {/* Subtle Watermark Monograph / 404 Numeral */}
        <div className="anvi-404-watermark" aria-hidden="true">
          404
        </div>

        {/* Minimal Editorial Card */}
        <div className="anvi-404-content">
          {/* Subtle Brand Emblem */}
          <div className="anvi-404-brand-seal">
            <span className="anvi-404-eyebrow">Design Monograph</span>
          </div>

          {/* User Required Headline */}
          <h1 className="anvi-404-headline">
            Looks like this piece has wandered away.
          </h1>

          {/* Short Supporting Text */}
          <p className="anvi-404-desc">
            The silhouette or page you are seeking may have been archived, renamed,
            or is currently resting in our studio.
          </p>

          {/* User Required Actions */}
          <div className="anvi-404-actions">
            <a href="/shop" className="anvi-404-btn anvi-404-btn--primary">
              <span>SHOP NEW ARRIVALS</span>
              <ArrowRight size={15} />
            </a>
            <a href="/" className="anvi-404-btn anvi-404-btn--secondary">
              <span>GO HOME</span>
            </a>
          </div>

          {/* Subtle Suggested Discovery Links */}
          <div className="anvi-404-links">
            <span className="anvi-404-links-label">Explore ANVI Clothing</span>
            <div className="anvi-404-links-group">
              <a href="/shop/sarees">Sarees</a>
              <span className="dot" aria-hidden="true">·</span>
              <a href="/shop/salwars">Salwars</a>
              <span className="dot" aria-hidden="true">·</span>
              <a href="/shop/co-ord-sets">Co-ord Sets</a>
              <span className="dot" aria-hidden="true">·</span>
              <a href="/our-story">Our Story</a>
              <span className="dot" aria-hidden="true">·</span>
              <a href="/contact">Contact Us</a>
            </div>
          </div>
        </div>

        {/* Subtle Framed Image Accent */}
        <div className="anvi-404-visual-accent" aria-hidden="true">
          <img
            src="/images/brand/brand_story.webp"
            alt=""
            className="anvi-404-accent-img"
          />
          <div className="anvi-404-accent-overlay" />
        </div>
      </div>
    </div>
  );
};
