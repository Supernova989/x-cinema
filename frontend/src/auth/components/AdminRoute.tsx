import { Navigate } from 'react-router';
import { useCurrentUser } from '@/auth/hooks/useCurrentUser';
import { UserRole } from '@/types/user';
import * as React from 'react';

type AdminRouteProps = {
  children: React.ReactNode;
};

export function AdminRoute({ children }: AdminRouteProps) {
  const { data: user } = useCurrentUser();

  if (user.role !== UserRole.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
