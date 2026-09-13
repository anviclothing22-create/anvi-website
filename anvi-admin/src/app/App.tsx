import React from 'react';
import { Router } from 'wouter';
import { AppProviders } from './providers';
import { AppRoutes } from './routes';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router base="/admin">
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </Router>
    </ErrorBoundary>
  );
};
export default App;

