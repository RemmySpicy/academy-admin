'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/authentication/components/LoginForm';
import { useAuth } from '@/features/authentication/hooks/useRealAuth';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = () => {
    router.push('/admin');
  };

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return <LoginForm onSuccess={handleLoginSuccess} />;
}