#!/usr/bin/env python3
"""
Academy Admin - Frontend Template Generator
Generates complete frontend components with program context support
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime


class FrontendTemplateGenerator:
    """Generates frontend templates with program context support."""
    
    def __init__(self, feature_name: str, base_path: str = "frontend/src/features"):
        self.feature_name = feature_name
        self.feature_snake = feature_name.lower().replace(' ', '_').replace('-', '_')
        self.feature_kebab = feature_name.lower().replace(' ', '-').replace('_', '-')
        self.feature_pascal = ''.join(word.capitalize() for word in self.feature_snake.split('_'))
        self.feature_camel = self.feature_pascal[0].lower() + self.feature_pascal[1:]
        self.base_path = Path(base_path)
        self.feature_path = self.base_path / self.feature_snake
        
    def generate_all(self):
        """Generate complete frontend structure."""
        print(f"🎨 Generating frontend templates for '{self.feature_name}'...")
        
        # Create directory structure
        self.create_directory_structure()
        
        # Generate files
        self.generate_api_service()
        self.generate_types()
        self.generate_hooks()
        self.generate_components()
        self.generate_index_files()
        
        print(f"✅ Generated complete frontend structure at: {self.feature_path}")
        print("\n📋 Next steps:")
        print("1. Review generated components for UI customization")
        print("2. Add feature-specific form fields and validation")
        print("3. Integrate with existing navigation and layouts")
        print("4. Add to main router if needed")
        print("5. Test program context filtering in development")
        
    def create_directory_structure(self):
        """Create the directory structure for the feature."""
        directories = [
            self.feature_path,
            self.feature_path / "api",
            self.feature_path / "types",
            self.feature_path / "hooks",
            self.feature_path / "components",
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
    def generate_api_service(self):
        """Generate API service with httpClient."""
        api_content = f'''/**
 * {self.feature_pascal} API Service
 * Handles all {self.feature_snake}-related API operations with automatic program context
 */

import {{ httpClient }} from '@/lib/api/httpClient';
import {{ API_ENDPOINTS }} from '@/lib/constants';
import {{ PaginatedResponse }} from '@/lib/api/types';
import {{
  {self.feature_pascal},
  {self.feature_pascal}CreateRequest,
  {self.feature_pascal}UpdateRequest,
  {self.feature_pascal}SearchParams,
  {self.feature_pascal}Stats,
}} from '../types';

// TODO: Add these endpoints to @/lib/constants.ts API_ENDPOINTS:
// {self.feature_snake}: {{
//   list: '/api/v1/{self.feature_kebab}',
//   create: '/api/v1/{self.feature_kebab}',
//   get: (id: string) => `/api/v1/{self.feature_kebab}/${{id}}`,
//   update: (id: string) => `/api/v1/{self.feature_kebab}/${{id}}`,
//   delete: (id: string) => `/api/v1/{self.feature_kebab}/${{id}}`,
//   stats: '/api/v1/{self.feature_kebab}/stats',
//   bulkUpdate: '/api/v1/{self.feature_kebab}/bulk-update',
// }}

export const {self.feature_camel}ApiService = {{
  /**
   * Get list of {self.feature_snake}
   * Program context is automatically injected by httpClient
   */
  async get{self.feature_pascal}(params: {self.feature_pascal}SearchParams = {{}}): Promise<PaginatedResponse<{self.feature_pascal}>> {{
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {{
      if (value !== undefined && value !== null && value !== '') {{
        queryParams.append(key, value.toString());
      }}
    }});

    const queryString = queryParams.toString();
    const response = await httpClient.get<PaginatedResponse<{self.feature_pascal}>>(
      `${{API_ENDPOINTS.{self.feature_snake}.list}}${{queryString ? `?${{queryString}}` : ''}}`
    );
    
    if (response.success) {{
      return response.data;
    }} else {{
      throw new Error(response.error || 'Failed to fetch {self.feature_snake}');
    }}
  }},

  /**
   * Create new {self.feature_snake}
   * Program context is automatically injected by httpClient
   */
  async create{self.feature_pascal}({self.feature_camel}Data: {self.feature_pascal}CreateRequest): Promise<{self.feature_pascal}> {{
    const response = await httpClient.post<{self.feature_pascal}>(API_ENDPOINTS.{self.feature_snake}.create, {self.feature_camel}Data);
    
    if (response.success) {{
      return response.data;
    }} else {{
      throw new Error(response.error || 'Failed to create {self.feature_snake}');
    }}
  }},

  /**
   * Get {self.feature_snake} by ID
   * Program context is automatically validated by backend
   */
  async get{self.feature_pascal}ById(id: string): Promise<{self.feature_pascal}> {{
    const response = await httpClient.get<{self.feature_pascal}>(API_ENDPOINTS.{self.feature_snake}.get(id));
    
    if (response.success) {{
      return response.data;
    }} else {{
      throw new Error(response.error || 'Failed to fetch {self.feature_snake}');
    }}
  }},

  /**
   * Update {self.feature_snake}
   * Program context is automatically validated by backend
   */
  async update{self.feature_pascal}(id: string, {self.feature_camel}Data: {self.feature_pascal}UpdateRequest): Promise<{self.feature_pascal}> {{
    const response = await httpClient.put<{self.feature_pascal}>(API_ENDPOINTS.{self.feature_snake}.update(id), {self.feature_camel}Data);
    
    if (response.success) {{
      return response.data;
    }} else {{
      throw new Error(response.error || 'Failed to update {self.feature_snake}');
    }}
  }},

  /**
   * Delete {self.feature_snake}
   * Program context is automatically validated by backend
   */
  async delete{self.feature_pascal}(id: string): Promise<void> {{
    const response = await httpClient.delete<void>(API_ENDPOINTS.{self.feature_snake}.delete(id));
    
    if (!response.success) {{
      throw new Error(response.error || 'Failed to delete {self.feature_snake}');
    }}
  }},

  /**
   * Get {self.feature_snake} statistics
   * Program context is automatically injected by httpClient
   */
  async get{self.feature_pascal}Stats(): Promise<{self.feature_pascal}Stats> {{
    const response = await httpClient.get<{self.feature_pascal}Stats>(API_ENDPOINTS.{self.feature_snake}.stats);
    
    if (response.success) {{
      return response.data;
    }} else {{
      throw new Error(response.error || 'Failed to fetch {self.feature_snake} statistics');
    }}
  }},

  /**
   * Bulk update {self.feature_snake}
   * Program context is automatically injected by httpClient
   */
  async bulkUpdate{self.feature_pascal}(ids: string[], updates: Record<string, any>): Promise<any> {{
    const response = await httpClient.post<any>(API_ENDPOINTS.{self.feature_snake}.bulkUpdate, {{
      {self.feature_snake}_ids: ids,
      updates
    }});
    
    if (response.success) {{
      return response.data;
    }} else {{
      throw new Error(response.error || 'Failed to bulk update {self.feature_snake}');
    }}
  }},
}};

export default {self.feature_camel}ApiService;
'''
        
        api_file = self.feature_path / "api" / f"{self.feature_snake}ApiService.ts"
        with open(api_file, 'w') as f:
            f.write(api_content)
            
    def generate_types(self):
        """Generate TypeScript types."""
        types_content = f'''/**
 * {self.feature_pascal} types and interfaces
 */

export interface {self.feature_pascal} {{
  id: string;
  
  // 🔒 Program context
  program_id: string;
  program_name?: string;
  program_code?: string;
  
  // Core fields
  name: string;
  description?: string;
  is_active: boolean;
  
  // Add custom fields as needed
  // Example:
  // category: string;
  // priority: number;
  // metadata?: Record<string, any>;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}}

export interface {self.feature_pascal}CreateRequest {{
  // 🔒 Program context - REQUIRED for security
  program_id: string;
  
  // Core fields
  name: string;
  description?: string;
  is_active?: boolean;
  
  // Add custom fields as needed
  // Example:
  // category: string;
  // priority?: number;
  // metadata?: Record<string, any>;
}}

export interface {self.feature_pascal}UpdateRequest {{
  name?: string;
  description?: string;
  is_active?: boolean;
  
  // Add custom fields as needed
  // Example:
  // category?: string;
  // priority?: number;
  // metadata?: Record<string, any>;
}}

export interface {self.feature_pascal}SearchParams {{
  // 🔒 Program context (optional, auto-injected by middleware)
  program_id?: string;
  
  // Search and filter params
  search?: string;
  is_active?: boolean;
  
  // Add custom search fields as needed
  // Example:
  // category?: string;
  // priority_min?: number;
  // priority_max?: number;
  
  // Pagination
  page?: number;
  per_page?: number;
  
  // Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}}

export interface {self.feature_pascal}Stats {{
  total_{self.feature_snake}: number;
  active_{self.feature_snake}: number;
  inactive_{self.feature_snake}: number;
  
  // Add custom stats as needed
  // Example:
  // by_category: Record<string, number>;
  // by_priority: Record<string, number>;
  
  // Program context stats
  by_program: Record<string, number>;
  
  // Time-based stats
  created_today: number;
  created_this_week: number;
  created_this_month: number;
}}

export interface {self.feature_pascal}FormData {{
  name: string;
  description?: string;
  is_active: boolean;
  
  // Add custom form fields as needed
  // Example:
  // category: string;
  // priority: number;
  // metadata?: Record<string, any>;
}}

export interface {self.feature_pascal}TableColumn {{
  key: keyof {self.feature_pascal} | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: {self.feature_pascal}) => React.ReactNode;
}}

export interface {self.feature_pascal}FilterState {{
  search: string;
  is_active: boolean | null;
  
  // Add custom filter fields as needed
  // Example:
  // category: string;
  // priority_range: [number, number];
}}

export interface {self.feature_pascal}BulkAction {{
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (ids: string[]) => Promise<void>;
  destructive?: boolean;
}}

// Form validation schemas (if using zod)
export interface {self.feature_pascal}ValidationSchema {{
  name: string;
  description?: string;
  is_active: boolean;
  
  // Add custom validation fields as needed
}}

// UI state interfaces
export interface {self.feature_pascal}UIState {{
  isLoading: boolean;
  error: string | null;
  selectedIds: string[];
  showBulkActions: boolean;
  filters: {self.feature_pascal}FilterState;
  sort: {{
    field: string;
    direction: 'asc' | 'desc';
  }};
  pagination: {{
    page: number;
    per_page: number;
    total: number;
  }};
}}

// API response types
export interface {self.feature_pascal}ListResponse {{
  items: {self.feature_pascal}[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}}

export interface {self.feature_pascal}BulkUpdateRequest {{
  {self.feature_snake}_ids: string[];
  updates: Record<string, any>;
}}

export interface {self.feature_pascal}BulkUpdateResponse {{
  message: string;
  results: {{
    updated_count: number;
    updated_ids: string[];
    not_found_ids: string[];
    total_requested: number;
  }};
}}

// Component prop interfaces
export interface {self.feature_pascal}ListProps {{
  onSelect?: (item: {self.feature_pascal}) => void;
  onEdit?: (item: {self.feature_pascal}) => void;
  onDelete?: (item: {self.feature_pascal}) => void;
  multiSelect?: boolean;
  compact?: boolean;
}}

export interface {self.feature_pascal}FormProps {{
  {self.feature_snake}?: {self.feature_pascal};
  onSubmit: (data: {self.feature_pascal}FormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}}

export interface {self.feature_pascal}CardProps {{
  {self.feature_snake}: {self.feature_pascal};
  onEdit?: (item: {self.feature_pascal}) => void;
  onDelete?: (item: {self.feature_pascal}) => void;
  onSelect?: (item: {self.feature_pascal}) => void;
  selected?: boolean;
  compact?: boolean;
}}

export interface {self.feature_pascal}StatsProps {{
  stats: {self.feature_pascal}Stats;
  loading?: boolean;
  error?: string | null;
}}

export interface {self.feature_pascal}FiltersProps {{
  filters: {self.feature_pascal}FilterState;
  onFiltersChange: (filters: {self.feature_pascal}FilterState) => void;
  onReset: () => void;
}}

// Export all types
export type {{
  {self.feature_pascal}ListData,
  {self.feature_pascal}FormMode,
  {self.feature_pascal}SortField,
  {self.feature_pascal}SortDirection,
}} = {{
  {self.feature_pascal}ListData: {self.feature_pascal}ListResponse;
  {self.feature_pascal}FormMode: 'create' | 'edit';
  {self.feature_pascal}SortField: keyof {self.feature_pascal};
  {self.feature_pascal}SortDirection: 'asc' | 'desc';
}};
'''
        
        types_file = self.feature_path / "types" / f"{self.feature_snake}.types.ts"
        with open(types_file, 'w') as f:
            f.write(types_content)
            
    def generate_hooks(self):
        """Generate React hooks."""
        hooks_content = f'''/**
 * {self.feature_pascal} hooks with program context support
 */

import {{ useState, useEffect, useCallback }} from 'react';
import {{ useQuery, useMutation, useQueryClient }} from '@tanstack/react-query';
import {{ toast }} from 'sonner';

import {{ {self.feature_camel}ApiService }} from '../api/{self.feature_snake}ApiService';
import {{
  {self.feature_pascal},
  {self.feature_pascal}CreateRequest,
  {self.feature_pascal}UpdateRequest,
  {self.feature_pascal}SearchParams,
  {self.feature_pascal}Stats,
  {self.feature_pascal}UIState,
  {self.feature_pascal}FilterState,
}} from '../types/{self.feature_snake}.types';

// Query keys
export const {self.feature_snake}QueryKeys = {{
  all: ['{self.feature_snake}'] as const,
  lists: () => ['{self.feature_snake}', 'list'] as const,
  list: (params: {self.feature_pascal}SearchParams) => ['{self.feature_snake}', 'list', params] as const,
  details: () => ['{self.feature_snake}', 'detail'] as const,
  detail: (id: string) => ['{self.feature_snake}', 'detail', id] as const,
  stats: () => ['{self.feature_snake}', 'stats'] as const,
}};

/**
 * Hook for fetching {self.feature_snake} list with program context
 */
export function use{self.feature_pascal}List(params: {self.feature_pascal}SearchParams = {{}}) {{
  return useQuery({{
    queryKey: {self.feature_snake}QueryKeys.list(params),
    queryFn: () => {self.feature_camel}ApiService.get{self.feature_pascal}(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  }});
}}

/**
 * Hook for fetching single {self.feature_snake} with program context
 */
export function use{self.feature_pascal}(id: string) {{
  return useQuery({{
    queryKey: {self.feature_snake}QueryKeys.detail(id),
    queryFn: () => {self.feature_camel}ApiService.get{self.feature_pascal}ById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  }});
}}

/**
 * Hook for fetching {self.feature_snake} statistics with program context
 */
export function use{self.feature_pascal}Stats() {{
  return useQuery({{
    queryKey: {self.feature_snake}QueryKeys.stats(),
    queryFn: () => {self.feature_camel}ApiService.get{self.feature_pascal}Stats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  }});
}}

/**
 * Hook for creating {self.feature_snake} with program context
 */
export function useCreate{self.feature_pascal}() {{
  const queryClient = useQueryClient();
  
  return useMutation({{
    mutationFn: ({self.feature_camel}Data: {self.feature_pascal}CreateRequest) => 
      {self.feature_camel}ApiService.create{self.feature_pascal}({self.feature_camel}Data),
    onSuccess: (data) => {{
      // Invalidate and refetch {self.feature_snake} lists
      queryClient.invalidateQueries({{ queryKey: {self.feature_snake}QueryKeys.lists() }});
      queryClient.invalidateQueries({{ queryKey: {self.feature_snake}QueryKeys.stats() }});
      
      // Add to cache
      queryClient.setQueryData({self.feature_snake}QueryKeys.detail(data.id), data);
      
      toast.success(`{self.feature_pascal} created successfully`);
    }},
    onError: (error) => {{
      toast.error(`Failed to create {self.feature_snake}: ${{error.message}}`);
    }},
  }});
}}

/**
 * Hook for updating {self.feature_snake} with program context
 */
export function useUpdate{self.feature_pascal}() {{
  const queryClient = useQueryClient();
  
  return useMutation({{
    mutationFn: ({{ id, data }}: {{ id: string; data: {self.feature_pascal}UpdateRequest }}) => 
      {self.feature_camel}ApiService.update{self.feature_pascal}(id, data),
    onSuccess: (data) => {{
      // Invalidate and refetch {self.feature_snake} lists
      queryClient.invalidateQueries({{ queryKey: {self.feature_snake}QueryKeys.lists() }});
      queryClient.invalidateQueries({{ queryKey: {self.feature_snake}QueryKeys.stats() }});
      
      // Update cache
      queryClient.setQueryData({self.feature_snake}QueryKeys.detail(data.id), data);
      
      toast.success(`{self.feature_pascal} updated successfully`);
    }},
    onError: (error) => {{
      toast.error(`Failed to update {self.feature_snake}: ${{error.message}}`);
    }},
  }});
}}

/**
 * Hook for deleting {self.feature_snake} with program context
 */
export function useDelete{self.feature_pascal}() {{
  const queryClient = useQueryClient();
  
  return useMutation({{
    mutationFn: (id: string) => {self.feature_camel}ApiService.delete{self.feature_pascal}(id),
    onSuccess: (_, id) => {{
      // Invalidate and refetch {self.feature_snake} lists
      queryClient.invalidateQueries({{ queryKey: {self.feature_snake}QueryKeys.lists() }});
      queryClient.invalidateQueries({{ queryKey: {self.feature_snake}QueryKeys.stats() }});
      
      // Remove from cache
      queryClient.removeQueries({{ queryKey: {self.feature_snake}QueryKeys.detail(id) }});
      
      toast.success(`{self.feature_pascal} deleted successfully`);
    }},
    onError: (error) => {{
      toast.error(`Failed to delete {self.feature_snake}: ${{error.message}}`);
    }},
  }});
}}

/**
 * Hook for bulk updating {self.feature_snake} with program context
 */
export function useBulkUpdate{self.feature_pascal}() {{
  const queryClient = useQueryClient();
  
  return useMutation({{
    mutationFn: ({{ ids, updates }}: {{ ids: string[]; updates: Record<string, any> }}) => 
      {self.feature_camel}ApiService.bulkUpdate{self.feature_pascal}(ids, updates),
    onSuccess: (data) => {{
      // Invalidate and refetch {self.feature_snake} lists
      queryClient.invalidateQueries({{ queryKey: {self.feature_snake}QueryKeys.lists() }});
      queryClient.invalidateQueries({{ queryKey: {self.feature_snake}QueryKeys.stats() }});
      
      const {{ results }} = data;
      if (results.updated_count > 0) {{
        toast.success(`${{results.updated_count}} {self.feature_snake} updated successfully`);
      }}
      if (results.not_found_ids.length > 0) {{
        toast.warning(`${{results.not_found_ids.length}} {self.feature_snake} not found`);
      }}
    }},
    onError: (error) => {{
      toast.error(`Failed to bulk update {self.feature_snake}: ${{error.message}}`);
    }},
  }});
}}

/**
 * Hook for managing {self.feature_snake} UI state
 */
export function use{self.feature_pascal}UIState() {{
  const [state, setState] = useState<{self.feature_pascal}UIState>({{
    isLoading: false,
    error: null,
    selectedIds: [],
    showBulkActions: false,
    filters: {{
      search: '',
      is_active: null,
      // Add custom filter defaults
    }},
    sort: {{
      field: 'name',
      direction: 'asc',
    }},
    pagination: {{
      page: 1,
      per_page: 20,
      total: 0,
    }},
  }});
  
  const updateFilters = useCallback((filters: Partial<{self.feature_pascal}FilterState>) => {{
    setState(prev => ({{
      ...prev,
      filters: {{ ...prev.filters, ...filters }},
      pagination: {{ ...prev.pagination, page: 1 }}, // Reset to first page
    }}));
  }}, []);
  
  const updateSort = useCallback((field: string, direction: 'asc' | 'desc') => {{
    setState(prev => ({{
      ...prev,
      sort: {{ field, direction }},
    }}));
  }}, []);
  
  const updatePagination = useCallback((page: number, per_page?: number) => {{
    setState(prev => ({{
      ...prev,
      pagination: {{ 
        ...prev.pagination, 
        page,
        ...(per_page && {{ per_page }})
      }},
    }}));
  }}, []);
  
  const setSelectedIds = useCallback((ids: string[]) => {{
    setState(prev => ({{
      ...prev,
      selectedIds: ids,
      showBulkActions: ids.length > 0,
    }}));
  }}, []);
  
  const toggleSelection = useCallback((id: string) => {{
    setState(prev => {{
      const selectedIds = prev.selectedIds.includes(id)
        ? prev.selectedIds.filter(selectedId => selectedId !== id)
        : [...prev.selectedIds, id];
      
      return {{
        ...prev,
        selectedIds,
        showBulkActions: selectedIds.length > 0,
      }};
    }});
  }}, []);
  
  const clearSelection = useCallback(() => {{
    setState(prev => ({{
      ...prev,
      selectedIds: [],
      showBulkActions: false,
    }}));
  }}, []);
  
  const resetFilters = useCallback(() => {{
    setState(prev => ({{
      ...prev,
      filters: {{
        search: '',
        is_active: null,
        // Reset custom filters
      }},
      pagination: {{ ...prev.pagination, page: 1 }},
    }}));
  }}, []);
  
  return {{
    state,
    updateFilters,
    updateSort,
    updatePagination,
    setSelectedIds,
    toggleSelection,
    clearSelection,
    resetFilters,
  }};
}}

/**
 * Hook for managing {self.feature_snake} search and filtering
 */
export function use{self.feature_pascal}Search() {{
  const [params, setParams] = useState<{self.feature_pascal}SearchParams>({{
    search: '',
    is_active: true,
    page: 1,
    per_page: 20,
    sort_by: 'name',
    sort_order: 'asc',
  }});
  
  const updateSearch = useCallback((search: string) => {{
    setParams(prev => ({{ ...prev, search, page: 1 }}));
  }}, []);
  
  const updateFilters = useCallback((filters: Partial<{self.feature_pascal}SearchParams>) => {{
    setParams(prev => ({{ ...prev, ...filters, page: 1 }}));
  }}, []);
  
  const updateSort = useCallback((sort_by: string, sort_order: 'asc' | 'desc') => {{
    setParams(prev => ({{ ...prev, sort_by, sort_order }}));
  }}, []);
  
  const updatePagination = useCallback((page: number, per_page?: number) => {{
    setParams(prev => ({{ 
      ...prev, 
      page,
      ...(per_page && {{ per_page }})
    }}));
  }}, []);
  
  const reset = useCallback(() => {{
    setParams({{
      search: '',
      is_active: true,
      page: 1,
      per_page: 20,
      sort_by: 'name',
      sort_order: 'asc',
    }});
  }}, []);
  
  return {{
    params,
    updateSearch,
    updateFilters,
    updateSort,
    updatePagination,
    reset,
  }};
}}
'''
        
        hooks_file = self.feature_path / "hooks" / f"use{self.feature_pascal}.ts"
        with open(hooks_file, 'w') as f:
            f.write(hooks_content)
            
    def generate_components(self):
        """Generate React components."""
        
        # Main list component
        list_component = f'''/**
 * {self.feature_pascal} List Component
 * Displays paginated list of {self.feature_snake} with program context filtering
 */

import React, {{ useState }} from 'react';
import {{ Plus, Search, Filter, MoreHorizontal, Edit, Trash2 }} from 'lucide-react';

import {{ Button }} from '@/components/ui/button';
import {{ Card, CardContent, CardHeader, CardTitle }} from '@/components/ui/card';
import {{ Input }} from '@/components/ui/input';
import {{ Badge }} from '@/components/ui/badge';
import {{ 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
}} from '@/components/ui/table';
import {{ 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
}} from '@/components/ui/dropdown-menu';
import {{ useToast }} from '@/components/ui/use-toast';

import {{ 
  use{self.feature_pascal}List, 
  useDelete{self.feature_pascal}, 
  use{self.feature_pascal}UIState 
}} from '../hooks/use{self.feature_pascal}';
import {{ {self.feature_pascal}, {self.feature_pascal}ListProps }} from '../types/{self.feature_snake}.types';

export function {self.feature_pascal}List({{ 
  onSelect, 
  onEdit, 
  onDelete, 
  multiSelect = false,
  compact = false 
}}: {self.feature_pascal}ListProps) {{
  const {{ toast }} = useToast();
  const {{ state, updateFilters, updateSort, updatePagination, toggleSelection, clearSelection }} = use{self.feature_pascal}UIState();
  
  // Build search params from UI state
  const searchParams = {{
    search: state.filters.search,
    is_active: state.filters.is_active ?? undefined,
    page: state.pagination.page,
    per_page: state.pagination.per_page,
    sort_by: state.sort.field,
    sort_order: state.sort.direction,
  }};
  
  const {{ data, isLoading, error }} = use{self.feature_pascal}List(searchParams);
  const deleteMutation = useDelete{self.feature_pascal}();
  
  const handleDelete = async (item: {self.feature_pascal}) => {{
    if (window.confirm(`Are you sure you want to delete "${{item.name}}"?`)) {{
      try {{
        await deleteMutation.mutateAsync(item.id);
        onDelete?.(item);
      }} catch (error) {{
        // Error handled by mutation
      }}
    }}
  }};
  
  const handleEdit = (item: {self.feature_pascal}) => {{
    onEdit?.(item);
  }};
  
  const handleSelect = (item: {self.feature_pascal}) => {{
    if (multiSelect) {{
      toggleSelection(item.id);
    }}
    onSelect?.(item);
  }};
  
  const handleSearch = (search: string) => {{
    updateFilters({{ search }});
  }};
  
  const handleSort = (field: string) => {{
    const direction = state.sort.field === field && state.sort.direction === 'asc' ? 'desc' : 'asc';
    updateSort(field, direction);
  }};
  
  const handlePageChange = (page: number) => {{
    updatePagination(page);
  }};
  
  if (error) {{
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading {self.feature_snake}: {{error.message}}
          </div>
        </CardContent>
      </Card>
    );
  }}
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{self.feature_pascal} Management</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add {self.feature_pascal}
          </Button>
        </div>
        
        {{/* Search and Filters */}}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search {self.feature_snake}..."
              value={{state.filters.search}}
              onChange={{(e) => handleSearch(e.target.value)}}
              className="pl-10"
            />
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {{/* Bulk Actions */}}
        {{state.showBulkActions && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {{state.selectedIds.length}} items selected
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  Bulk Edit
                </Button>
                <Button size="sm" variant="outline" onClick={{clearSelection}}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}}
        
        {{/* Table */}}
        <Table>
          <TableHeader>
            <TableRow>
              {{multiSelect && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={{state.selectedIds.length === data?.items.length}}
                    onChange={{(e) => {{
                      if (e.target.checked) {{
                        const allIds = data?.items.map(item => item.id) || [];
                        // Set all selected
                      }} else {{
                        clearSelection();
                      }}
                    }}}}
                  />
                </TableHead>
              )}}
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={{() => handleSort('name')}}
              >
                Name
                {{state.sort.field === 'name' && (
                  <span className="ml-1">
                    {{state.sort.direction === 'asc' ? '↑' : '↓'}}
                  </span>
                )}}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={{() => handleSort('created_at')}}
              >
                Created
                {{state.sort.field === 'created_at' && (
                  <span className="ml-1">
                    {{state.sort.direction === 'asc' ? '↑' : '↓'}}
                  </span>
                )}}
              </TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {{isLoading ? (
              <TableRow>
                <TableCell colSpan={{7}} className="text-center py-8">
                  Loading {self.feature_snake}...
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={{7}} className="text-center py-8">
                  No {self.feature_snake} found
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((item) => (
                <TableRow 
                  key={{item.id}}
                  className="hover:bg-gray-50"
                  onClick={{() => handleSelect(item)}}
                >
                  {{multiSelect && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={{state.selectedIds.includes(item.id)}}
                        onChange={{() => toggleSelection(item.id)}}
                        onClick={{(e) => e.stopPropagation()}}
                      />
                    </TableCell>
                  )}}
                  <TableCell className="font-medium">{{item.name}}</TableCell>
                  <TableCell>{{item.description || '-'}}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {{item.program_name || item.program_id}}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={{item.is_active ? 'default' : 'secondary'}}>
                      {{item.is_active ? 'Active' : 'Inactive'}}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {{new Date(item.created_at).toLocaleDateString()}}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={{() => handleEdit(item)}}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={{() => handleDelete(item)}}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}}
          </TableBody>
        </Table>
        
        {{/* Pagination */}}
        {{data && data.pages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {{((data.page - 1) * data.per_page) + 1}} to {{Math.min(data.page * data.per_page, data.total)}} of {{data.total}} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={{!data.has_prev}}
                onClick={{() => handlePageChange(data.page - 1)}}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={{!data.has_next}}
                onClick={{() => handlePageChange(data.page + 1)}}
              >
                Next
              </Button>
            </div>
          </div>
        )}}
      </CardContent>
    </Card>
  );
}}

export default {self.feature_pascal}List;
'''
        
        list_file = self.feature_path / "components" / f"{self.feature_pascal}List.tsx"
        with open(list_file, 'w') as f:
            f.write(list_component)
            
        # Form component
        form_component = f'''/**
 * {self.feature_pascal} Form Component
 * Form for creating/editing {self.feature_snake} with program context
 */

import React, {{ useState, useEffect }} from 'react';
import {{ useForm }} from 'react-hook-form';
import {{ zodResolver }} from '@hookform/resolvers/zod';
import * as z from 'zod';

import {{ Button }} from '@/components/ui/button';
import {{ Card, CardContent, CardHeader, CardTitle }} from '@/components/ui/card';
import {{ Input }} from '@/components/ui/input';
import {{ Label }} from '@/components/ui/label';
import {{ Textarea }} from '@/components/ui/textarea';
import {{ Switch }} from '@/components/ui/switch';
import {{ Select, SelectContent, SelectItem, SelectTrigger, SelectValue }} from '@/components/ui/select';
import {{ Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage }} from '@/components/ui/form';

import {{ useAuth }} from '@/features/authentication/hooks/useAuth';
import {{ useProgramContext }} from '@/store/programContext';
import {{ {self.feature_pascal}FormProps, {self.feature_pascal}FormData }} from '../types/{self.feature_snake}.types';

// Form validation schema
const {self.feature_snake}FormSchema = z.object({{
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  
  // Add custom validation fields as needed
  // Example:
  // category: z.string().min(1, 'Category is required'),
  // priority: z.number().min(1).max(5),
}});

export function {self.feature_pascal}Form({{ 
  {self.feature_snake}, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode = 'create' 
}}: {self.feature_pascal}FormProps) {{
  const {{ user }} = useAuth();
  const {{ currentProgram }} = useProgramContext();
  
  const form = useForm<{self.feature_pascal}FormData>({{
    resolver: zodResolver({self.feature_snake}FormSchema),
    defaultValues: {{
      name: {self.feature_snake}?.name || '',
      description: {self.feature_snake}?.description || '',
      is_active: {self.feature_snake}?.is_active ?? true,
      
      // Add custom default values as needed
      // Example:
      // category: {self.feature_snake}?.category || '',
      // priority: {self.feature_snake}?.priority || 1,
    }},
  }});
  
  const handleSubmit = async (data: {self.feature_pascal}FormData) => {{
    // Add program context to form data
    const submitData = {{
      ...data,
      program_id: currentProgram?.id || '',
    }};
    
    try {{
      await onSubmit(submitData);
      form.reset();
    }} catch (error) {{
      // Error handled by parent component
    }}
  }};
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {{mode === 'create' ? `Add New {self.feature_pascal}` : `Edit {self.feature_pascal}`}}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {{...form}}>
          <form onSubmit={{form.handleSubmit(handleSubmit)}} className="space-y-6">
            {{/* Program Context Display */}}
            {{currentProgram && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <Label className="text-sm font-medium text-blue-800">
                  Program Context
                </Label>
                <p className="text-sm text-blue-600">
                  {{currentProgram.name}} ({{currentProgram.code}})
                </p>
              </div>
            )}}
            
            {{/* Name Field */}}
            <FormField
              control={{form.control}}
              name="name"
              render={{({{ field }}) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter {self.feature_snake} name..." {{...field}} />
                  </FormControl>
                  <FormDescription>
                    Enter a descriptive name for this {self.feature_snake}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}}
            />
            
            {{/* Description Field */}}
            <FormField
              control={{form.control}}
              name="description"
              render={{({{ field }}) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description..."
                      className="resize-none"
                      rows={{3}}
                      {{...field}}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for this {self.feature_snake}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}}
            />
            
            {{/* Active Status */}}
            <FormField
              control={{form.control}}
              name="is_active"
              render={{({{ field }}) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Whether this {self.feature_snake} is active and available
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={{field.value}}
                      onCheckedChange={{field.onChange}}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}}
            />
            
            {{/* Add custom fields as needed */}}
            {{/* Example:
            <FormField
              control={{form.control}}
              name="category"
              render={{({{ field }}) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={{field.onChange}} defaultValue={{field.value}}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="category1">Category 1</SelectItem>
                      <SelectItem value="category2">Category 2</SelectItem>
                      <SelectItem value="category3">Category 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the category for this {self.feature_snake}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}}
            />
            */}}
            
            {{/* Form Actions */}}
            <div className="flex space-x-2 pt-4">
              <Button 
                type="submit" 
                disabled={{isLoading}}
                className="flex-1"
              >
                {{isLoading ? 'Saving...' : mode === 'create' ? 'Create {self.feature_pascal}' : 'Update {self.feature_pascal}'}}
              </Button>
              {{onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={{onCancel}}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}}

export default {self.feature_pascal}Form;
'''
        
        form_file = self.feature_path / "components" / f"{self.feature_pascal}Form.tsx"
        with open(form_file, 'w') as f:
            f.write(form_component)
            
    def generate_index_files(self):
        """Generate index files for proper imports."""
        
        # Main feature index
        feature_index = f'''/**
 * {self.feature_pascal} feature exports
 */

// API
export * from './api/{self.feature_snake}ApiService';

// Types
export * from './types/{self.feature_snake}.types';

// Hooks
export * from './hooks/use{self.feature_pascal}';

// Components
export {{ default as {self.feature_pascal}List }} from './components/{self.feature_pascal}List';
export {{ default as {self.feature_pascal}Form }} from './components/{self.feature_pascal}Form';

// Re-export main service
export {{ {self.feature_camel}ApiService as default }} from './api/{self.feature_snake}ApiService';
'''
        
        with open(self.feature_path / "index.ts", 'w') as f:
            f.write(feature_index)
            
        # API index
        with open(self.feature_path / "api" / "index.ts", 'w') as f:
            f.write(f'export * from "./{self.feature_snake}ApiService";')
            
        # Types index
        with open(self.feature_path / "types" / "index.ts", 'w') as f:
            f.write(f'export * from "./{self.feature_snake}.types";')
            
        # Hooks index
        with open(self.feature_path / "hooks" / "index.ts", 'w') as f:
            f.write(f'export * from "./use{self.feature_pascal}";')
            
        # Components index
        with open(self.feature_path / "components" / "index.ts", 'w') as f:
            f.write(f'''export {{ default as {self.feature_pascal}List }} from './{self.feature_pascal}List';
export {{ default as {self.feature_pascal}Form }} from './{self.feature_pascal}Form';
''')


def main():
    """Main entry point for the frontend template generator."""
    parser = argparse.ArgumentParser(
        description="Generate Academy Admin frontend templates with program context support"
    )
    parser.add_argument(
        "feature_name",
        help="Name of the feature to generate (e.g., 'User Management', 'inventory-items')"
    )
    parser.add_argument(
        "--base-path",
        default="frontend/src/features",
        help="Base path for feature generation (default: frontend/src/features)"
    )
    
    args = parser.parse_args()
    
    try:
        generator = FrontendTemplateGenerator(args.feature_name, args.base_path)
        generator.generate_all()
        
        print(f"\\n🎉 Successfully generated frontend templates for '{{args.feature_name}}'!")
        print(f"\\n📁 Generated at: {{generator.feature_path}}")
        
    except Exception as e:
        print(f"❌ Error generating frontend templates: {{e}}")
        sys.exit(1)


if __name__ == "__main__":
    main()