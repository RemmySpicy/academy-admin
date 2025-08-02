import { useState, useEffect, useCallback } from 'react';
import { Program, ProgramContextValue } from '../types';
import apiClient from '../services/apiClient';

export default function useProgramContext(): ProgramContextValue {
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize program context
  useEffect(() => {
    initializeProgramContext();
  }, []);

  const initializeProgramContext = async () => {
    try {
      setIsLoading(true);
      
      // Get available programs for current user
      const programsResponse = await apiClient.get<Program[]>('/programs/my-programs');
      const programs = programsResponse.data;
      setAvailablePrograms(programs);

      // Get stored program context
      const storedProgramId = await apiClient.getProgramContext();
      
      if (storedProgramId && programs.length > 0) {
        const storedProgram = programs.find(p => p.id === storedProgramId);
        if (storedProgram) {
          setCurrentProgram(storedProgram);
        } else {
          // Stored program not available, use first available
          const firstProgram = programs[0];
          setCurrentProgram(firstProgram);
          await apiClient.setProgramContext(firstProgram.id);
        }
      } else if (programs.length > 0) {
        // No stored program, use first available
        const firstProgram = programs[0];
        setCurrentProgram(firstProgram);
        await apiClient.setProgramContext(firstProgram.id);
      }
    } catch (error) {
      console.error('Failed to initialize program context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchProgram = useCallback(async (programId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const program = availablePrograms.find(p => p.id === programId);
      if (!program) {
        throw new Error('Program not found in available programs');
      }

      setCurrentProgram(program);
      await apiClient.setProgramContext(programId);
    } catch (error) {
      console.error('Failed to switch program:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [availablePrograms]);

  const refreshPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      const programsResponse = await apiClient.get<Program[]>('/programs/my-programs');
      setAvailablePrograms(programsResponse.data);
    } catch (error) {
      console.error('Failed to refresh programs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentProgram,
    availablePrograms,
    switchProgram,
    isLoading,
    refreshPrograms,
  } as ProgramContextValue & { refreshPrograms: () => Promise<void> };
}