import React from 'react';
import { HelpCircle, Truck, RefreshCw, Mail, ShieldCheck, FileText, MessageCircle, Phone } from 'lucide-react';
import './SupportLayout.css';

export type SupportTabKey = 'faq' | 'shipping' | 'returns' | 'contact' | 'privacy' | 'terms';

export interface SupportLayoutProps {
  activeTab: SupportTabKey;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

interface TabItem {
  key: SupportTabKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SUPPORT_TABS: TabItem[] = [
  { key: 'faq', label: 'FAQs', href: '/faqs', icon: HelpCircle },
  { key: 'shipping', label: 'Shipping & Delivery', href: '/shipping', icon: Truck },
  { key: 'returns', label: 'Exchange & Returns', href: '/returns', icon: RefreshCw },
  { key: 'contact', label: 'Contact ANVI Clothing', href: '/contact', icon: Mail },
  { key: 'privacy', label: 'Privacy Policy', href: '/privacy', icon: ShieldCheck },
  { key: 'terms', label: 'Terms & Conditions', href: '/terms', icon: FileText },
];

/**
 * Shared Luxury Shell for ANVI Support, Client Care & Policy Pages
 * Provides consistent breadcrumbs, quick tab switcher, editorial typography,
 * and prominent studio assistance channels.
 */
export const SupportLayout: React.FC<SupportLayoutProps> = ({
  activeTab,
  title,
  eyebrow = 'Client Care & Store Policies',
  subtitle,
  lastUpdated,
  children,
}) => {
  return (
    <div className="anvi-support-wrapper">
      {/* Breadcrumb Bar */}
      <div className="anvi-support-breadcrumbs-bar">
        <div className="anvi-support-container">
          <nav aria-label="Breadcrumbs" className="anvi-support-breadcrumbs">
            <a href="/" className="anvi-breadcrumb-link">Home</a>
            <span className="anvi-breadcrumb-separator" aria-hidden="true">/</span>
            <span className="anvi-breadcrumb-current">Client Care</span>
            <span className="anvi-breadcrumb-separator" aria-hidden="true">/</span>
            <span className="anvi-breadcrumb-active">{title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <header className="anvi-support-hero">
        <div className="anvi-support-container">
          <span className="anvi-support-eyebrow">{eyebrow}</span>
          <h1 className="anvi-support-title">{title}</h1>
          {subtitle && <p className="anvi-support-subtitle">{subtitle}</p>}
          {lastUpdated && (
            <p className="anvi-support-updated">
              Last updated & reviewed: <span>{lastUpdated}</span>
            </p>
          )}
        </div>
      </header>

      {/* Sub-Navigation Tabs Bar */}
      <div className="anvi-support-nav-bar">
        <div className="anvi-support-container">
          <nav className="anvi-support-tabs" aria-label="Support sections">
            {SUPPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <a
                  key={tab.key}
                  href={tab.href}
                  className={`anvi-support-tab-item ${
                    isActive ? 'anvi-support-tab-item--active' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} className="anvi-support-tab-icon" />
                  <span>{tab.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Page Content */}
      <div className="anvi-support-content">
        <div className="anvi-support-container">{children}</div>
      </div>

      {/* Direct Care Bar */}
      <section className="anvi-support-concierge-strip" aria-label="Direct concierge assistance">
        <div className="anvi-support-container">
          <div className="anvi-concierge-inner">
            <div className="anvi-concierge-text">
              <span className="anvi-concierge-badge">✦ Direct Concierge</span>
              <h3 className="anvi-concierge-title">Have a specific question about a drape, custom fit, or order?</h3>
              <p className="anvi-concierge-desc">
                Our Coimbatore team is at your service Monday to Saturday, 10:00 AM – 7:30 PM IST.
              </p>
            </div>
            <div className="anvi-concierge-actions">
              <a
                href="https://wa.me/919994837459?text=Hello%20ANVI%20Clothing,%20I%20have%20an%20inquiry%20regarding%20my%20order/garment."
                target="_blank"
                rel="noopener noreferrer"
                className="anvi-btn-concierge-whatsapp"
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>
              <a href="tel:+919994837459" className="anvi-btn-concierge-call">
                <Phone size={16} />
                <span>Call ANVI Clothing</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
