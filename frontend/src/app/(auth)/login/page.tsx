'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/features/authentication/components/LoginForm';
import { useAuth } from '@/features/authentication/hooks';
import { AuthRedirectService } from '@/features/authentication/services/authRedirectService';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();

  const redirectUrl = searchParams.get('redirect');
  const forceLogout = searchParams.get('logout');

  // Handle forced logout
  useEffect(() => {
    console.log('Logout effect:', { forceLogout, isAuthenticated });
    if (forceLogout === 'true' && isAuthenticated) {
      console.log('Forcing logout...');
      logout();
      return;
    }
  }, [forceLogout, isAuthenticated, logout]);

  useEffect(() => {
    if (isAuthenticated && user && forceLogout !== 'true') {
      // Use role-based redirect service
      const targetUrl = AuthRedirectService.getLoginRedirectUrl(user, redirectUrl || undefined);
      router.push(targetUrl);
    }
  }, [isAuthenticated, user, router, redirectUrl, forceLogout]);

  const handleLoginSuccess = (loggedInUser: any) => {
    console.log('handleLoginSuccess called with user:', loggedInUser);
    // Get appropriate redirect URL based on user role
    const targetUrl = AuthRedirectService.getLoginRedirectUrl(loggedInUser, redirectUrl || undefined);
    console.log('Redirecting to:', targetUrl);
    router.push(targetUrl);
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
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