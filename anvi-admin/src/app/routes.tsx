import React from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Admin Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { CategoriesPage } from '@/pages/categories/CategoriesPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { OrderDetailsPage } from '@/pages/orders/OrderDetailsPage';
import { CouponsPage } from '@/pages/coupons/CouponsPage';
import { LeadsPage } from '@/pages/leads/LeadsPage';
import { CMSPage } from '@/pages/cms/CMSPage';

export const AppRoutes: React.FC = () => {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login">
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      </Route>
      <Route path="/forgot-password">
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      </Route>
      <Route path="/reset-password">
        <AuthLayout>
          <ResetPasswordPage />
        </AuthLayout>
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/">
        <AdminLayout>
          <DashboardPage />
        </AdminLayout>
      </Route>

      <Route path="/products">
        <AdminLayout>
          <ProductsPage />
        </AdminLayout>
      </Route>

      <Route path="/categories">
        <AdminLayout>
          <CategoriesPage />
        </AdminLayout>
      </Route>

      <Route path="/orders">
        <AdminLayout>
          <OrdersPage />
        </AdminLayout>
      </Route>

      <Route path="/orders/:id">
        <AdminLayout>
          <OrderDetailsPage />
        </AdminLayout>
      </Route>

      <Route path="/coupons">
        <AdminLayout>
          <CouponsPage />
        </AdminLayout>
      </Route>

      <Route path="/leads">
        <AdminLayout>
          <LeadsPage />
        </AdminLayout>
      </Route>

      <Route path="/cms">
        <AdminLayout>
          <CMSPage />
        </AdminLayout>
      </Route>

      {/* Fallback */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};
export default AppRoutes;
