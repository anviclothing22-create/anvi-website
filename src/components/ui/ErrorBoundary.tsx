import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ErrorState';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ANVI Global Error Boundary
 * Intercepts uncaught React rendering crashes and displays a quiet, polite,
 * luxury error state without leaking stack traces or technical jargon to customers.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log privately to internal telemetry/console without showing to customers
    if (typeof console !== 'undefined' && console.error) {
      console.error('[ANVI Studio Boundary Caught Error]:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          variant="full-page"
          scope="general"
          title="A momentary pause in our studio."
          message="We encountered an unexpected pause while rendering this page. Your shopping bag and saved heirlooms remain completely safe."
          retryLabel="Refresh This Page"
          onRetry={this.handleReset}
          secondaryAction={{
            label: 'Return to Home',
            href: '/',
          }}
          showConcierge={true}
        />
      );
    }

    return this.props.children;
  }
}
