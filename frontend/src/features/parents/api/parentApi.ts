/**
 * Parent API service for managing parent users and family relationships
 */

import { apiClient } from '@/lib/api';
import type { 
  User, 
  UserCreate, 
  UserUpdate, 
  UserListResponse, 
  FamilyStructure,
  ApiResponse 
} from '@/lib/api/types';

export interface ParentSearchParams {
  search?: string;
  is_active?: boolean;
  has_children?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface ParentStats {
  total_parents: number;
  active_parents: number;
  inactive_parents: number;
  parents_with_children: number;
  parents_without_children: number;
  total_children_connections: number;
  parents_with_multiple_children: number;
  average_children_per_parent: number;
}

export interface EnhancedParent extends User {
  children_count: number;
  has_children: boolean;
}

export interface ParentListResponse extends Omit<UserListResponse, 'items'> {
  items: EnhancedParent[];
}

class ParentApiService {
  private readonly baseUrl = '/parents';

  /**
   * Get paginated list of parents with search and filtering
   */
  async getAll(
    searchParams: ParentSearchParams = {},
    page: number = 1,
    per_page: number = 20
  ): Promise<ApiResponse<ParentListResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      ...Object.fromEntries(
        Object.entries(searchParams).map(([key, value]) => [key, String(value)])
      ),
    });

    return apiClient.get<ParentListResponse>(`${this.baseUrl}?${params}`);
  }

  /**
   * Get parent statistics
   */
  async getStats(): Promise<ApiResponse<ParentStats>> {
    return apiClient.get<ParentStats>(`${this.baseUrl}/stats`);
  }

  /**
   * Get parent by ID
   */
  async getById(parentId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`${this.baseUrl}/${parentId}`);
  }

  /**
   * Get parent's family structure (children and relationships)
   */
  async getFamilyStructure(parentId: string): Promise<ApiResponse<FamilyStructure>> {
    return apiClient.get<FamilyStructure>(`${this.baseUrl}/${parentId}/family`);
  }

  /**
   * Create a new parent
   */
  async create(parentData: UserCreate): Promise<ApiResponse<User>> {
    return apiClient.post<User>(this.baseUrl, parentData);
  }

  /**
   * Update parent information
   */
  async update(parentId: string, updateData: UserUpdate): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`${this.baseUrl}/${parentId}`, updateData);
  }

  /**
   * Delete a parent (admin only)
   */
  async delete(parentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseUrl}/${parentId}`);
  }

  /**
   * Search parents with advanced filters
   */
  async search(searchParams: ParentSearchParams): Promise<ApiResponse<ParentListResponse>> {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(searchParams)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      )
    );

    return apiClient.get<ParentListResponse>(`${this.baseUrl}?${params}`);
  }

  /**
   * Get parents for a specific child/student
   */
  async getParentsForChild(childId: string): Promise<ApiResponse<EnhancedParent[]>> {
    const familyResponse = await apiClient.get<FamilyStructure>(`/students/${childId}/family`);
    
    if (familyResponse.success && familyResponse.data) {
      // Extract parent information from family structure
      const parents = familyResponse.data.parents.map(parentRel => ({
        ...parentRel.user,
        children_count: 1, // We know they have at least this child
        has_children: true,
        relationship_type: parentRel.relationship_type,
        is_primary: parentRel.is_primary,
        relationship_id: parentRel.relationship_id
      }));
      
      return {
        success: true,
        data: parents,
        message: 'Parents retrieved successfully'
      };
    }
    
    return {
      success: false,
      error: familyResponse.error || 'Failed to retrieve parents',
      data: []
    };
  }

  /**
   * Get children for a specific parent
   */
  async getChildrenForParent(parentId: string): Promise<ApiResponse<User[]>> {
    const familyResponse = await this.getFamilyStructure(parentId);
    
    if (familyResponse.success && familyResponse.data) {
      const children = familyResponse.data.children.map(childRel => ({
        ...childRel.user,
        relationship_type: childRel.relationship_type,
        is_primary: childRel.is_primary,
        relationship_id: childRel.relationship_id
      }));
      
      return {
        success: true,
        data: children,
        message: 'Children retrieved successfully'
      };
    }
    
    return {
      success: false,
      error: familyResponse.error || 'Failed to retrieve children',
      data: []
    };
  }

  /**
   * Bulk operations on parents
   */
  async bulkUpdate(
    parentIds: string[], 
    action: 'activate' | 'deactivate' | 'delete',
    data?: Record<string, any>
  ): Promise<ApiResponse<{ successful: string[], failed: string[] }>> {
    return apiClient.post<{ successful: string[], failed: string[] }>(`${this.baseUrl}/bulk-action`, {
      parent_ids: parentIds,
      action,
      parameters: data
    });
  }

  /**
   * Export parents data
   */
  async export(format: 'csv' | 'xlsx' = 'csv', filters?: ParentSearchParams): Promise<ApiResponse<Blob>> {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(
        Object.entries(filters || {})
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      )
    });

    return apiClient.get<Blob>(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }
}

// Export singleton instance
export const parentApi = new ParentApiService();

// Export types for use in components
export type {
  ParentSearchParams,
  ParentStats,
  EnhancedParent,
  ParentListResponse
};