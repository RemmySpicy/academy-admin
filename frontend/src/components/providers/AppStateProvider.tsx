'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppState, useAppStateSelectors } from '@/store/appState';
import { AuthErrorBoundary } from '@/components/ErrorBoundary';

interface AppStateContextType {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

interface AppStateProviderProps {
  children: ReactNode;
}

/**
 * Production-ready App State Provider
 * 
 * Replaces the old defensive try-catch pattern with proper context management
 * and initialization flow. Ensures authentication and program context are
 * properly loaded before rendering the app.
 */
export function AppStateProvider({ children }: AppStateProviderProps) {
  const isReady = useAppStateSelectors.isReady();
  const isInitialized = useAppStateSelectors.isInitialized();
  const isLoading = useAppStateSelectors.isLoading();
  const authError = useAppStateSelectors.authError();
  const programError = useAppStateSelectors.programError();
  const actions = useAppStateSelectors.actions();

  // Initialize app on mount
  useEffect(() => {
    if (!isInitialized) {
      console.log('AppStateProvider: Starting app initialization...');
      actions.initialize().catch(error => {
        console.error('AppStateProvider: Initialization failed:', error);
      });
    }
  }, [isInitialized, actions]);

  const contextValue: AppStateContextType = {
    isReady,
    isLoading,
    error: authError || programError,
  };

  // Show loading screen during initialization
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isInitialized ? 'Initializing application...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthErrorBoundary>
      <AppStateContext.Provider value={contextValue}>
        {children}
      </AppStateContext.Provider>
    </AuthErrorBoundary>
  );
}

/**
 * Hook to access app state context
 * 
 * Replaces defensive try-catch with proper error handling
 */
export function useAppStateContext(): AppStateContextType {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used within AppStateProvider');
  }
  return context;
}

/**
 * Hook for authentication state (replaces old useAuth)
 */
export function useAuth() {
  const user = useAppStateSelectors.user();
  const isAuthenticated = useAppStateSelectors.isAuthenticated();
  const isLoading = useAppStateSelectors.authLoading();
  const error = useAppStateSelectors.authError();
  const actions = useAppStateSelectors.actions();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: actions.login,
    logout: actions.logout,
    refreshUser: actions.refreshUser,
    clearError: actions.clearAuthError,
  };
}

/**
 * Hook for program context state (replaces old program context hooks)
 */
export function useProgramContext() {
  const currentProgram = useAppStateSelectors.currentProgram();
  const availablePrograms = useAppStateSelectors.availablePrograms();
  const isLoading = useAppStateSelectors.programsLoading();
  const error = useAppStateSelectors.programError();
  const hasPrograms = useAppStateSelectors.hasPrograms();
  const needsProgramSelection = useAppStateSelectors.needsProgramSelection();
  const actions = useAppStateSelectors.actions();

  return {
    currentProgram,
    availablePrograms,
    isLoading,
    error,
    hasPrograms,
    needsProgramSelection,
    switchProgram: actions.switchProgram,
    refreshPrograms: actions.refreshPrograms,
    clearError: actions.clearProgramError,
  };
}

/**
 * Combined hook for route guards
 */
export function useRouteGuardState() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentProgram, hasPrograms, needsProgramSelection, isLoading: programsLoading } = useProgramContext();
  const { isReady } = useAppStateContext();

  return {
    // Auth state
    user,
    isAuthenticated,
    authLoading,
    
    // Program state
    currentProgram,
    hasPrograms,
    needsProgramSelection,
    programsLoading,
    
    // Combined state
    isReady,
    isLoading: authLoading || programsLoading,
  };
}