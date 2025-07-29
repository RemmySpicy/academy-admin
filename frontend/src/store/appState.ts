/**
 * Unified App State Management
 * 
 * Production-ready state management that combines authentication and program context
 * into a single, consistent state store with proper error handling and loading states.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authApiService } from '@/features/authentication/api/authApiService';
import { programsApi } from '@/features/programs/api';
import { httpClient, API_ENDPOINTS } from '@/lib/api/httpClient';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface Program {
  id: string;
  name: string;
  program_code: string;
  description?: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  display_order?: number;
  isActive: boolean;
}

export interface UserProgramAssignment {
  id: string;
  userId: string;
  programId: string;
  isDefault: boolean;
  assignedAt: string;
  assignedBy?: string;
  program: Program;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Unified App State Interface
export interface AppState {
  // Authentication State
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  };
  
  // Program Context State
  programs: {
    current: Program | null;
    available: Program[];
    assignments: UserProgramAssignment[];
    isLoading: boolean;
    isSwitching: boolean;
    error: string | null;
  };
  
  // Application State
  app: {
    isInitialized: boolean;
    isReady: boolean; // Auth complete AND programs loaded
    initializationError: string | null;
  };
  
  // Actions
  actions: {
    // Authentication Actions
    login: (credentials: LoginCredentials) => Promise<User>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearAuthError: () => void;
    
    // Program Actions
    switchProgram: (programId: string) => Promise<void>;
    refreshPrograms: () => Promise<void>;
    clearProgramError: () => void;
    
    // App Actions
    initialize: () => Promise<void>;
    reset: () => void;
  };
  
  // Computed Properties
  computed: {
    hasPrograms: boolean;
    canSwitchPrograms: boolean;
    needsProgramSelection: boolean;
    isLoading: boolean;
    hasErrors: boolean;
    defaultProgram: Program | null;
  };
}

// Storage interface for persistence
interface AppStateStorage {
  currentProgramId: string | null;
  lastLoginTimestamp: number;
}

/**
 * Internal helper for loading user programs (defined outside store to avoid circular references)
 */
