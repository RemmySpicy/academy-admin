import type { Metadata } from 'next'
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/features/authentication/hooks';

export const metadata: Metadata = {
  title: 'Login - Academy Admin',
  description: 'Sign in to Academy Management System',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <ToastProvider />
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  )
}