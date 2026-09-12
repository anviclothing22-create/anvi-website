import React from 'react';
import { Link } from 'wouter';
import './FinalConversion.css';

export interface FinalConversionProps {
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  supportingText?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

/**
 * ANVI Final Homepage Conversion Section
 * Background: Deep Maroon #5B1727
 * Headline: "Find something that feels like you."
 * Final Emotional Transition into Shopping • Calm Luxury • Zero Urgency Tactics.
 */
export const FinalConversion: React.FC<FinalConversionProps> = ({
  eyebrow = 'TIMELESS WEAVES · DESIGNED FOR TODAY',
  headlineLine1 = 'Find something',
  headlineLine2 = 'that feels like you.',
  supportingText = 'Thoughtfully chosen contemporary Indian silhouettes, crafted to belong in your story.',
  primaryCtaText = 'SHOP WOMEN',
  primaryCtaHref = '/shop',
  secondaryCtaText = 'EXPLORE COLLECTIONS',
  secondaryCtaHref = '/collections',
  onPrimaryClick,
  onSecondaryClick,
}) => {
  const handlePrimaryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onPrimaryClick) {
      e.preventDefault();
      onPrimaryClick();
    }
  };

  const handleSecondaryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onSecondaryClick) {
      e.preventDefault();
      onSecondaryClick();
    }
  };

  return (
    <section
      className="anvi-final-conversion-section"
      aria-labelledby="final-conversion-heading"
    >
      <div className="anvi-final-conversion-glow" aria-hidden="true" />

      <div className="anvi-final-conversion-container">
        {/* Emblem / Eyebrow */}
        {eyebrow && (
          <div className="anvi-final-conversion-emblem" aria-hidden="true">
            <span className="anvi-final-conversion-emblem-line" />
            <span className="anvi-final-conversion-emblem-glyph">✦</span>
            <span className="anvi-final-conversion-eyebrow">{eyebrow}</span>
            <span className="anvi-final-conversion-emblem-glyph">✦</span>
            <span className="anvi-final-conversion-emblem-line" />
          </div>
        )}

        {/* Large Editorial Serif Display Headline */}
        <h2
          id="final-conversion-heading"
          className="anvi-final-conversion-headline"
        >
          <span className="anvi-final-conversion-headline-line1">
            {headlineLine1}
          </span>
          <span className="anvi-final-conversion-headline-line2">
            {headlineLine2}
          </span>
        </h2>

        {/* Concise Supporting Copy */}
        {supportingText && (
          <p className="anvi-final-conversion-copy">{supportingText}</p>
        )}

        {/* Calm Dual Actions */}
        <div className="anvi-final-conversion-actions">
          <Link
            href={primaryCtaHref}
            className="anvi-final-conversion-btn-primary"
            onClick={handlePrimaryClick}
          >
            <span>{primaryCtaText}</span>
            <span className="anvi-final-conversion-arrow" aria-hidden="true">
              →
            </span>
          </Link>

          <Link
            href={secondaryCtaHref}
            className="anvi-final-conversion-btn-secondary"
            onClick={handleSecondaryClick}
          >
            <span>{secondaryCtaText}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalConversion;
