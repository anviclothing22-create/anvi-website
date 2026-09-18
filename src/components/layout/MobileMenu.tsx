import React, { useEffect, useRef } from 'react';
import { X, Search, User, HelpCircle, ChevronRight } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useSearch } from '../../hooks/useSearch';
import './MobileMenu.css';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeHref?: string;
}

interface DrawerItem {
  id: string;
  label: string;
  href: string;
}

const primaryDrawerItems: DrawerItem[] = [
  { id: 'shop', label: 'Shop', href: '/shop' },
  { id: 'collections', label: 'Collections', href: '/collections' },
  { id: 'occasions', label: 'Occasions', href: '/occasions' },
  { id: 'story', label: 'Our Story', href: '/our-story' },
  { id: 'journal', label: 'Journal', href: '/journal' },
];

/**
 * ANVI Mobile Navigation Drawer
 * Full-height luxury drawer with large touch-friendly editorial typography.
 * Smooth animations, scroll-lock, and accessible focus management.
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  activeHref = '/',
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { openSearch } = useSearch();

  // Lock background scrolling while drawer is active
  useScrollLock(isOpen);

  // Auto-focus close button upon opening for keyboard accessibility
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Dimmed backdrop with blur */}
      <div
        className={`anvi-mobile-drawer-backdrop ${
          isOpen ? 'anvi-mobile-drawer-backdrop--open' : ''
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in drawer container */}
      <div
        className={`anvi-mobile-drawer-panel ${
          isOpen ? 'anvi-mobile-drawer-panel--open' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        aria-hidden={!isOpen}
      >
        {/* Drawer Header */}
        <div className="anvi-drawer-header">
          <a href="/" onClick={onClose} aria-label="ANVI Clothing Home">
            <img
              src="/images/brand/anvi_logo.png"
              alt="ANVI Clothing"
              className="anvi-drawer-logo"
            />
          </a>
          <button
            ref={closeButtonRef}
            type="button"
            className="anvi-drawer-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="anvi-drawer-body">
          {/* Primary Fashion Sections */}
          <nav aria-label="Mobile Primary Navigation">
            <ul className="anvi-drawer-primary-nav" role="list">
              {primaryDrawerItems.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <li key={item.id} className="anvi-drawer-nav-item">
                    <a
                      href={item.href}
                      className={`anvi-drawer-nav-link ${
                        isActive ? 'anvi-drawer-nav-link--active' : ''
                      }`}
                      onClick={onClose}
                    >
                      <span>{item.label}</span>
                      <ChevronRight
                        className="anvi-drawer-link-arrow"
                        size={18}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Secondary Utilities: Search, Account, Help */}
          <nav aria-label="Mobile Secondary Navigation">
            <ul className="anvi-drawer-secondary-nav" role="list">
              <li>
                <button
                  type="button"
                  className="anvi-drawer-secondary-link"
                  onClick={() => {
                    onClose();
                    openSearch();
                  }}
                  style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
                >
                  <Search
                    className="anvi-drawer-secondary-icon"
                    size={18}
                    strokeWidth={1.35}
                    aria-hidden="true"
                  />
                  <span>Search</span>
                </button>
              </li>
              <li>
                <a
                  href="/account"
                  className="anvi-drawer-secondary-link"
                  onClick={onClose}
                >
                  <User
                    className="anvi-drawer-secondary-icon"
                    size={18}
                    strokeWidth={1.35}
                    aria-hidden="true"
                  />
                  <span>Account</span>
                </a>
              </li>
              <li>
                <a
                  href="/faqs"
                  className="anvi-drawer-secondary-link"
                  onClick={onClose}
                >
                  <HelpCircle
                    className="anvi-drawer-secondary-icon"
                    size={18}
                    strokeWidth={1.35}
                    aria-hidden="true"
                  />
                  <span>Help</span>
                </a>
              </li>
            </ul>

            {/* Brand ethos footer */}
            <div className="anvi-drawer-footer">
              <p className="anvi-drawer-ethos">
                Rooted in tradition. Designed for today.
              </p>
              <p className="anvi-drawer-location">
                Boutique • Coimbatore, Tamil Nadu
              </p>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
