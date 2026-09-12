import React from 'react';
import { whyAnviData, type WhyAnviData } from '../../data/whyAnvi';
import './WhyAnvi.css';

export interface WhyAnviProps {
  data?: WhyAnviData;
}

/**
 * ANVI "Why ANVI" Section
 * Heading: WHY WOMEN CHOOSE ANVI
 * Four Core Boutique Principles
 * Extremely clean • Zero oversized cards • Editorial typography & hairline separators.
 */
export const WhyAnvi: React.FC<WhyAnviProps> = ({ data = whyAnviData }) => {
  return (
    <section className="anvi-why-section" aria-labelledby="why-anvi-heading">
      <div className="anvi-why-container">
        {/* Section Header */}
        <div className="anvi-why-header">
          <span className="anvi-why-eyebrow">{data.eyebrow}</span>
          <h2 id="why-anvi-heading" className="anvi-why-heading">
            {data.heading}
          </h2>
          <p className="anvi-why-subtext">{data.subtext}</p>
        </div>

        {/* Four Principles: Editorial Layout with Hairline Separators */}
        <div className="anvi-why-grid" role="list">
          {data.principles.map((principle) => (
            <article key={principle.id} className="anvi-why-item" role="listitem">
              <span className="anvi-why-num" aria-hidden="true">
                {principle.number}
              </span>
              <h3 className="anvi-why-title">{principle.title}</h3>
              <p className="anvi-why-desc">{principle.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyAnvi;
