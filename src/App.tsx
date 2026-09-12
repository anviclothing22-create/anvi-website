import React, { Suspense, lazy, useEffect } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import {
  ShippingPage,
  ReturnsPage,
  PrivacyPage,
  TermsPage,
  FAQPage,
  ContactPage,
} from './pages/Support';
import { NotFoundPage } from './pages/NotFound/NotFoundPage';
import { AuthPage } from './pages/Auth/AuthPage';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SearchProvider } from './context/SearchContext';
import { AuthProvider } from './context/AuthContext';
import { SearchModal } from './components/search/SearchModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { LeadCouponModal } from './components/ui/LeadCouponModal';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Code-split heavy routes; Home + static support pages stay eager for instant paint.
const ShopPage = lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const CollectionsPage = lazy(() =>
  import('./pages/Collections/CollectionsPage').then((m) => ({ default: m.CollectionsPage }))
);
const OccasionsPage = lazy(() =>
  import('./pages/Occasions/OccasionsPage').then((m) => ({ default: m.OccasionsPage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const CartPage = lazy(() => import('./pages/Cart/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() =>
  import('./pages/Checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const WishlistPage = lazy(() =>
  import('./pages/Wishlist/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
const AccountPage = lazy(() =>
  import('./pages/Account/AccountPage').then((m) => ({ default: m.AccountPage }))
);
const OurStoryPage = lazy(() =>
  import('./pages/Story/OurStoryPage').then((m) => ({ default: m.OurStoryPage }))
);
const JournalPage = lazy(() =>
  import('./pages/Journal/JournalPage').then((m) => ({ default: m.JournalPage }))
);

const RouteFallback: React.FC = () => (
  <div role="status" aria-label="Loading page" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(47, 43, 43, 0.55)', fontSize: '0.875rem' }}>
    <span>Preparing your boutique experience…</span>
  </div>
);

const LazyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

/**
 * ScrollToTop on route change
 */
const ScrollToTop: React.FC = () => {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  return null;
};

export const App: React.FC = () => {
  const [location] = useLocation();
  const isCheckout = location === '/checkout';

  return (
    <CartProvider>
      <WishlistProvider>
        <SearchProvider>
          <AuthProvider>
          <div className="anvi-app">
            <ScrollToTop />
            <a href="#main-content" className="anvi-skip-link">
              Skip to main content
            </a>
            {!isCheckout && <AnnouncementBar />}
            {!isCheckout && <Header />}
            <SearchModal />
            <CartDrawer />
            <LeadCouponModal />
            <main id="main-content">
              <ErrorBoundary>
                <Switch>
                  <Route path="/">
                    <HomePage />
                  </Route>
                  <Route path="/login">
                    <AuthPage />
                  </Route>
                  <Route path="/shop">
                    <LazyRoute><ShopPage /></LazyRoute>
                  </Route>
                  <Route path="/shop/:category">
                    <LazyRoute><ShopPage /></LazyRoute>
                  </Route>
                  <Route path="/collections">
                    <LazyRoute><CollectionsPage /></LazyRoute>
                  </Route>
                  <Route path="/collections/:slug">
                    <LazyRoute><CollectionsPage /></LazyRoute>
                  </Route>
                  <Route path="/occasions">
                    <LazyRoute><OccasionsPage /></LazyRoute>
                  </Route>
                  <Route path="/occasions/:slug">
                    <LazyRoute><OccasionsPage /></LazyRoute>
                  </Route>
                  <Route path="/search">
                    <LazyRoute><ShopPage /></LazyRoute>
                  </Route>
                  <Route path="/product/:slug">
                    <LazyRoute><ProductDetailPage /></LazyRoute>
                  </Route>
                  <Route path="/cart">
                    <LazyRoute><CartPage /></LazyRoute>
                  </Route>
                  <Route path="/wishlist">
                    <LazyRoute><WishlistPage /></LazyRoute>
                  </Route>
                  <Route path="/checkout">
                    <LazyRoute><CheckoutPage /></LazyRoute>
                  </Route>
                  <Route path="/account">
                    <LazyRoute><AccountPage /></LazyRoute>
                  </Route>
                  <Route path="/account/orders">
                    <LazyRoute><AccountPage /></LazyRoute>
                  </Route>
                  <Route path="/account/wishlist">
                    <LazyRoute><AccountPage /></LazyRoute>
                  </Route>
                <Route path="/our-story">
                  <LazyRoute><OurStoryPage /></LazyRoute>
                </Route>
                <Route path="/journal">
                  <LazyRoute><JournalPage /></LazyRoute>
                </Route>
                <Route path="/journal/:slug">
                  <LazyRoute><JournalPage /></LazyRoute>
                </Route>
                <Route path="/shipping">
                  <ShippingPage />
                </Route>
                <Route path="/returns">
                  <ReturnsPage />
                </Route>
                <Route path="/privacy">
                  <PrivacyPage />
                </Route>
                <Route path="/terms">
                  <TermsPage />
                </Route>
                <Route path="/faqs">
                  <FAQPage />
                </Route>
                <Route path="/contact">
                  <ContactPage />
                </Route>
                {/* Canonical redirects — legacy aliases (SEO: single URL per page) */}
                <Route path="/story"><Redirect to="/our-story" /></Route>
                <Route path="/shipping-policy"><Redirect to="/shipping" /></Route>
                <Route path="/exchange-policy"><Redirect to="/returns" /></Route>
                <Route path="/privacy-policy"><Redirect to="/privacy" /></Route>
                <Route path="/terms-conditions"><Redirect to="/terms" /></Route>
                <Route path="/terms-and-conditions"><Redirect to="/terms" /></Route>
                <Route path="/faq"><Redirect to="/faqs" /></Route>
                <Route path="/help"><Redirect to="/faqs" /></Route>
                <Route path="/visit-us"><Redirect to="/contact" /></Route>
                <Route path="/404">
                  <NotFoundPage />
                </Route>
                  <Route>
                    <NotFoundPage />
                  </Route>
                </Switch>
              </ErrorBoundary>
            </main>
            {!isCheckout && <Footer />}
          </div>
          </AuthProvider>
        </SearchProvider>
      </WishlistProvider>
    </CartProvider>
  );
};

export default App;
