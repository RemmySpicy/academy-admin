'use client';

import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { Toaster } from '@/components/ui/toaster';
import { AppStateProvider } from '@/components/providers/AppStateProvider';
import { UnsavedChangesProvider } from '@/hooks/useUnsavedChanges';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <AppStateProvider>
            <UnsavedChangesProvider>
              {children}
              <ToastProvider />
              <Toaster />
            </UnsavedChangesProvider>
          </AppStateProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}