/**
 * Program Context Store - Global state management for program switching
 * 
 * This store manages the current program context across the application,
 * allowing users to switch between programs they have access to.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ProgramContextState, Program, UserProgramAssignment, ProgramContextStorage } from './types';

// API imports (temporary implementation until APIs are set up)
import { programsApi } from '@/features/programs/api';
import { userProgramAssignmentsApi } from '@/features/authentication/api/userProgramAssignments';

/**
 * Program Context Store
 * 
 * Manages global program state including:
 * - Current active program
 * - Available programs for the user
 * - Program switching functionality
 * - Program access validation
 */
export const useProgramContext = create<ProgramContextState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentProgram: null,
        availablePrograms: [],
        userProgramAssignments: [],
        isLoading: false,
        isLoadingPrograms: false,
        isSwitchingProgram: false,
        error: null,

        // Actions
        setCurrentProgram: (program: Program | null) => {
          set({ 
            currentProgram: program,
            error: null
          });
        },

        switchProgram: async (programId: string) => {
          const state = get();
          
          // Check if user has access to this program
          if (!state.hasProgramAccess(programId)) {
            set({ error: 'You do not have access to this program' });
            return;
          }

          // Find the program
          const program = state.availablePrograms.find(p => p.id === programId);
          if (!program) {
            set({ error: 'Program not found' });
            return;
          }

          // Check if program is active
          if (!program.isActive) {
            set({ error: 'This program is not currently active' });
            return;
          }

          set({ isSwitchingProgram: true, error: null });

          try {
            // Here you could add an API call to track program switches
            // await programsApi.trackProgramSwitch(programId);
            
            // Update current program
            set({ 
              currentProgram: program,
              isSwitchingProgram: false
            });

            // Optionally, trigger a refresh of program-specific data
            // This would be handled by individual feature stores
            
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to switch program',
              isSwitchingProgram: false
            });
          }
        },

        loadUserPrograms: async (userId: string) => {
          set({ isLoadingPrograms: true, error: null });

          try {
            // Load user's program assignments
            const assignments = await userProgramAssignmentsApi.getUserProgramAssignments(userId);
            
            // Extract programs from assignments
            const programs = assignments.map(assignment => assignment.program);
            
            // Set available programs and assignments
            set({ 
              availablePrograms: programs,
              userProgramAssignments: assignments,
              isLoadingPrograms: false
            });

            // Auto-set default program if none is selected
            const currentProgram = get().currentProgram;
            if (!currentProgram && programs.length > 0) {
              const defaultProgram = get().getDefaultProgram();
              if (defaultProgram) {
                get().setCurrentProgram(defaultProgram);
              }
            }

          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load programs',
              isLoadingPrograms: false
            });
          }
        },

        refreshPrograms: async () => {
          const state = get();
          if (!state.userProgramAssignments.length) return;

          set({ isLoading: true, error: null });

          try {
            // Refresh program data
            const programIds = state.userProgramAssignments.map(a => a.programId);
            const updatedPrograms = await programsApi.getProgramsByIds(programIds);
            
            // Update available programs
            set({ 
              availablePrograms: updatedPrograms,
              isLoading: false
            });

            // Update current program if it was refreshed
            const currentProgram = get().currentProgram;
            if (currentProgram) {
              const updatedCurrentProgram = updatedPrograms.find(p => p.id === currentProgram.id);
              if (updatedCurrentProgram) {
                set({ currentProgram: updatedCurrentProgram });
              }
            }

          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to refresh programs',
              isLoading: false
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        // Computed getters
        getDefaultProgram: () => {
          const state = get();
          const defaultAssignment = state.userProgramAssignments.find(a => a.isDefault);
          return defaultAssignment?.program || state.availablePrograms[0] || null;
        },

        hasProgramAccess: (programId: string) => {
          const state = get();
          return state.userProgramAssignments.some(a => a.programId === programId);
        },

        isProgramActive: (programId: string) => {
          const state = get();
          const program = state.availablePrograms.find(p => p.id === programId);
          return program?.isActive || false;
        },
      }),
      {
        name: 'program-context-storage',
        partialize: (state): ProgramContextStorage => ({
          currentProgramId: state.currentProgram?.id || null,
          lastSwitchTimestamp: Date.now(),
        }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as ProgramContextStorage;
          return {
            ...currentState,
            // We'll restore the current program after programs are loaded
            // This is handled in the initialization logic
          };
        },
      }
    ),
    {
      name: 'program-context-store',
    }
  )
);

/**
 * Program Context Selectors
 * 
 * Optimized selectors for specific state slices to prevent unnecessary re-renders
 */
export const useProgramContextSelectors = {
  currentProgram: () => useProgramContext(state => state.currentProgram),
  availablePrograms: () => useProgramContext(state => state.availablePrograms),
  isLoading: () => useProgramContext(state => state.isLoading || state.isLoadingPrograms || state.isSwitchingProgram),
  error: () => useProgramContext(state => state.error),
  switchProgram: () => useProgramContext(state => state.switchProgram),
  loadUserPrograms: () => useProgramContext(state => state.loadUserPrograms),
  refreshPrograms: () => useProgramContext(state => state.refreshPrograms),
  clearError: () => useProgramContext(state => state.clearError),
  getDefaultProgram: () => useProgramContext(state => state.getDefaultProgram()),
  hasProgramAccess: (programId: string) => useProgramContext(state => state.hasProgramAccess(programId)),
  isProgramActive: (programId: string) => useProgramContext(state => state.isProgramActive(programId)),
};

/**
 * Program Context Hooks
 * 
 * Convenience hooks for common program context operations
 */
export const useProgramContextHooks = () => {
  const {
    currentProgram,
    availablePrograms,
    switchProgram,
    loadUserPrograms,
    refreshPrograms,
    clearError,
    error,
    isLoading,
    isSwitchingProgram,
  } = useProgramContext();

  return {
    // State
    currentProgram,
    availablePrograms,
    error,
    isLoading,
    isSwitchingProgram,
    
    // Actions
    switchProgram,
    loadUserPrograms,
    refreshPrograms,
    clearError,
    
    // Computed
    hasPrograms: availablePrograms.length > 0,
    canSwitchPrograms: availablePrograms.length > 1,
    currentProgramName: currentProgram?.name || 'No Program Selected',
    currentProgramCode: currentProgram?.code || null,
  };
};