/**
 * Equipment API Service
 * Handles all equipment-related API operations with automatic program context
 */

import { httpClient, API_ENDPOINTS as GLOBAL_API_ENDPOINTS } from '@/lib/api/httpClient';
import { PaginatedResponse } from '@/lib/api/types';

export interface Equipment {
  id: string;
  equipment_name: string;
  description?: string;
  equipment_type: 'hardware' | 'software' | 'tool' | 'material' | 'safety' | 'other';
  quantity: number;
  is_required: boolean;
  is_consumable: boolean;
  unit_of_measurement?: string;
  estimated_cost?: number;
  supplier_info?: string;
  safety_notes?: string;
  alternative_options?: string;
  lesson_id?: string;
  section_id?: string;
  module_id?: string;
  level_id?: string;
  curriculum_id?: string;
  course_id?: string;
  program_id?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentSearchParams {
  search?: string;
  lesson_id?: string;
  section_id?: string;
  module_id?: string;
  level_id?: string;
  curriculum_id?: string;
  course_id?: string;
  program_id?: string;
  equipment_type?: string;
  is_required?: boolean;
  is_consumable?: boolean;
  quantity_min?: number;
  quantity_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface EquipmentCreateRequest {
  equipment_name: string;
  description?: string;
  equipment_type: 'hardware' | 'software' | 'tool' | 'material' | 'safety' | 'other';
  quantity: number;
  is_required?: boolean;
  is_consumable?: boolean;
  unit_of_measurement?: string;
  estimated_cost?: number;
  supplier_info?: string;
  safety_notes?: string;
  alternative_options?: string;
  lesson_id?: string;
  section_id?: string;
  module_id?: string;
  level_id?: string;
  curriculum_id?: string;
  course_id?: string;
  program_id?: string;
}

export interface EquipmentUpdateRequest {
  equipment_name?: string;
  description?: string;
  equipment_type?: 'hardware' | 'software' | 'tool' | 'material' | 'safety' | 'other';
  quantity?: number;
  is_required?: boolean;
  is_consumable?: boolean;
  unit_of_measurement?: string;
  estimated_cost?: number;
  supplier_info?: string;
  safety_notes?: string;
  alternative_options?: string;
  lesson_id?: string;
  section_id?: string;
  module_id?: string;
  level_id?: string;
  curriculum_id?: string;
  course_id?: string;
  program_id?: string;
}

export interface EquipmentStats {
  total_equipment_items: number;
  equipment_by_type: Record<string, number>;
  required_equipment_count: number;
  consumable_equipment_count: number;
  total_estimated_cost: number;
  average_cost_per_item: number;
  most_used_equipment: Array<{
    id: string;
    equipment_name: string;
    usage_count: number;
  }>;
  most_expensive_equipment: Array<{
    id: string;
    equipment_name: string;
    estimated_cost: number;
  }>;
  equipment_by_program: Record<string, number>;
  equipment_by_curriculum: Record<string, number>;
}

export interface EquipmentUsage {
  equipment_name: string;
  usage_locations: Array<{
    type: 'lesson' | 'section' | 'module' | 'level' | 'curriculum' | 'course' | 'program';
    id: string;
    title: string;
    curriculum?: string;
    course?: string;
    program?: string;
    quantity: number;
    is_required: boolean;
  }>;
  total_usage_count: number;
  total_quantity_needed: number;
  programs_using: string[];
  courses_using: string[];
  curricula_using: string[];
}

export interface EquipmentBulkUpdateRequest {
  equipment_ids: string[];
  updates: Partial<EquipmentUpdateRequest>;
}

export interface BulkActionResult {
  successful: string[];
  failed: Array<{ id: string; error: string }>;
  total_processed: number;
  total_successful: number;
  total_failed: number;
}

export interface EquipmentInventorySummary {
  equipment_name: string;
  equipment_type: string;
  total_quantity_needed: number;
  total_estimated_cost: number;
  usage_count: number;
  is_required: boolean;
  is_consumable: boolean;
  unit_of_measurement?: string;
  programs_using: string[];
  courses_using: string[];
  alternative_options?: string;
}

export interface LessonEquipmentSummary {
  lesson_id: string;
  lesson_title: string;
  equipment_requirements: Array<{
    equipment_name: string;
    equipment_type: string;
    quantity: number;
    is_required: boolean;
    is_consumable: boolean;
    unit_of_measurement?: string;
    estimated_cost?: number;
    safety_notes?: string;
    alternative_options?: string;
  }>;
  total_equipment_items: number;
  total_estimated_cost: number;
  required_equipment_count: number;
  consumable_equipment_count: number;
}

// Use centralized API endpoints
const API_ENDPOINTS = {
  equipment: GLOBAL_API_ENDPOINTS.equipment,
};

export const equipmentApiService = {
  /**
   * Get list of equipment items
   * Program context is automatically injected by httpClient
   */
  async getEquipment(params: EquipmentSearchParams = {}): Promise<PaginatedResponse<Equipment>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const response = await httpClient.get<PaginatedResponse<Equipment>>(
      `${API_ENDPOINTS.equipment.list}${queryString ? `?${queryString}` : ''}`
    );
    
    return response.data;
  },

  /**
   * Create new equipment requirement
   * Program context is automatically injected by httpClient
   */
  async createEquipment(equipmentData: EquipmentCreateRequest): Promise<Equipment> {
    const response = await httpClient.post<Equipment>(API_ENDPOINTS.equipment.create, equipmentData);
    return response.data;
  },

  /**
   * Get equipment item by ID
   * Program context is automatically validated by backend
   */
  async getEquipmentById(id: string): Promise<Equipment> {
    const response = await httpClient.get<Equipment>(API_ENDPOINTS.equipment.get(id));
    return response.data;
  },

  /**
   * Update equipment item
   * Program context is automatically validated by backend
   */
  async updateEquipment(id: string, equipmentData: EquipmentUpdateRequest): Promise<Equipment> {
    const response = await httpClient.put<Equipment>(API_ENDPOINTS.equipment.update(id), equipmentData);
    return response.data;
  },

  /**
   * Delete equipment item
   * Program context is automatically validated by backend
   */
  async deleteEquipment(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.equipment.delete(id));
  },

