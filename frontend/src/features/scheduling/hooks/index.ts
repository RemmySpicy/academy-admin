/**
 * Scheduling hooks for session management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingApi } from '../api';
import type { SessionSearchParams, SessionCreate, SessionUpdate } from '../types';

// Hook for fetching facility sessions
export function useFacilitySessions(
  facilityId: string | null,
  params?: SessionSearchParams & { skip?: number; limit?: number }
) {
  return useQuery({
    queryKey: ['facility-sessions', facilityId, params],
    queryFn: () => {
      if (!facilityId) return null;
      return schedulingApi.getFacilitySessions(facilityId, params);
    },
    enabled: !!facilityId,
  });
}

// Hook for creating sessions
export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionData: SessionCreate) => schedulingApi.createSession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-sessions'] });
    },
  });
}

// Hook for updating sessions
export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: SessionUpdate }) =>
      schedulingApi.updateSession(sessionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-sessions'] });
    },
  });
}

// Hook for cancelling sessions
export function useCancelSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, reason, cancelAll }: { 
      sessionId: string; 
      reason: string; 
      cancelAll: boolean; 
    }) => schedulingApi.cancelSession(sessionId, reason, cancelAll),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-sessions'] });
    },
  });
}

// Hook for managing participants
export function useSessionParticipants() {
  const queryClient = useQueryClient();
  
  const addParticipants = useMutation({
    mutationFn: ({ sessionId, studentIds }: { sessionId: string; studentIds: string[] }) =>
      schedulingApi.addParticipants(sessionId, studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-sessions'] });
    },
  });

  const removeParticipants = useMutation({
    mutationFn: ({ sessionId, studentIds, reason }: { 
      sessionId: string; 
      studentIds: string[]; 
      reason?: string; 
    }) => schedulingApi.removeParticipants(sessionId, studentIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-sessions'] });
    },
  });

  return { addParticipants, removeParticipants };
}

// Hook for managing instructors
export function useSessionInstructors() {
  const queryClient = useQueryClient();
  
  const addInstructors = useMutation({
    mutationFn: ({ sessionId, instructorIds }: { sessionId: string; instructorIds: string[] }) =>
      schedulingApi.addInstructors(sessionId, instructorIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-sessions'] });
    },
  });

  const removeInstructors = useMutation({
    mutationFn: ({ sessionId, instructorIds, reason }: { 
      sessionId: string; 
      instructorIds: string[]; 
      reason?: string; 
    }) => schedulingApi.removeInstructors(sessionId, instructorIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-sessions'] });
    },
  });

  return { addInstructors, removeInstructors };
}