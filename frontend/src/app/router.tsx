import { createBrowserRouter, RouterProvider } from 'react-router';

import { AccountLayout } from './layouts/account/AccountLayout.tsx';
import { PublicLayout } from './layouts/public/PublicLayout.tsx';
import { AdminLayout } from './layouts/admin/AdminLayout.tsx';
import { ProtectedRoute } from '@/auth/components/ProtectedRoute';
import { AdminRoute } from '@/auth/components/AdminRoute';
import { HomePage } from '@/pages/public/HomePage';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { AccountPage } from '@/pages/account/AccountPage';
import { OrdersPage } from '@/pages/account/OrdersPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { MoviesPage } from '@/pages/admin/MoviesPage';
import { LocationsPage } from '@/pages/admin/LocationsPage';
import { RoomsPage } from '@/pages/admin/RoomsPage';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AccountLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'account',
        element: <AccountPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
    ],
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'movies',
        element: <MoviesPage />,
      },
      {
        path: 'locations',
        element: <LocationsPage />,
      },
      {
        path: 'rooms',
        element: <RoomsPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
