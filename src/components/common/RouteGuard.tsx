import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/types';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isPublic = PUBLIC_ROUTES.includes(location.pathname);

  if (!user && !isPublic) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Already logged in visiting login/register → go to dashboard
  if (user && isPublic && location.pathname !== '/') {
    return <Navigate to="/dashboard" replace />;
  }
  if (user && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
