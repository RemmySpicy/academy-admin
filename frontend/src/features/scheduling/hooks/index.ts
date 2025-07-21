/**
 * Scheduling hooks with program context integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgramContext } from '@/store/programContext';
import { schedulingApi } from '../api';
import type {
  SessionSearchParams,
  SessionCreate,
  SessionUpdate,
  SessionStats,
  SessionParticipant,
  InstructorAvailability,
  FacilityScheduleSettings,
} from '../types';

// Query keys
export const SCHEDULING_QUERY_KEYS = {
  all: ['scheduling'] as const,
  sessions: () => [...SCHEDULING_QUERY_KEYS.all, 'sessions'] as const,
  facilitySessions: (facilityId: string) => [...SCHEDULING_QUERY_KEYS.sessions(), 'facility', facilityId] as const,
  session: (sessionId: string) => [...SCHEDULING_QUERY_KEYS.sessions(), sessionId] as const,
  sessionParticipants: (sessionId: string) => [...SCHEDULING_QUERY_KEYS.session(sessionId), 'participants'] as const,
  stats: () => [...SCHEDULING_QUERY_KEYS.all, 'stats'] as const,
  instructorAvailability: (instructorId: string) => [...SCHEDULING_QUERY_KEYS.all, 'instructor', instructorId, 'availability'] as const,
  facilitySettings: (facilityId: string) => [...SCHEDULING_QUERY_KEYS.all, 'facility', facilityId, 'settings'] as const,
};

/**
 * Hook to fetch sessions for a specific facility with program context
 */
export function useFacilitySessions(
  facilityId: string | null,
  params?: SessionSearchParams & { skip?: number; limit?: number }
) {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: [...SCHEDULING_QUERY_KEYS.facilitySessions(facilityId || 'none'), currentProgram?.id, params],
    queryFn: async () => {
      if (!facilityId) return null;
      const response = await schedulingApi.getFacilitySessions(facilityId, params);
      return response;
    },
    enabled: !!currentProgram && !!facilityId,
    staleTime: 2 * 60 * 1000, // 2 minutes (schedules change frequently)
  });
}

/**
 * Hook to fetch a specific session
 */
