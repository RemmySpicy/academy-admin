'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApiService } from '@/features/authentication/api/authApiService';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      console.log('Logout page: Starting logout process...');
      
      // Immediately clear all auth data
      authApiService.clearAuth();
      
      // Try to call logout API (but don't wait for it)
      try {
        await authApiService.logout();
        console.log('Logout page: API call successful');
      } catch (error) {
        console.log('Logout page: API call failed (expected):', error);
      }
      
      // Small delay to ensure clearing is complete
      setTimeout(() => {
        console.log('Logout page: Redirecting to login...');
        window.location.href = '/login';
      }, 100);
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}