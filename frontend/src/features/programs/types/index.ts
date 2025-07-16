/**
 * Programs feature type definitions
 */

export interface Program {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProgramFormData {
  name: string;
  code: string;
  description?: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  displayOrder?: number;
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