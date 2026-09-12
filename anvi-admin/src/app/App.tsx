import React from 'react';
import { Router } from 'wouter';
import { AppProviders } from './providers';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <Router base="/admin">
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </Router>
  );
};
export default App;
