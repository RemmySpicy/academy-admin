/**
 * Program Context Initializer
 * 
 * Handles initialization of program context state when user logs in
 */

import React, { useEffect } from 'react';
import { useProgramContext } from './programContext';
import { useAuth } from '@/features/authentication/hooks';

/**
 * Program Context Initializer Hook
 * 
 * This hook should be used in the root layout or authentication provider
 * to initialize the program context when a user logs in.
 */
export const useProgramContextInitializer = () => {
  const { 
    loadUserPrograms, 
    currentProgram, 
    availablePrograms, 
    setCurrentProgram, 
    getDefaultProgram 
  } = useProgramContext();

  // Use a defensive approach to access auth context
  let authData = { user: null, isAuthenticated: false };
  
  try {
    const { user, isAuthenticated } = useAuth();
    authData = { user, isAuthenticated };
  } catch (error) {
    // Auth context not available - this is normal during SSR or on auth pages
    // Don't log this as it's expected behavior
    authData = { user: null, isAuthenticated: false };
  }

  useEffect(() => {
    if (authData.isAuthenticated && authData.user?.id) {
      console.log('Loading programs for user:', authData.user.id);
      // Load user's programs when authenticated
      loadUserPrograms(authData.user.id);
    }
    // Don't log when user is not authenticated - this is normal on public pages
  }, [authData.isAuthenticated, authData.user?.id, loadUserPrograms]);

  useEffect(() => {
    // Auto-select default program if none is selected and programs are available
    if (availablePrograms.length > 0 && !currentProgram) {
      const defaultProgram = getDefaultProgram();
      if (defaultProgram) {
        setCurrentProgram(defaultProgram);
      }
    }
  }, [availablePrograms, currentProgram, getDefaultProgram, setCurrentProgram]);

  return {
    isInitialized: authData.isAuthenticated && availablePrograms.length > 0,
    currentProgram,
    availablePrograms,
  };
};

/**
 * Program Context Provider Component
 * 
 * Simple wrapper that doesn't auto-initialize to avoid provider dependency issues
 */
export const ProgramContextProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Don't auto-initialize here to avoid circular provider dependencies
  // Components that need program context should explicitly initialize it
  return <>{children}</>;
};

/**
 * Program Context Guard Hook
 * 
 * Hook to ensure program context is available before rendering program-dependent components
 */
export const useProgramContextGuard = () => {
  const { currentProgram, availablePrograms, isLoadingPrograms } = useProgramContext();
  
  const isReady = !isLoadingPrograms && availablePrograms.length > 0;
  const hasProgram = currentProgram !== null;
  
  // Debug logging for program context guard
  console.log('ProgramContextGuard state:', {
    isLoadingPrograms,
    availableProgramsCount: availablePrograms.length,
    isReady,
    hasProgram,
    currentProgram: currentProgram?.id || null
  });
  
  return {
    isReady,
    hasProgram,
    needsProgramSelection: isReady && !hasProgram,
    currentProgram,
    availablePrograms,
  };
};