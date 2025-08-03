/**
 * Facilities hooks  
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facilitiesApi } from '../api';
import { useProgramContext } from '@/store/programContext';
import {
  FacilityCreate,
  FacilityUpdate,
  FacilitySearchParams,
  FacilityDuplicateRequest,
  FacilityArchiveRequest,
  FacilityManagerAssignment
} from '../types';

// Query keys
export const FACILITY_QUERY_KEYS = {
  all: ['facilities'] as const,
  lists: () => [...FACILITY_QUERY_KEYS.all, 'list'] as const,
  list: (params: FacilitySearchParams) => [...FACILITY_QUERY_KEYS.lists(), params] as const,
  details: () => [...FACILITY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FACILITY_QUERY_KEYS.details(), id] as const,
  stats: () => [...FACILITY_QUERY_KEYS.all, 'stats'] as const,
};

/**
 * Hook to fetch facilities with optional filtering and pagination
 */
export function useFacilities(params?: FacilitySearchParams) {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...FACILITY_QUERY_KEYS.list(params || {}), currentProgram?.id],
    queryFn: () => facilitiesApi.getFacilities(params),
    enabled: !!currentProgram, // Only fetch when we have a program context
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a specific facility by ID
 */
export function useFacility(id: string) {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...FACILITY_QUERY_KEYS.detail(id), currentProgram?.id],
    queryFn: () => facilitiesApi.getFacility(id),
    enabled: !!id && !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch facility statistics
 */
export function useFacilityStats() {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...FACILITY_QUERY_KEYS.stats(), currentProgram?.id],
    queryFn: () => facilitiesApi.getFacilityStats(),
    enabled: !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new facility
 */
export function useCreateFacility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (facilityData: FacilityCreate) => facilitiesApi.createFacility(facilityData),
    onSuccess: () => {
      // Invalidate and refetch facility queries
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to update a facility
 */
export function useUpdateFacility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, facilityData }: { id: string; facilityData: FacilityUpdate }) => 
      facilitiesApi.updateFacility(id, facilityData),
    onSuccess: (data, variables) => {
      // Update the specific facility in the cache
      queryClient.setQueryData(FACILITY_QUERY_KEYS.detail(variables.id), data);
      // Invalidate facility lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to delete a facility
 */
export function useDeleteFacility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => facilitiesApi.deleteFacility(id),
    onSuccess: (_, id) => {
      // Remove the facility from cache
      queryClient.removeQueries({ queryKey: FACILITY_QUERY_KEYS.detail(id) });
      // Invalidate facility lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to duplicate a facility
 */
export function useDuplicateFacility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ facilityId, duplicateData }: { facilityId: string; duplicateData: FacilityDuplicateRequest }) => 
      facilitiesApi.duplicateFacility(facilityId, duplicateData),
    onSuccess: () => {
      // Invalidate facility lists to show the new duplicate
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to archive a facility
 */
export function useArchiveFacility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ facilityId, archiveData }: { facilityId: string; archiveData: FacilityArchiveRequest }) => 
      facilitiesApi.archiveFacility(facilityId, archiveData),
    onSuccess: (data, variables) => {
      // Update the specific facility in the cache
      queryClient.setQueryData(FACILITY_QUERY_KEYS.detail(variables.facilityId), data);
      // Invalidate facility lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to assign a manager to a facility
 */
export function useAssignFacilityManager() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ facilityId, assignment }: { facilityId: string; assignment: FacilityManagerAssignment }) => 
      facilitiesApi.assignManager(facilityId, assignment),
    onSuccess: (data, variables) => {
      // Update the specific facility in the cache
      queryClient.setQueryData(FACILITY_QUERY_KEYS.detail(variables.facilityId), data);
      // Invalidate facility lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: FACILITY_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook to get facility schedule data
 */
export function useFacilitySchedule(facilityId: string) {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...FACILITY_QUERY_KEYS.detail(facilityId), 'schedule', currentProgram?.id],
    queryFn: () => facilitiesApi.getFacilitySchedule(facilityId),
    enabled: !!facilityId && !!currentProgram,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get facility availability data
 */
export function useFacilityAvailability(facilityId: string, date?: string) {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...FACILITY_QUERY_KEYS.detail(facilityId), 'availability', date, currentProgram?.id],
    queryFn: () => facilitiesApi.getFacilityAvailability(facilityId, date),
    enabled: !!facilityId && !!currentProgram,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get facility staff assignments
 */
export function useFacilityStaff(facilityId: string) {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...FACILITY_QUERY_KEYS.detail(facilityId), 'staff', currentProgram?.id],
    queryFn: () => facilitiesApi.getFacilityStaff(facilityId),
    enabled: !!facilityId && !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}