const loadUserProgramsInternal = async (userId: string, store: any) => {
  const state = store.getState();
  store.setState({
    programs: { ...state.programs, isLoading: true, error: null }
  });
  
  try {
    console.log('AppState: Loading programs for user:', userId);
    
    // Get user's programs from backend - no fallbacks, fail fast if API fails
    const response = await httpClient.get(API_ENDPOINTS.programs.list);
    if (!response.success) {
      throw new Error(response.error || 'Failed to load programs from server');
    }
    
    if (!response.data?.items || !Array.isArray(response.data.items)) {
      throw new Error('Invalid programs data received from server');
    }
    
    // Convert to assignments format
    const assignments: UserProgramAssignment[] = response.data.items.map((program: any, index: number) => ({
      id: `assignment-${program.id}`,
      userId: userId,
      programId: program.id,
      isDefault: index === 0,
      assignedAt: new Date().toISOString(),
      assignedBy: 'system',
      program: {
        id: program.id,
        name: program.name,
        program_code: program.program_code,
        description: program.description,
        category: program.category,
        status: program.status,
        display_order: program.display_order,
        isActive: program.status === 'active',
      }
    }));
    
    const programs = assignments.map(a => a.program);
    
    console.log('AppState: Successfully loaded programs:', programs.length);
    
    // Update state
    const currentState = store.getState();
    store.setState({
      programs: {
        ...currentState.programs,
        available: programs,
        assignments,
        isLoading: false,
      }
    });
    
    // Auto-select default program if none selected
    if (!currentState.programs.current && programs.length > 0) {
      const defaultProgram = assignments.find(a => a.isDefault)?.program || programs[0];
      console.log('AppState: Auto-selecting default program:', defaultProgram.name);
      
      store.setState({
        programs: {
          ...store.getState().programs,
          current: defaultProgram,
        }
      });
      
      // Update HTTP client with program context
      httpClient.setProgramContext(defaultProgram.id);
      
      // Set bypass filter for super admin
      const user = store.getState().auth.user;
      if (user?.role === 'super_admin') {
        httpClient.setBypassProgramFilter(true);
      }
    }
    
  } catch (error) {
    console.error('AppState: Failed to load programs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load programs';
    
    store.setState({
      programs: {
        ...state.programs,
        isLoading: false,
        error: errorMessage,
        available: [], // Clear any stale data
        assignments: [],
      }
    });
    
    throw error;
  }
};

/**
 * Production-ready App State Store
 */
export const useAppState = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
        
        programs: {
          current: null,
          available: [],
          assignments: [],
          isLoading: false,
          isSwitching: false,
          error: null,
        },
        
        app: {
          isInitialized: false,
          isReady: false,
          initializationError: null,
        },
        
        // Actions
        actions: {
          // Authentication Actions
          login: async (credentials: LoginCredentials) => {
            const state = get();
            set({
              auth: { ...state.auth, isLoading: true, error: null },
              app: { ...state.app, initializationError: null }
            });
            
            try {
              console.log('AppState: Starting login process...');
              const response = await authApiService.login(credentials.username, credentials.password);
              
              if (!response.success || !response.data?.user) {
                throw new Error(response.error || 'Login failed');
              }
              
              const user = response.data.user;
              console.log('AppState: Login successful, setting user:', user.id);
              
              // Update auth state
              set({
                auth: {
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                }
              });
              
              // Load user programs immediately after auth
              console.log('AppState: Loading user programs...');
              await loadUserProgramsInternal(user.id, { getState: get, setState: set });
              
              // Mark app as ready
              const currentState = get();
              set({
                app: {
                  ...currentState.app,
                  isInitialized: true,
                  isReady: true,
                  initializationError: null,
                }
              });
              
              console.log('AppState: Login and initialization complete');
              return user;
              
            } catch (error) {
              console.error('AppState: Login failed:', error);
              const errorMessage = error instanceof Error ? error.message : 'Login failed';
              
              set({
                auth: {
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  error: errorMessage,
                },
                app: {
                  isInitialized: false,
                  isReady: false,
                  initializationError: errorMessage,
                }
              });
              
              throw error;
            }
          },
          
          logout: async () => {
            console.log('AppState: Starting logout process...');
            const state = get();
            set({
              auth: { ...state.auth, isLoading: true }
            });
            
            try {
              // Call logout API (optional, don't throw on failure)
              await authApiService.logout();
            } catch (error) {
              console.warn('AppState: Logout API call failed:', error);
            } finally {
              // Always clear local state
              authApiService.clearAuth();
              httpClient.setProgramContext(null);
              httpClient.setBypassProgramFilter(false);
              
              // Reset entire app state
              get().actions.reset();
              
              console.log('AppState: Logout complete, reloading page...');
              window.location.reload();
            }
          },
          
          refreshUser: async () => {
            const state = get();
            if (!state.auth.isAuthenticated) return;
            
            set({
              auth: { ...state.auth, isLoading: true, error: null }
            });
            
            try {
              const response = await authApiService.getCurrentUser();
              if (response.success && response.data) {
                set({
                  auth: {
                    ...state.auth,
                    user: response.data,
                    isLoading: false,
                  }
                });
              } else {
                throw new Error(response.error || 'Failed to refresh user');
              }
            } catch (error) {
              console.error('AppState: User refresh failed:', error);
              // If refresh fails, logout user
              await get().actions.logout();
            }
          },
          
          clearAuthError: () => {
            const state = get();
            set({
              auth: { ...state.auth, error: null }
            });
          },
          
          // Program Actions
          switchProgram: async (programId: string) => {
            const state = get();
            
            // Validate program access
            const assignment = state.programs.assignments.find(a => a.programId === programId);
            if (!assignment) {
              throw new Error('You do not have access to this program');
            }
            
            if (!assignment.program.isActive) {
              throw new Error('This program is not currently active');
            }
            
            set({
              programs: { ...state.programs, isSwitching: true, error: null }
            });
            
            try {
              console.log('AppState: Switching to program:', programId);
              
              // Update current program
              set({
                programs: {
                  ...state.programs,
                  current: assignment.program,
                  isSwitching: false,
                }
              });
              
              // Update HTTP client
              httpClient.setProgramContext(programId);
              
              console.log('AppState: Program switch complete');
              
            } catch (error) {
              console.error('AppState: Program switch failed:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to switch program';
              
              set({
                programs: {
                  ...state.programs,
                  isSwitching: false,
                  error: errorMessage,
                }
              });
              
              throw error;
            }
          },
          
          refreshPrograms: async () => {
            const state = get();
            if (!state.auth.user) return;
            
            await loadUserProgramsInternal(state.auth.user.id, { getState: get, setState: set });
          },
          
          clearProgramError: () => {
            const state = get();
            set({
              programs: { ...state.programs, error: null }
            });
          },
          
          // App Actions
          initialize: async () => {
            console.log('AppState: Starting app initialization...');
            const state = get();
            
            if (state.app.isInitialized) {
              console.log('AppState: Already initialized');
              return;
            }
            
            set({
              app: { ...state.app, initializationError: null }
            });
            
            try {
              // Initialize auth from storage
              const storedUser = authApiService.initializeAuth();
              if (storedUser && authApiService.isAuthenticated()) {
                console.log('AppState: Found stored user, verifying with server...');
                
                set({
                  auth: {
                    user: storedUser,
                    isAuthenticated: true,
                    isLoading: true,
                    error: null,
                  }
                });
                
                // Verify with server
                const response = await authApiService.getCurrentUser();
                if (response.success && response.data) {
                  console.log('AppState: Server verification successful');
                  const user = response.data;
                  
                  set({
                    auth: {
                      user,
                      isAuthenticated: true,
                      isLoading: false,
                      error: null,
                    }
                  });
                  
                  // Load user programs
                  await loadUserProgramsInternal(user.id, { getState: get, setState: set });
                  
                  set({
                    app: {
                      isInitialized: true,
                      isReady: true,
                      initializationError: null,
                    }
                  });
                  
                } else {
                  console.log('AppState: Server verification failed, clearing auth');
                  authApiService.clearAuth();
                  get().actions.reset();
                }
              } else {
                console.log('AppState: No stored user found');
                set({
                  app: {
                    isInitialized: true,
                    isReady: false,
                    initializationError: null,
                  }
                });
              }
              
            } catch (error) {
              console.error('AppState: Initialization failed:', error);
              const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
              
              authApiService.clearAuth();
              set({
                auth: {
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  error: errorMessage,
                },
                app: {
                  isInitialized: true,
                  isReady: false,
                  initializationError: errorMessage,
                }
              });
            }
          },
          
          reset: () => {
            console.log('AppState: Resetting all state...');
            set({
              auth: {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              },
              programs: {
                current: null,
                available: [],
                assignments: [],
                isLoading: false,
                isSwitching: false,
                error: null,
              },
              app: {
                isInitialized: false,
                isReady: false,
                initializationError: null,
              }
            });
          },
          
        },
        
        // Computed Properties
        computed: {
          get hasPrograms() {
            return get().programs.available.length > 0;
          },
          
          get canSwitchPrograms() {
            return get().programs.available.length > 1;
          },
          
          get needsProgramSelection() {
            const state = get();
            return state.auth.isAuthenticated && 
                   !state.programs.isLoading && 
                   state.programs.available.length > 0 && 
                   !state.programs.current;
          },
          
          get isLoading() {
            const state = get();
            return state.auth.isLoading || state.programs.isLoading || state.programs.isSwitching;
          },
          
          get hasErrors() {
            const state = get();
            return !!(state.auth.error || state.programs.error || state.app.initializationError);
          },
          
          get defaultProgram() {
            const state = get();
            const defaultAssignment = state.programs.assignments.find(a => a.isDefault);
            return defaultAssignment?.program || state.programs.available[0] || null;
          },
        },
      }),
      {
        name: 'app-state-storage',
        partialize: (state): AppStateStorage => ({
          currentProgramId: state.programs.current?.id || null,
          lastLoginTimestamp: Date.now(),
        }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as AppStateStorage;
          return {
            ...currentState,
            // Program will be restored after initialization
          };
        },
      }
    ),
    {
      name: 'app-state-store',
    }
  )
);

// Selector hooks for optimized re-renders
export const useAppStateSelectors = {
  // Auth selectors
  user: () => useAppState(state => state.auth.user),
  isAuthenticated: () => useAppState(state => state.auth.isAuthenticated),
  authLoading: () => useAppState(state => state.auth.isLoading),
  authError: () => useAppState(state => state.auth.error),
  
  // Program selectors
  currentProgram: () => useAppState(state => state.programs.current),
  availablePrograms: () => useAppState(state => state.programs.available),
  programsLoading: () => useAppState(state => state.programs.isLoading),
  programError: () => useAppState(state => state.programs.error),
  
  // App selectors
  isReady: () => useAppState(state => state.app.isReady),
  isInitialized: () => useAppState(state => state.app.isInitialized),
  
  // Computed selectors
  hasPrograms: () => useAppState(state => state.computed.hasPrograms),
  needsProgramSelection: () => useAppState(state => state.computed.needsProgramSelection),
  isLoading: () => useAppState(state => state.computed.isLoading),
  
  // Actions
  actions: () => useAppState(state => state.actions),
};