export function useSession(sessionId: string) {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: [...SCHEDULING_QUERY_KEYS.session(sessionId), currentProgram?.id],
    queryFn: async () => {
      const response = await schedulingApi.getSession(sessionId);
      return response;
    },
    enabled: !!currentProgram && !!sessionId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch session participants
 */
export function useSessionParticipants(sessionId: string) {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: [...SCHEDULING_QUERY_KEYS.sessionParticipants(sessionId), currentProgram?.id],
    queryFn: async () => {
      const response = await schedulingApi.getSessionParticipants(sessionId);
      return response;
    },
    enabled: !!currentProgram && !!sessionId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch session statistics
 */
export function useSessionStats(facilityId?: string) {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: [...SCHEDULING_QUERY_KEYS.stats(), currentProgram?.id, facilityId],
    queryFn: async () => {
      const response = await schedulingApi.getSessionStats(facilityId);
      return response;
    },
    enabled: !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: SessionCreate) => {
      const response = await schedulingApi.createSession(sessionData);
      return response;
    },
    onSuccess: (session) => {
      // Invalidate facility sessions to refresh the schedule
      if (session.facility_id) {
        queryClient.invalidateQueries({
          queryKey: SCHEDULING_QUERY_KEYS.facilitySessions(session.facility_id),
        });
      }
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: SCHEDULING_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to update session information
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sessionId: string; updates: SessionUpdate }) => {
      const response = await schedulingApi.updateSession(data.sessionId, data.updates);
      return response;
    },
    onSuccess: (session) => {
      // Invalidate specific session and facility sessions
      queryClient.invalidateQueries({
        queryKey: SCHEDULING_QUERY_KEYS.session(session.id),
      });
      if (session.facility_id) {
        queryClient.invalidateQueries({
          queryKey: SCHEDULING_QUERY_KEYS.facilitySessions(session.facility_id),
        });
      }
      queryClient.invalidateQueries({ queryKey: SCHEDULING_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to update session time
 */
export function useUpdateSessionTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      sessionId: string;
      newStartTime: string;
      newEndTime: string;
      applyToAllRecurring?: boolean;
    }) => {
      const response = await schedulingApi.updateSessionTime(
        data.sessionId,
        data.newStartTime,
        data.newEndTime,
        data.applyToAllRecurring
      );
      return response;
    },
    onSuccess: (sessions) => {
      // Invalidate affected sessions and facility schedules
      sessions.forEach((session) => {
        queryClient.invalidateQueries({
          queryKey: SCHEDULING_QUERY_KEYS.session(session.id),
        });
        if (session.facility_id) {
          queryClient.invalidateQueries({
            queryKey: SCHEDULING_QUERY_KEYS.facilitySessions(session.facility_id),
          });
        }
      });
      queryClient.invalidateQueries({ queryKey: SCHEDULING_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to cancel session(s)
 */
export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      sessionId: string;
      reason: string;
      cancelAllRecurring?: boolean;
    }) => {
      const response = await schedulingApi.cancelSession(
        data.sessionId,
        data.reason,
        data.cancelAllRecurring
      );
      return response;
    },
    onSuccess: (sessions) => {
      // Invalidate affected sessions and facility schedules
      sessions.forEach((session) => {
        queryClient.invalidateQueries({
          queryKey: SCHEDULING_QUERY_KEYS.session(session.id),
        });
        if (session.facility_id) {
          queryClient.invalidateQueries({
            queryKey: SCHEDULING_QUERY_KEYS.facilitySessions(session.facility_id),
          });
        }
      });
      queryClient.invalidateQueries({ queryKey: SCHEDULING_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to cancel all sessions for a day
 */
export function useCancelAllSessionsForDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      facilityId: string;
      date: string;
      reason: string;
    }) => {
      const response = await schedulingApi.cancelAllSessionsForDay(
        data.facilityId,
        data.date,
        data.reason
      );
      return response;
    },
    onSuccess: (sessions, variables) => {
      // Invalidate facility sessions for the affected facility
      queryClient.invalidateQueries({
        queryKey: SCHEDULING_QUERY_KEYS.facilitySessions(variables.facilityId),
      });
      // Invalidate individual sessions
      sessions.forEach((session) => {
        queryClient.invalidateQueries({
          queryKey: SCHEDULING_QUERY_KEYS.session(session.id),
        });
      });
      queryClient.invalidateQueries({ queryKey: SCHEDULING_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to add participants to a session
 */
export function useAddParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sessionId: string; studentIds: string[] }) => {
      const response = await schedulingApi.addParticipants(data.sessionId, data.studentIds);
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate session participants and the session itself
      queryClient.invalidateQueries({
        queryKey: SCHEDULING_QUERY_KEYS.sessionParticipants(variables.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: SCHEDULING_QUERY_KEYS.session(variables.sessionId),
      });
    },
  });
}

/**
 * Hook to remove participants from a session
 */
export function useRemoveParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      sessionId: string;
      studentIds: string[];
      reason?: string;
    }) => {
      const response = await schedulingApi.removeParticipants(
        data.sessionId,
        data.studentIds,
        data.reason
      );
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate session participants and the session itself
      queryClient.invalidateQueries({
        queryKey: SCHEDULING_QUERY_KEYS.sessionParticipants(variables.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: SCHEDULING_QUERY_KEYS.session(variables.sessionId),
      });
    },
  });
}

/**
 * Hook to add instructors to a session
 */
export function useAddInstructors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sessionId: string; instructorIds: string[] }) => {
      const response = await schedulingApi.addInstructors(data.sessionId, data.instructorIds);
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate session and facility sessions
      queryClient.invalidateQueries({
        queryKey: SCHEDULING_QUERY_KEYS.session(variables.sessionId),
      });
      // Note: We don't know the facility ID here, so we invalidate all facility sessions
      queryClient.invalidateQueries({ queryKey: SCHEDULING_QUERY_KEYS.sessions() });
    },
  });
}

/**
 * Hook to remove instructors from a session
 */
export function useRemoveInstructors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      sessionId: string;
      instructorIds: string[];
      reason?: string;
    }) => {
      const response = await schedulingApi.removeInstructors(
        data.sessionId,
        data.instructorIds,
        data.reason
      );
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate session and facility sessions
      queryClient.invalidateQueries({
        queryKey: SCHEDULING_QUERY_KEYS.session(variables.sessionId),
      });
      // Note: We don't know the facility ID here, so we invalidate all facility sessions
      queryClient.invalidateQueries({ queryKey: SCHEDULING_QUERY_KEYS.sessions() });
    },
  });
}

/**
 * Hook to check for session conflicts
 */
export function useCheckConflicts() {
  return useMutation({
    mutationFn: async (conflictCheck: {
      facility_id: string;
      start_time: string;
      end_time: string;
      instructor_ids?: string[];
      exclude_session_id?: string;
    }) => {
      const response = await schedulingApi.checkConflicts(conflictCheck);
      return response;
    },
  });
}