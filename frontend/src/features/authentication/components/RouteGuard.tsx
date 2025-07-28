'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/authentication/hooks';
import { useProgramContextGuard, useProgramContextInitializer } from '@/store';
import { AuthRedirectService } from '@/features/authentication/services/authRedirectService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Lock, Users } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Route Guard Component
 * 
 * Protects routes based on user roles and program access.
 * Automatically redirects unauthorized users to appropriate pages.
 */
export function RouteGuard({ children, fallback }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Initialize program context when user is authenticated
  const programInitializer = useProgramContextInitializer();
  const { isReady, hasProgram, needsProgramSelection } = useProgramContextGuard();
  const [isChecking, setIsChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState<{
    reason: string;
    redirectTo?: string;
  } | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);
      setAccessDenied(null);

      // Wait for auth to complete
      if (authLoading) {
        return;
      }

      // Redirect to login if not authenticated
      if (!isAuthenticated || !user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check route permissions
      const routeValidation = AuthRedirectService.validateRouteTransition(
        user,
        '/', // fromPath not critical for this check
        pathname
      );

      if (!routeValidation.allowed) {
        if (routeValidation.redirectTo) {
          router.push(routeValidation.redirectTo);
        } else {
          setAccessDenied({
            reason: routeValidation.reason || 'Access denied',
          });
        }
        setIsChecking(false);
        return;
      }

      // Check program requirements for non-super-admin users
      if (AuthRedirectService.requiresProgramAccess(user.role)) {
        const permission = AuthRedirectService.findRoutePermission(pathname);
        
        if (permission?.requiresProgram) {
          // Wait for program context to be ready
          if (!isReady) {
            return; // Still loading program context
          }

          if (needsProgramSelection) {
            setAccessDenied({
              reason: 'Program selection required',
              redirectTo: '/admin?error=program_required',
            });
            setIsChecking(false);
            return;
          }

          if (!hasProgram) {
            setAccessDenied({
              reason: 'No program access',
              redirectTo: '/admin?error=no_program_access',
            });
            setIsChecking(false);
            return;
          }
        }
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [authLoading, isAuthenticated, user, pathname, router, isReady, hasProgram, needsProgramSelection]);

  // Debug logging for stuck overlay
  console.log('RouteGuard state:', { 
    authLoading, 
    isChecking, 
    isAuthenticated, 
    user: !!user, 
    pathname,
    isReady,
    hasProgram,
    needsProgramSelection 
  });

  // Show loading while checking access
  if (authLoading || isChecking) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Verifying access... 
            {authLoading && ' (Auth loading)'}
            {isChecking && ' (Access checking)'}
          </p>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (accessDenied) {
    return <AccessDeniedPage reason={accessDenied.reason} redirectTo={accessDenied.redirectTo} />;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Access Denied Page Component
 */
function AccessDeniedPage({ reason, redirectTo }: { reason: string; redirectTo?: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const handleRedirect = () => {
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      const defaultRedirect = user ? AuthRedirectService.getUnauthorizedRedirect(user) : '/login';
      router.push(defaultRedirect);
    }
  };

  const getReasonIcon = () => {
    if (reason.includes('program')) {
      return <Users className="h-12 w-12 text-orange-500" />;
    }
    if (reason.includes('permission')) {
      return <Shield className="h-12 w-12 text-red-500" />;
    }
    return <Lock className="h-12 w-12 text-gray-500" />;
  };

  const getReasonTitle = () => {
    if (reason.includes('program required')) {
      return 'Program Selection Required';
    }
    if (reason.includes('no program access')) {
      return 'No Program Access';
    }
    if (reason.includes('permission')) {
      return 'Access Denied';
    }
    return 'Access Restricted';
  };

  const getReasonDescription = () => {
    if (reason.includes('program required')) {
      return 'You need to select a program to access this page. Please select a program from the header or contact your administrator.';
    }
    if (reason.includes('no program access')) {
      return 'You don\'t have access to any programs. Please contact your administrator to be assigned to a program.';
    }
    if (reason.includes('permission')) {
      return 'You don\'t have the required permissions to access this page. Contact your administrator if you believe this is an error.';
    }
    return reason;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            {getReasonIcon()}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {getReasonTitle()}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {getReasonDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Current role: <span className="font-medium">
                {user?.role === 'super_admin' ? 'Super Admin' : 
                 user?.role === 'program_admin' ? 'Program Admin' :
                 user?.role === 'program_coordinator' ? 'Program Coordinator' :
                 user?.role === 'instructor' ? 'Tutor' : 'Unknown'}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()} className="flex-1">
              Go Back
            </Button>
            <Button onClick={handleRedirect} className="flex-1">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RouteGuard;