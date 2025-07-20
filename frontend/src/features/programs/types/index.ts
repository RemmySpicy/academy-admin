/**
 * Programs feature type definitions
 */

export interface Program {
  id: string;
  name: string;
  program_code: string;
  description?: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  display_order?: number;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProgramFormData {
  name: string;
  program_code: string;
  description?: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  display_order?: number;
}

export interface ProgramsListResponse {
  programs: Program[];
  total: number;
  page: number;
  limit: number;
}

export interface ProgramsFilters {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}