import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';

export interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ANVI Command ErrorBoundary]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      localStorage.removeItem('anvi_admin_auth');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/admin';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 font-body">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-anvi-linen-border shadow-lg text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-anvi-charcoal-text">
                ANVI Command Notice
              </h2>
              <p className="text-xs text-anvi-charcoal-muted leading-relaxed">
                An unexpected interruption occurred while loading this view.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-left">
                <p className="text-[11px] font-mono text-neutral-600 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-anvi-maroon hover:bg-anvi-maroon-dark text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <RefreshCw size={14} />
                <span>Reload Command Console</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReset}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200 text-xs font-medium transition-colors"
              >
                <span>Reset Admin Session</span>
              </button>

              <a
                href={APP_CONFIG.liveStoreUrl}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-anvi-charcoal-muted hover:text-anvi-maroon pt-2 transition-colors"
              >
                <Home size={13} />
                <span>Return to Storefront</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