  /**
   * Get equipment statistics
   * Program context is automatically injected by httpClient
   */
  async getEquipmentStats(): Promise<EquipmentStats> {
    const response = await httpClient.get<EquipmentStats>(API_ENDPOINTS.equipment.stats);
    return response.data;
  },

  /**
   * Get equipment by lesson
   * Program context is automatically validated by backend
   */
  async getEquipmentByLesson(lessonId: string, params: { page?: number; per_page?: number } = {}): Promise<PaginatedResponse<Equipment>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());

    const queryString = queryParams.toString();
    const response = await httpClient.get<PaginatedResponse<Equipment>>(
      `${API_ENDPOINTS.equipment.byLesson(lessonId)}${queryString ? `?${queryString}` : ''}`
    );
    
    return response.data;
  },

  /**
   * Get equipment usage information
   * Program context is automatically validated by backend
   */
  async getEquipmentUsage(equipmentName: string): Promise<EquipmentUsage> {
    const response = await httpClient.get<EquipmentUsage>(API_ENDPOINTS.equipment.usage(equipmentName));
    return response.data;
  },

  /**
   * Bulk update equipment items
   * Program context is automatically injected by httpClient
   */
  async bulkUpdateEquipment(request: EquipmentBulkUpdateRequest): Promise<BulkActionResult> {
    const response = await httpClient.post<BulkActionResult>(
      API_ENDPOINTS.equipment.bulkUpdate,
      request
    );
    return response.data;
  },

  /**
   * Get equipment inventory summary
   * Program context is automatically injected by httpClient
   */
  async getEquipmentInventorySummary(): Promise<EquipmentInventorySummary[]> {
    const response = await httpClient.get<EquipmentInventorySummary[]>(
      API_ENDPOINTS.equipment.inventorySummary
    );
    return response.data;
  },

  /**
   * Get lesson equipment summary
   * Program context is automatically validated by backend
   */
  async getLessonEquipmentSummary(lessonId: string): Promise<LessonEquipmentSummary> {
    const response = await httpClient.get<LessonEquipmentSummary>(
      API_ENDPOINTS.equipment.lessonSummary(lessonId)
    );
    return response.data;
  },
};