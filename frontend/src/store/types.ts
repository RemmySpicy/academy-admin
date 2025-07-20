/**
 * Store type definitions for global state management
 */

// Program context types
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

// Program context state
export interface ProgramContextState {
  // Current program state
  currentProgram: Program | null;
  availablePrograms: Program[];
  userProgramAssignments: UserProgramAssignment[];
  
  // Loading states
  isLoading: boolean;
  isLoadingPrograms: boolean;
  isSwitchingProgram: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  setCurrentProgram: (program: Program | null) => void;
  switchProgram: (programId: string) => Promise<void>;
  loadUserPrograms: (userId: string) => Promise<void>;
  refreshPrograms: () => Promise<void>;
  clearError: () => void;
  
  // Computed getters
  getDefaultProgram: () => Program | null;
  hasProgramAccess: (programId: string) => boolean;
  isProgramActive: (programId: string) => boolean;
}

// Store persistence
export interface ProgramContextStorage {
  currentProgramId: string | null;
  lastSwitchTimestamp: number;
}