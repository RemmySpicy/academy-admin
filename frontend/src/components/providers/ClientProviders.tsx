'use client';

import { AuthProvider } from '@/features/authentication/hooks';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { Toaster } from '@/components/ui/toaster';
import { ProgramContextProvider } from '@/store';
import { ProgramContextSyncProvider } from '@/components/providers/ProgramContextSyncProvider';
import { UnsavedChangesProvider } from '@/hooks/useUnsavedChanges';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ProgramContextProvider>
          <UnsavedChangesProvider>
            <ProgramContextSyncProvider>
              {children}
              <ToastProvider />
              <Toaster />
            </ProgramContextSyncProvider>
          </UnsavedChangesProvider>
        </ProgramContextProvider>
      </AuthProvider>
    </QueryProvider>
  );
}