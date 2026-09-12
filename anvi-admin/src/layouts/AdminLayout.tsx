import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AdminSidebar } from './components/AdminSidebar';
import { Menu, X, ExternalLink } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { ROUTES } from '../config/routes';
import { requireAdmin } from '../lib/supabase';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    requireAdmin()
      .then(() => {
        if (!cancelled) setAuthorized(true);
      })
      .catch(() => {
        if (!cancelled) setLocation(ROUTES.AUTH.LOGIN);
      });
    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anvi-linen text-anvi-charcoal-text text-sm">
        <span>Verifying administrative session…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-anvi-linen text-anvi-charcoal-text font-body">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-anvi-charcoal/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-anvi-charcoal transform transition-transform duration-200 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-serif font-bold text-white text-base">ANVI Operations</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 text-white/70 hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Executive Header */}
        <header className="h-[68px] bg-white border-b border-anvi-linen-border px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-subtle">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-1 text-anvi-charcoal-muted hover:text-anvi-maroon lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-anvi-linen-border text-xs font-medium text-anvi-charcoal-text">
              Omnichannel · Online + Coimbatore Boutique
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Storefront Status Badge */}
            <a
              href={APP_CONFIG.liveStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-xs"
              title={`Open storefront at ${APP_CONFIG.liveStoreUrl}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">Storefront Online</span>
              <ExternalLink size={12} className="text-emerald-700" />
            </a>

            {/* Curator Tag */}
            <div className="flex items-center gap-2 pl-2 border-l border-anvi-linen-border">
              <div className="w-8 h-8 rounded-full bg-anvi-maroon text-white font-serif font-bold text-xs flex items-center justify-center shadow-xs">
                N
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-anvi-charcoal-text leading-tight">
                  {APP_CONFIG.curatorName}
                </span>
                <span className="block text-[10px] text-anvi-gold-dark font-medium leading-none">
                  Curator & Founder
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Canvas */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
