/**
 * React hooks for equipment management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpClient } from '@/lib/api/httpClient';
import { useProgramContext } from '@/store/programContext';
import type { SearchParams, PaginatedResponse } from '@/lib/api/types';

// Equipment types
export interface Equipment {
  id: string;
  name: string;
  description?: string;
  category: 'hardware' | 'software' | 'material' | 'tool' | 'safety' | 'other';
  type: 'required' | 'optional' | 'recommended';
  quantity_required: number;
  quantity_available?: number;
  status: 'available' | 'limited' | 'unavailable' | 'ordered';
  location?: string;
  supplier?: string;
  cost_per_unit?: number;
  created_at: string;
  updated_at: string;
}

export interface EquipmentRequirement {
  id: string;
  content_id: string;
  content_type: 'lesson' | 'assessment';
  equipment_id: string;
  equipment: Equipment;
  quantity_needed: number;
  is_critical: boolean;
  alternatives?: string;
  notes?: string;
  created_at: string;
}

export interface EquipmentCreate {
  name: string;
  description?: string;
  category: Equipment['category'];
  type: Equipment['type'];
  quantity_required: number;
  location?: string;
  supplier?: string;
  cost_per_unit?: number;
}

export interface EquipmentUpdate extends Partial<EquipmentCreate> {}

export interface EquipmentRequirementCreate {
  content_id: string;
  content_type: 'lesson' | 'assessment';
  equipment_id: string;
  quantity_needed: number;
  is_critical: boolean;
  alternatives?: string;
  notes?: string;
}

export interface EquipmentRequirementUpdate extends Partial<Omit<EquipmentRequirementCreate, 'content_id' | 'content_type'>> {}

export interface EquipmentSearchParams extends SearchParams {
  category?: Equipment['category'];
  status?: Equipment['status'];
  type?: Equipment['type'];
  content_id?: string;
  content_type?: 'lesson' | 'assessment';
}

// Query Keys
export const EQUIPMENT_QUERY_KEYS = {
  EQUIPMENT: 'equipment',
  EQUIPMENT_ITEM: 'equipment-item',
  REQUIREMENTS: 'equipment-requirements',
  REQUIREMENT: 'equipment-requirement',
  EQUIPMENT_STATS: 'equipment-stats',
} as const;

// Mock implementation for now - will be replaced with real API calls
const mockEquipmentApiService = {
  getEquipment: async (params: EquipmentSearchParams = {}): Promise<PaginatedResponse<Equipment>> => {
    // Return mock equipment data
    const mockEquipment: Equipment[] = [
      {
        id: '1',
        name: 'Laptop Computer',
        description: 'Standard laptop for programming lessons',
        category: 'hardware',
        type: 'required',
        quantity_required: 20,
        quantity_available: 18,
        status: 'limited',
        location: 'Computer Lab A',
        supplier: 'TechCorp',
        cost_per_unit: 899.99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Arduino Kit',
        description: 'Arduino starter kit for electronics projects',
        category: 'hardware',
        type: 'required',
        quantity_required: 15,
        quantity_available: 15,
        status: 'available',
        location: 'Electronics Storage',
        supplier: 'Arduino Store',
        cost_per_unit: 49.99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Safety Goggles',
        description: 'Protective eyewear for lab work',
        category: 'safety',
        type: 'required',
        quantity_required: 30,
        quantity_available: 25,
        status: 'available',
        location: 'Safety Cabinet',
        supplier: 'SafetyFirst',
        cost_per_unit: 12.99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return {
      items: mockEquipment,
      total: mockEquipment.length,
      page: params.page || 1,
      limit: params.per_page || 20,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    };
  },

  getEquipmentItem: async (id: string): Promise<Equipment> => {
    const response = await httpClient.get<Equipment>(`/api/v1/equipment/${id}`);
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch equipment item');
  },

  createEquipment: async (data: EquipmentCreate): Promise<Equipment> => {
    const response = await httpClient.post<Equipment>('/api/v1/equipment', data);
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create equipment');
  },

  updateEquipment: async (id: string, data: EquipmentUpdate): Promise<Equipment> => {
    const response = await httpClient.put<Equipment>(`/api/v1/equipment/${id}`, data);
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update equipment');
  },

  deleteEquipment: async (id: string): Promise<void> => {
    const response = await httpClient.delete(`/api/v1/equipment/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete equipment');
    }
  },

  getRequirements: async (params: EquipmentSearchParams = {}): Promise<EquipmentRequirement[]> => {
    // Return mock requirements data
    const mockRequirements: EquipmentRequirement[] = [
      {
        id: '1',
        content_id: 'lesson-1',
        content_type: 'lesson',
        equipment_id: '1',
        equipment: {
          id: '1',
          name: 'Laptop Computer',
          description: 'Standard laptop for programming lessons',
          category: 'hardware',
          type: 'required',
          quantity_required: 20,
          quantity_available: 18,
          status: 'limited',
          location: 'Computer Lab A',
          supplier: 'TechCorp',
          cost_per_unit: 899.99,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        quantity_needed: 1,
        is_critical: true,
        alternatives: 'Personal laptop with required software',
        notes: 'Students can bring their own laptop if it meets specs',
        created_at: new Date().toISOString(),
      },
    ];

    return mockRequirements.filter(req => {
      if (params.content_id && req.content_id !== params.content_id) return false;
      if (params.content_type && req.content_type !== params.content_type) return false;
      return true;
    });
  },

  createRequirement: async (data: EquipmentRequirementCreate): Promise<EquipmentRequirement> => {
    const response = await httpClient.post<EquipmentRequirement>('/api/v1/equipment/requirements', data);
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create equipment requirement');
  },

  updateRequirement: async (id: string, data: EquipmentRequirementUpdate): Promise<EquipmentRequirement> => {
    const response = await httpClient.put<EquipmentRequirement>(`/api/v1/equipment/requirements/${id}`, data);
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update equipment requirement');
  },

  deleteRequirement: async (id: string): Promise<void> => {
    const response = await httpClient.delete(`/api/v1/equipment/requirements/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete equipment requirement');
    }
  },

  getEquipmentStats: async (): Promise<{
    total_equipment: number;
    total_requirements: number;
    equipment_by_category: Record<string, number>;
    equipment_by_status: Record<string, number>;
    critical_requirements: number;
    unavailable_equipment: number;
  }> => {
    return {
      total_equipment: 3,
      total_requirements: 1,
      equipment_by_category: {
        hardware: 2,
        software: 0,
        material: 0,
        tool: 0,
        safety: 1,
        other: 0,
      },
      equipment_by_status: {
        available: 2,
        limited: 1,
        unavailable: 0,
        ordered: 0,
      },
      critical_requirements: 1,
      unavailable_equipment: 0,
    };
  },
};

// Equipment Management Hooks
export const useEquipment = (params: EquipmentSearchParams = {}) => {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT, params, currentProgram?.id],
    queryFn: () => mockEquipmentApiService.getEquipment(params),
    enabled: !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

export const useEquipmentItem = (id: string) => {
  return useQuery({
    queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT_ITEM, id],
    queryFn: () => mockEquipmentApiService.getEquipmentItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEquipmentRequirements = (params: EquipmentSearchParams = {}) => {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [EQUIPMENT_QUERY_KEYS.REQUIREMENTS, params, currentProgram?.id],
    queryFn: () => mockEquipmentApiService.getRequirements(params),
    enabled: !!currentProgram,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useEquipmentStats = () => {
  return useQuery({
    queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT_STATS],
    queryFn: mockEquipmentApiService.getEquipmentStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EquipmentCreate) => mockEquipmentApiService.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT] });
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT_STATS] });
      toast.success('Equipment created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create equipment: ${error.message}`);
    },
  });
};

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipmentUpdate }) => 
      mockEquipmentApiService.updateEquipment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT] });
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT_ITEM, id] });
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT_STATS] });
      toast.success('Equipment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update equipment: ${error.message}`);
    },
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockEquipmentApiService.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT] });
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT_STATS] });
      toast.success('Equipment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete equipment: ${error.message}`);
    },
  });
};

export const useCreateRequirement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EquipmentRequirementCreate) => mockEquipmentApiService.createRequirement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.REQUIREMENTS] });
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT_STATS] });
      toast.success('Equipment requirement created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create equipment requirement: ${error.message}`);
    },
  });
};

export const useUpdateRequirement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipmentRequirementUpdate }) => 
      mockEquipmentApiService.updateRequirement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.REQUIREMENTS] });
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT_STATS] });
      toast.success('Equipment requirement updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update equipment requirement: ${error.message}`);
    },
  });
};

export const useDeleteRequirement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockEquipmentApiService.deleteRequirement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.REQUIREMENTS] });
      queryClient.invalidateQueries({ queryKey: [EQUIPMENT_QUERY_KEYS.EQUIPMENT_STATS] });
      toast.success('Equipment requirement deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete equipment requirement: ${error.message}`);
    },
  });
};

// Convenience hook for equipment management
export const useEquipmentManagement = (params: EquipmentSearchParams = {}) => {
  const equipment = useEquipment(params);
  const requirements = useEquipmentRequirements(params);
  const stats = useEquipmentStats();
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const deleteEquipment = useDeleteEquipment();
  const createRequirement = useCreateRequirement();
  const updateRequirement = useUpdateRequirement();
  const deleteRequirement = useDeleteRequirement();
  
  return {
    equipment: equipment.data?.items || [],
    requirements: requirements.data || [],
    stats: stats.data,
    isLoading: equipment.isLoading || requirements.isLoading || stats.isLoading,
    hasError: equipment.error || requirements.error || stats.error,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    
    // Computed values
    totalEquipment: equipment.data?.total || 0,
    totalRequirements: requirements.data?.length || 0,
    criticalRequirements: requirements.data?.filter(r => r.is_critical).length || 0,
    unavailableEquipment: equipment.data?.items?.filter(e => e.status === 'unavailable').length || 0,
  };
};