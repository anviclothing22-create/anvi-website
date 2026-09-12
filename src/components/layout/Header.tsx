import React, { useState, useEffect } from 'react';
import { Menu, Search, User, Heart, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { mainNavItems, type NavItem } from '../../data/navigation';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useSearch } from '../../hooks/useSearch';
import { MobileMenu } from './MobileMenu';
import './Header.css';

export interface HeaderProps {
  navItems?: NavItem[];
  transparent?: boolean;
  cartCount?: number;
  wishlistCount?: number;
  onSearchClick?: () => void;
  onAccountClick?: () => void;
  onWishlistClick?: () => void;
  onBagClick?: () => void;
  activeHref?: string;
}

/**
 * ANVI Ecommerce Header
 * Single canonical header implementation.
 * Responsive composition:
 * - Desktop: Left Logo, Center Nav, Right Utilities
 * - Mobile: Left Menu, Center Logo, Right Wishlist & Bag
 */
export const Header: React.FC<HeaderProps> = ({
  navItems = mainNavItems,
  transparent = false,
  cartCount: propCartCount,
  wishlistCount: propWishlistCount,
  onSearchClick,
  onAccountClick,
  onWishlistClick,
  onBagClick,
  activeHref: propActiveHref,
}) => {
  const [location] = useLocation();
  const activeHref = propActiveHref !== undefined ? propActiveHref : location;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount: contextCartCount, setIsCartOpen } = useCart();
  const { wishlistCount: contextWishlistCount } = useWishlist();
  const { openSearch } = useSearch();

  const effectiveCartCount = propCartCount !== undefined ? propCartCount : contextCartCount;
  const effectiveWishlistCount = propWishlistCount !== undefined ? propWishlistCount : contextWishlistCount;

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 20;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleBagClick = () => {
    if (onBagClick) {
      onBagClick();
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <>
      <header
        className={`anvi-header ${isScrolled ? 'anvi-header--scrolled' : ''} ${
          transparent && !isScrolled ? 'anvi-header--transparent' : ''
        }`}
        role="banner"
      >
        <div className="anvi-header-container">
          {/* Left: Mobile Menu Button OR Desktop Logo */}
          <div className="anvi-header-left">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              className="anvi-header-action-btn anvi-header-mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={22} strokeWidth={1.35} aria-hidden="true" />
            </button>

            {/* Desktop Logo */}
            <div className="anvi-header-desktop-logo">
              <Link href="/" className="anvi-logo-link" aria-label="ANVI Home">
                <img
                  src="/images/brand/anvi_logo.png"
                  alt="ANVI"
                  className="anvi-logo-img"
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
              </Link>
            </div>
          </div>

          {/* Center: Mobile Centered Logo OR Desktop Navigation */}
          <div className="anvi-header-center-wrapper">
            {/* Mobile Centered Logo */}
            <div className="anvi-header-mobile-logo">
              <Link href="/" className="anvi-logo-link" aria-label="ANVI Home">
                <img
                  src="/images/brand/anvi_logo.png"
                  alt="ANVI"
                  className="anvi-logo-img"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="anvi-header-center" aria-label="Primary Navigation">
              <ul className="anvi-nav-list" role="list">
                {navItems.map((item) => {
                  const isActive = activeHref === item.href;
                  return (
                    <li key={item.id} className="anvi-nav-item">
                      <Link
                        href={item.href}
                        className={`anvi-nav-link ${isActive ? 'anvi-nav-link--active' : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="anvi-header-right">
            {/* Search (Desktop only) */}
            <button
              type="button"
              className="anvi-header-action-btn anvi-header-search-btn"
              onClick={() => {
                if (onSearchClick) {
                  onSearchClick();
                } else {
                  openSearch();
                }
              }}
              aria-label="Search catalog"
            >
              <Search size={18} strokeWidth={1.35} aria-hidden="true" />
            </button>

            {/* Account (Desktop only) */}
            <Link
              href="/account"
              className="anvi-header-action-btn anvi-header-account-btn"
              onClick={(e) => {
                if (onAccountClick) {
                  e.preventDefault();
                  onAccountClick();
                }
              }}
              aria-label="My Account"
            >
              <User size={18} strokeWidth={1.35} aria-hidden="true" />
            </Link>

            {/* Wishlist (Desktop & Mobile) */}
            <Link
              href="/wishlist"
              className="anvi-header-action-btn"
              onClick={(e) => {
                if (onWishlistClick) {
                  e.preventDefault();
                  onWishlistClick();
                }
              }}
              aria-label={
                effectiveWishlistCount > 0
                  ? `Wishlist with ${effectiveWishlistCount} saved items`
                  : 'Wishlist'
              }
            >
              <Heart size={18} strokeWidth={1.35} aria-hidden="true" />
              {effectiveWishlistCount > 0 && (
                <span className="anvi-header-badge" aria-hidden="true">
                  {effectiveWishlistCount}
                </span>
              )}
            </Link>

            {/* Bag (Desktop & Mobile) */}
            <button
              type="button"
              className="anvi-header-action-btn"
              onClick={handleBagClick}
              aria-label={
                effectiveCartCount > 0
                  ? `Shopping bag with ${effectiveCartCount} items`
                  : 'Shopping bag'
              }
            >
              <ShoppingBag size={18} strokeWidth={1.35} aria-hidden="true" />
              {effectiveCartCount > 0 && (
                <span className="anvi-header-badge" aria-hidden="true">
                  {effectiveCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Height Mobile Navigation Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeHref={activeHref}
      />
    </>
  );
};

export default Header;
