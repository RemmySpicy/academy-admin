/**
 * Hook for tracking unsaved changes and preventing data loss
 * 
 * This hook provides functionality to:
 * - Track when forms have unsaved changes
 * - Warn users before navigation/program switching
 * - Provide save/discard options
 */

import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

export interface UnsavedChangesState {
  hasChanges: boolean;
  formName?: string;
  changeCount: number;
}

export interface UnsavedChangesActions {
  markDirty: (formName?: string) => void;
  markClean: (formName?: string) => void;
  reset: () => void;
  getUnsavedForms: () => string[];
}

/**
 * Hook to track unsaved changes across forms
 */
export function useUnsavedChanges(): UnsavedChangesState & UnsavedChangesActions {
  const [unsavedForms, setUnsavedForms] = useState<Set<string>>(new Set());
  const [changeCount, setChangeCount] = useState(0);
  const router = useRouter();

  const markDirty = useCallback((formName: string = 'default') => {
    setUnsavedForms(prev => {
      const newSet = new Set(prev);
      newSet.add(formName);
      return newSet;
    });
    setChangeCount(prev => prev + 1);
  }, []);

  const markClean = useCallback((formName: string = 'default') => {
    setUnsavedForms(prev => {
      const newSet = new Set(prev);
      newSet.delete(formName);
      return newSet;
    });
  }, []);

  const reset = useCallback(() => {
    setUnsavedForms(new Set());
    setChangeCount(0);
  }, []);

  const getUnsavedForms = useCallback(() => {
    return Array.from(unsavedForms);
  }, [unsavedForms]);

  const hasChanges = unsavedForms.size > 0;

  // Warn before page navigation
  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  return {
    hasChanges,
    formName: unsavedForms.size === 1 ? Array.from(unsavedForms)[0] : undefined,
    changeCount,
    markDirty,
    markClean,
    reset,
    getUnsavedForms,
  };
}

/**
 * Hook to track changes in a specific form
 */
export function useFormUnsavedChanges(formName: string) {
  const { markDirty, markClean, hasChanges, getUnsavedForms } = useUnsavedChanges();
  
  const hasFormChanges = getUnsavedForms().includes(formName);

  const setFormDirty = useCallback(() => {
    markDirty(formName);
  }, [markDirty, formName]);

  const setFormClean = useCallback(() => {
    markClean(formName);
  }, [markClean, formName]);

  return {
    hasChanges: hasFormChanges,
    hasAnyChanges: hasChanges,
    setDirty: setFormDirty,
    setClean: setFormClean,
  };
}

/**
 * Context for managing unsaved changes globally
 */

interface UnsavedChangesContextValue {
  hasUnsavedChanges: boolean;
  unsavedForms: string[];
  markFormDirty: (formName: string) => void;
  markFormClean: (formName: string) => void;
  clearAllChanges: () => void;
  
  // Program switching safeguards
  canSwitchProgram: () => boolean;
  handleProgramSwitch: (newProgramId: string, switchFn: () => Promise<void>) => Promise<boolean>;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

/**
 * Provider component for unsaved changes context
 */
export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const unsavedState = useUnsavedChanges();

  const canSwitchProgram = useCallback(() => {
    return !unsavedState.hasChanges;
  }, [unsavedState.hasChanges]);

  const handleProgramSwitch = useCallback(async (
    newProgramId: string, 
    switchFn: () => Promise<void>
  ): Promise<boolean> => {
    if (!unsavedState.hasChanges) {
      await switchFn();
      return true;
    }

    // Show confirmation dialog (implementation will depend on your dialog system)
    const shouldSwitch = await showUnsavedChangesDialog(unsavedState.getUnsavedForms());
    
    if (shouldSwitch) {
      unsavedState.reset(); // Clear unsaved changes
      await switchFn();
      return true;
    }

    return false; // User chose to stay
  }, [unsavedState]);

  const contextValue: UnsavedChangesContextValue = {
    hasUnsavedChanges: unsavedState.hasChanges,
    unsavedForms: unsavedState.getUnsavedForms(),
    markFormDirty: unsavedState.markDirty,
    markFormClean: unsavedState.markClean,
    clearAllChanges: unsavedState.reset,
    canSwitchProgram,
    handleProgramSwitch,
  };

  return (
    <UnsavedChangesContext.Provider value={contextValue}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

/**
 * Hook to use the unsaved changes context
 */
export function useUnsavedChangesContext() {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChangesContext must be used within UnsavedChangesProvider');
  }
  return context;
}

/**
 * Show dialog for unsaved changes (to be implemented with your dialog system)
 */
async function showUnsavedChangesDialog(unsavedForms: string[]): Promise<boolean> {
  // This is a placeholder - you'll need to implement this with your actual dialog system
  const formsText = unsavedForms.length > 1 
    ? `${unsavedForms.length} forms have unsaved changes`
    : `The ${unsavedForms[0]} form has unsaved changes`;

  return window.confirm(
    `${formsText}. Switching programs will discard these changes. Are you sure you want to continue?`
  );
}