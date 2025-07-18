'use client';

import React from 'react';
import { useProgramContextSync } from '@/lib/api/programContextSync';

interface ProgramContextSyncProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that synchronizes HTTP client with program context
 * 
 * This component should be placed inside the ProgramContextProvider and AuthProvider
 * to ensure it has access to both the program context state and user authentication.
 */
export function ProgramContextSyncProvider({ children }: ProgramContextSyncProviderProps) {
  // This hook will automatically sync the HTTP client with program context
  useProgramContextSync();

  return <>{children}</>;
}