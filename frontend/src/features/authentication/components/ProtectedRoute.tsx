'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks';
import { useProgramContextInitializer } from '@/store';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  
  // Initialize program context when authenticated
  const { isInitialized } = useProgramContextInitializer();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      // Check role requirements
      if (requiredRole && user?.role !== requiredRole) {
        // If user doesn't have required role, redirect based on their role
        if (user?.role === 'user') {
          router.push('/admin/students'); // Users go to students page
        } else {
          router.push('/login');
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

// Convenience wrapper for admin only routes
export function SuperAdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}

// Higher-order component for page-level protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'admin' | 'user'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}