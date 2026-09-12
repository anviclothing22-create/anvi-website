import React from 'react';
import { Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { BackToStorefront } from './components/BackToStorefront';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = APP_CONFIG.name,
  subtitle = APP_CONFIG.subtitle,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-body">
      {/* Top Bar with back link */}
      <div className="absolute top-6 left-6 z-10">
        <BackToStorefront />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="flex justify-center mb-4">
          <img
            src="/assets/brand/anvi-logo.png"
            alt="ANVI Clothing"
            className="h-14 w-auto object-contain drop-shadow-sm"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/brand/anvi-logo.svg';
            }}
          />
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h1 className="font-serif text-2xl font-bold tracking-wider text-anvi-charcoal-text">
            {title}
          </h1>
          <Sparkles size={16} className="text-anvi-gold" />
        </div>
        <p className="text-xs text-anvi-charcoal-muted tracking-wide">
          {subtitle}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-anvi-linen-border">
          {children}
        </div>

        <div className="text-center mt-6 text-xs text-anvi-charcoal-muted">
          <p>© {new Date().getFullYear()} ANVI Clothing. All privileges reserved.</p>
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
