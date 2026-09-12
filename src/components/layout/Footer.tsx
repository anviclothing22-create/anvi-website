import React, { useState } from 'react';
import { footerData, type FooterData } from '../../data/footer';
import './Footer.css';

export interface FooterProps {
  data?: FooterData;
}

/**
 * ANVI Complete Ecommerce Footer Component
 * Background: Deep Maroon #5B1727
 * Groups: SHOP, COLLECTIONS, DISCOVER, ABOUT, HELP
 * Legal Navigation & Mobile Expandable Accordions
 */
export const Footer: React.FC<FooterProps> = ({ data = footerData }) => {
  // Track expanded accordion sections on mobile (keyed by group.id)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <footer className="anvi-footer" role="contentinfo" aria-label="ANVI Site Footer">
      <div className="anvi-footer-container">
        {/* Top Brand Block */}
        <div className="anvi-footer-top">
          <div className="anvi-footer-brand">
            <a href="/" className="anvi-footer-logo-link" aria-label="ANVI Homepage">
              <img
                src={data.brand.logoSrc}
                alt={data.brand.name}
                className="anvi-footer-logo-img"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const sibling = target.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = 'block';
                }}
              />
              <span className="anvi-logo-text" style={{ display: 'none' }}>
                ANVI
              </span>
            </a>
            <span className="anvi-footer-tagline">{data.brand.tagline}</span>
            <span className="anvi-footer-origin">{data.brand.location}</span>
          </div>

          {/* Social Links */}
          <div className="anvi-footer-socials" aria-label="Social connections">
            <a
              href="https://www.instagram.com/anviclothing_coimbatore/"
              target="_blank"
              rel="noopener noreferrer"
              className="anvi-footer-social-link"
              aria-label="Follow ANVI on Instagram"
              title="Instagram"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://wa.me/919994837459"
              target="_blank"
              rel="noopener noreferrer"
              className="anvi-footer-social-link"
              aria-label="Chat with ANVI on WhatsApp"
              title="WhatsApp"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.17-.47-.29z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* 5 Navigation Groups */}
        <nav className="anvi-footer-nav" aria-label="Footer Navigation">
          {data.groups.map((group) => {
            const isExpanded = !!expandedGroups[group.id];

            return (
              <div key={group.id} className="anvi-footer-group">
                {/* Desktop Title */}
                <h3 className="anvi-footer-title">{group.title}</h3>

                {/* Mobile Accordion Toggle Button */}
                <button
                  type="button"
                  className="anvi-footer-accordion-btn"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`footer-list-${group.id}`}
                >
                  <span>{group.title}</span>
                  <span className="anvi-footer-accordion-icon" aria-hidden="true">
                    +
                  </span>
                </button>

                {/* Links List */}
                <ul
                  id={`footer-list-${group.id}`}
                  className={`anvi-footer-list ${
                    isExpanded ? 'anvi-footer-list--expanded' : ''
                  }`}
                >
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="anvi-footer-link"
                        target={link.isExternal ? '_blank' : undefined}
                        rel={link.isExternal ? 'noopener noreferrer' : undefined}
                      >
                        {link.label}
                        {link.isExternal && (
                          <span aria-hidden="true" style={{ marginLeft: 4 }}>
                            ↗
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Bottom Legal Navigation & Copyright */}
        <div className="anvi-footer-bottom">
          <p className="anvi-footer-copyright">{data.copyright}</p>

          <div className="anvi-footer-legal-nav" aria-label="Legal Navigation">
            {data.legalLinks.map((link) => (
              <a key={link.label} href={link.href} className="anvi-footer-legal-link">
                {link.label}
              </a>
            ))}
            {import.meta.env.DEV && import.meta.env.VITE_ADMIN_URL && (
              <a
                href={import.meta.env.VITE_ADMIN_URL as string}
                target="_blank"
                rel="noopener noreferrer"
                className="anvi-footer-legal-link"
              >
                Admin Command ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
