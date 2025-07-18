/**
 * Safe Program Switching Hook
 * 
 * This hook provides program switching functionality with safeguards for unsaved data.
 * It ensures users are prompted before losing unsaved changes when switching programs.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useProgramContext } from '@/store';
import { useUnsavedChangesContext } from './useUnsavedChanges';

export interface SafeProgramSwitchResult {
  switchProgram: (programId: string) => Promise<boolean>;
  isSwitching: boolean;
  canSwitch: boolean;
  lastSwitchError: string | null;
}

/**
 * Hook that provides safe program switching with unsaved changes protection
 */
export function useSafeProgramSwitch(): SafeProgramSwitchResult {
  const { switchProgram: originalSwitchProgram, isSwitchingProgram } = useProgramContext();
  const { hasUnsavedChanges, handleProgramSwitch } = useUnsavedChangesContext();
  const [lastSwitchError, setLastSwitchError] = useState<string | null>(null);

  const safeSwitchProgram = useCallback(async (programId: string): Promise<boolean> => {
    setLastSwitchError(null);

    try {
      // Use the unsaved changes context to handle the switch
      const switchSuccess = await handleProgramSwitch(programId, async () => {
        await originalSwitchProgram(programId);
      });

      return switchSuccess;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch program';
      setLastSwitchError(errorMessage);
      return false;
    }
  }, [handleProgramSwitch, originalSwitchProgram]);

  return {
    switchProgram: safeSwitchProgram,
    isSwitching: isSwitchingProgram,
    canSwitch: !hasUnsavedChanges,
    lastSwitchError,
  };
}

/**
 * Enhanced dialog for unsaved changes with better UX
 */
export async function showProgramSwitchDialog(
  unsavedForms: string[],
  currentProgramName: string,
  targetProgramName: string
): Promise<'save' | 'discard' | 'cancel'> {
  // This is a placeholder implementation using browser confirm
  // In a real app, you'd use a proper dialog component
  
  const formsText = unsavedForms.length > 1 
    ? `${unsavedForms.length} forms have unsaved changes`
    : `The ${unsavedForms[0] || 'current form'} has unsaved changes`;

  const message = `${formsText} in ${currentProgramName}.\n\nSwitching to ${targetProgramName} will discard these changes.\n\nWhat would you like to do?`;

  // Simple implementation - in practice you'd use a proper dialog with buttons
  const result = window.confirm(`${message}\n\nClick OK to discard changes, Cancel to stay.`);
  
  return result ? 'discard' : 'cancel';
}

/**
 * Program context persistence utilities
 */
export interface ProgramContextMemory {
  lastProgramId: string | null;
  timestamp: number;
}

const PROGRAM_MEMORY_KEY = 'academy_admin_last_program_context';

/**
 * Save the last program context to localStorage
 */
export function rememberProgramContext(programId: string): void {
  try {
    const memory: ProgramContextMemory = {
      lastProgramId: programId,
      timestamp: Date.now(),
    };
    localStorage.setItem(PROGRAM_MEMORY_KEY, JSON.stringify(memory));
  } catch (error) {
    console.warn('Failed to save program context memory:', error);
  }
}

/**
 * Retrieve the last program context from localStorage
 */
export function getRememberedProgramContext(): string | null {
  try {
    const stored = localStorage.getItem(PROGRAM_MEMORY_KEY);
    if (!stored) return null;

    const memory: ProgramContextMemory = JSON.parse(stored);
    
    // Only return if it was saved within the last 7 days
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (Date.now() - memory.timestamp > maxAge) {
      localStorage.removeItem(PROGRAM_MEMORY_KEY);
      return null;
    }

    return memory.lastProgramId;
  } catch (error) {
    console.warn('Failed to retrieve program context memory:', error);
    return null;
  }
}

/**
 * Clear the remembered program context
 */
export function clearProgramContextMemory(): void {
  try {
    localStorage.removeItem(PROGRAM_MEMORY_KEY);
  } catch (error) {
    console.warn('Failed to clear program context memory:', error);
  }
}

/**
 * Hook to automatically remember program context changes
 */
export function useProgramContextMemory() {
  const { currentProgram } = useProgramContext();

  // Remember the current program whenever it changes
  useEffect(() => {
    if (currentProgram?.id) {
      rememberProgramContext(currentProgram.id);
    }
  }, [currentProgram?.id]);

  return {
    rememberProgramContext,
    getRememberedProgramContext,
    clearProgramContextMemory,
  };
}