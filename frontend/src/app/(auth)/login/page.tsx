'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/features/authentication/components/LoginForm';
import { useAuth } from '@/components/providers/AppStateProvider';
import { AuthRedirectService } from '@/features/authentication/services/authRedirectService';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();

  const redirectUrl = searchParams.get('redirect');
  const forceLogout = searchParams.get('logout');

  // Handle forced logout
  useEffect(() => {
    console.log('Login: Logout effect:', { forceLogout, isAuthenticated });
    if (forceLogout === 'true' && isAuthenticated) {
      console.log('Login: Forcing logout...');
      logout();
      return;
    }
  }, [forceLogout, isAuthenticated, logout]);

  // State-driven navigation - only redirect when state is fully ready
  useEffect(() => {
    if (isAuthenticated && user && forceLogout !== 'true') {
      console.log('Login: User authenticated, redirecting...', { userId: user.id, role: user.role });
      // Use role-based redirect service
      const targetUrl = AuthRedirectService.getLoginRedirectUrl(user, redirectUrl || undefined);
      console.log('Login: Redirecting to:', targetUrl);
      router.push(targetUrl);
    }
  }, [isAuthenticated, user, router, redirectUrl, forceLogout]);

  // No immediate redirect - login success is handled by state changes
  const handleLoginSuccess = (loggedInUser: any) => {
    console.log('Login: handleLoginSuccess called with user:', loggedInUser.id);
    console.log('Login: Waiting for state-driven navigation...');
    // State updates will trigger the useEffect above
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <LoginForm onSuccess={handleLoginSuccess} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}