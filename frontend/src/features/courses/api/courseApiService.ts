/**
 * Course API Service - Comprehensive course management operations
 */

import { httpClient, type ApiResponse } from '@/lib/api/httpClient';
import { programContextApi } from '@/lib/api/programContextSync';
import { API_ENDPOINTS } from '@/lib/constants';

// Helper function to check API response success
const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } => {
  return response.success;
};
import type { 
  PaginatedResponse, 
  SearchParams,
  CurriculumStatus,
  DifficultyLevel
} from '@/lib/api/types';

// Course Types
export interface PricingEntry {
  age_range: string;
  location_type: string;
  session_type: string;
  price: number;
}

export interface Course {
  id: string;
  program_id: string;
  name: string;
  code: string;
  description?: string;
  objectives?: string[];
  prerequisites?: string[];
  duration_weeks?: number;
  sessions_per_payment: number;
  completion_deadline_weeks: number;
  age_ranges: string[];
  location_types: string[];
  session_types: string[];
  pricing_matrix: PricingEntry[];
  status: CurriculumStatus;
  instructor_id?: string;
  max_students?: number;
  min_students?: number;
  tags?: string[];
  image_url?: string;
  video_url?: string;
  sequence: number;
  is_featured: boolean;
  is_certification_course: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  
  // Nested relationships
  program?: {
    id: string;
    name: string;
    code: string;
  };
  instructor?: {
    id: string;
    name: string;
    email: string;
  };
  curricula?: Curriculum[];
  
  // Statistics
  total_curricula?: number;
  total_lessons?: number;
  total_students?: number;
  completion_rate?: number;
  average_rating?: number;
}

export interface Curriculum {
  id: string;
  course_id: string;
  name: string;
  code: string;
  description?: string;
  objectives?: string[];
  age_min?: number;
  age_max?: number;
  skill_level: DifficultyLevel;
  duration_weeks: number;
  status: CurriculumStatus;
  sequence: number;
  prerequisite_curriculum_ids?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  
  // Nested relationships
  course?: Course;
  levels?: Level[];
  
  // Statistics
  total_levels?: number;
  total_lessons?: number;
  total_students?: number;
  completion_rate?: number;
}

export interface Level {
  id: string;
  curriculum_id: string;
  name: string;
  description?: string;
  objectives?: string[];
  sequence: number;
  estimated_duration_hours: number;
  difficulty_level: DifficultyLevel;
  status: CurriculumStatus;
  prerequisite_level_ids?: string[];
  created_at: string;
  updated_at: string;
  
  // Nested relationships
  curriculum?: Curriculum;
  modules?: Module[];
  
  // Statistics
  total_modules?: number;
  total_lessons?: number;
  completion_rate?: number;
}

export interface Module {
  id: string;
  level_id: string;
  name: string;
  description?: string;
  objectives?: string[];
  sequence: number;
  estimated_duration_hours: number;
  module_type: 'theory' | 'practical' | 'assessment' | 'project';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
  
  // Nested relationships
  level?: Level;
  sections?: Section[];
  
  // Statistics
  total_sections?: number;
  total_lessons?: number;
  completion_rate?: number;
}

export interface Section {
  id: string;
  module_id: string;
  name: string;
  description?: string;
  objectives?: string[];
  sequence: number;
  estimated_duration_minutes: number;
  section_type: 'lecture' | 'lab' | 'discussion' | 'assessment' | 'project';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
  
  // Nested relationships
  module?: Module;
  lessons?: Lesson[];
  
  // Statistics
  total_lessons?: number;
  completion_rate?: number;
}

export interface Lesson {
  id: string;
  section_id: string;
  name: string;
  description?: string;
  objectives?: string[];
  content?: string; // Rich text content
  content_type: 'text' | 'video' | 'interactive' | 'document' | 'presentation';
  sequence: number;
  estimated_duration_minutes: number;
  difficulty_level: DifficultyLevel;
  status: CurriculumStatus;
  is_required: boolean;
  prerequisite_lesson_ids?: string[];
  tags?: string[];
  resources?: LessonResource[];
  created_at: string;
  updated_at: string;
  
  // Nested relationships
  section?: Section;
  assessments?: Assessment[];
  equipment_requirements?: EquipmentRequirement[];
  
  // Statistics
  completion_rate?: number;
  average_time_spent?: number;
  total_assessments?: number;
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  name: string;
  description?: string;
  resource_type: 'file' | 'link' | 'video' | 'image' | 'document';
  resource_url: string;
  file_size?: number;
  mime_type?: string;
  is_downloadable: boolean;
  sequence: number;
}

export interface Assessment {
  id: string;
  lesson_id: string;
  name: string;
  description?: string;
  assessment_type: 'QUIZ' | 'ASSIGNMENT' | 'PROJECT' | 'PRACTICAL' | 'PRESENTATION';
  instructions?: string;
  duration_minutes?: number;
  max_score: number;
  passing_score: number;
  weight: number; // Percentage weight in final grade
  is_required: boolean;
  is_proctored: boolean;
  attempts_allowed: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sequence: number;
  created_at: string;
  updated_at: string;
  
  // Nested relationships
  lesson?: Lesson;
  criteria?: AssessmentCriteria[];
  
  // Statistics
  total_submissions?: number;
  average_score?: number;
  pass_rate?: number;
}

export interface AssessmentCriteria {
  id: string;
  assessment_id: string;
  name: string;
  description?: string;
  max_score: number;
  weight?: number;
  sequence: number;
  rubric_levels?: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  criteria_id: string;
  level_name: string;
  description: string;
  score_value: number;
  sequence: number;
}

export interface EquipmentRequirement {
  id: string;
  lesson_id: string;
  equipment_id: string;
  quantity_needed: number;
  is_critical: boolean;
  alternatives?: string;
  notes?: string;
}

// Search and Filter Types
export interface CourseSearchParams extends SearchParams {
  program_id?: string;
  instructor_id?: string;
  status?: CurriculumStatus;
  is_featured?: boolean;
  is_certification_course?: boolean;
  price_min?: number;
  price_max?: number;
  age_ranges?: string[];
  location_types?: string[];
  session_types?: string[];
  tags?: string[];
}

export interface CurriculumSearchParams extends SearchParams {
  course_id?: string;
  skill_level?: DifficultyLevel;
  status?: CurriculumStatus;
  age_min?: number;
  age_max?: number;
  duration_weeks_min?: number;
  duration_weeks_max?: number;
}

// Statistics Types
export interface CourseStats {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  courses_by_difficulty: Record<string, number>;
  courses_by_status: Record<string, number>;
  average_completion_rate: number;
  total_students_enrolled: number;
  revenue_generated: number;
}

export interface CourseTree {
  course: Course;
  curricula: Array<{
    curriculum: Curriculum;
    levels: Array<{
      level: Level;
      modules: Array<{
        module: Module;
        sections: Array<{
          section: Section;
          lessons: Lesson[];
        }>;
      }>;
    }>;
  }>;
}

// Create/Update Types
export interface CourseCreate {
  program_id: string;
  name: string;
  code: string;
  description?: string;
  objectives?: string[];
  prerequisites?: string[];
  duration_weeks?: number;
  sessions_per_payment: number;
  completion_deadline_weeks: number;
  age_ranges: string[];
  location_types: string[];
  session_types: string[];
  pricing_matrix: PricingEntry[];
  instructor_id?: string;
  max_students?: number;
  min_students?: number;
  tags?: string[];
  image_url?: string;
  video_url?: string;
  sequence?: number;
  is_featured?: boolean;
  is_certification_course?: boolean;
}

export interface CourseUpdate extends Partial<CourseCreate> {}

export interface BulkCourseUpdate {
  course_ids: string[];
  updates: {
    status?: CurriculumStatus;
    instructor_id?: string;
    tags?: string[];
    is_featured?: boolean;
    age_ranges?: string[];
    location_types?: string[];
    session_types?: string[];
  };
}

// Course API Service
export const courseApiService = {
  // Course CRUD Operations
  getCourses: async (params: CourseSearchParams = {}): Promise<PaginatedResponse<Course>> => {
    // Program context will be automatically injected by httpClient
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, value.toString()])
    ).toString();
    
    const response = await httpClient.get<PaginatedResponse<Course>>(
      `${API_ENDPOINTS.courses.list}${queryString ? `?${queryString}` : ''}`
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch courses');
  },

  getCourse: async (id: string): Promise<Course> => {
    // Program context automatically validated by backend
    const response = await httpClient.get<Course>(API_ENDPOINTS.courses.get(id));
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch course');
  },

  createCourse: async (data: CourseCreate): Promise<Course> => {
    // Program context will be automatically injected and validated
    const response = await httpClient.post<Course>(API_ENDPOINTS.courses.create, data);
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create course');
  },

  updateCourse: async (id: string, data: CourseUpdate): Promise<Course> => {
    // Program context ensures user can only update courses they have access to
    const response = await httpClient.put<Course>(API_ENDPOINTS.courses.update(id), data);
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update course');
  },

  deleteCourse: async (id: string): Promise<void> => {
    // Program context ensures user can only delete courses they have access to
    const response = await httpClient.delete(API_ENDPOINTS.courses.delete(id));
    
    if (!isApiSuccess(response)) {
      throw new Error(response.error || 'Failed to delete course');
    }
  },

  // Course Tree and Relationships
  getCourseTree: async (id: string): Promise<CourseTree> => {
    // Program context automatically validated by backend
    const response = await httpClient.get<CourseTree>(API_ENDPOINTS.courses.tree(id));
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch course tree');
  },

  duplicateCourse: async (id: string, options?: { include_curricula?: boolean; new_name?: string }): Promise<Course> => {
    // Program context ensures duplication within user's accessible programs
    const response = await httpClient.post<Course>(
      API_ENDPOINTS.courses.duplicate(id),
      options
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to duplicate course');
  },

  // Bulk Operations
  bulkUpdateCourses: async (data: BulkCourseUpdate): Promise<{ updated_count: number }> => {
    // Program context automatically applied to bulk operations
    const response = await httpClient.post<{ updated_count: number }>(
      API_ENDPOINTS.courses.bulkUpdate,
      data
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to bulk update courses');
  },

  // Statistics
  getCourseStats: async (params?: { program_id?: string; date_from?: string; date_to?: string }): Promise<CourseStats> => {
    // Program context will filter statistics automatically unless overridden
    const queryString = params ? new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, value.toString()])
    ).toString() : '';
    
    const response = await httpClient.get<CourseStats>(
      `${API_ENDPOINTS.courses.stats}${queryString ? `?${queryString}` : ''}`
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch course statistics');
  },

  // Curriculum Management within Courses
  getCourseCurricula: async (courseId: string, params: CurriculumSearchParams = {}): Promise<PaginatedResponse<Curriculum>> => {
    // Program context ensures user only sees curricula from accessible courses
    const searchParams = { ...params, course_id: courseId };
    const queryString = new URLSearchParams(
      Object.entries(searchParams).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, value.toString()])
    ).toString();
    
    const response = await httpClient.get<PaginatedResponse<Curriculum>>(
      `${API_ENDPOINTS.courses.curricula.list}${queryString ? `?${queryString}` : ''}`
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch course curricula');
  },

  // Search across all content
  searchCourseContent: async (courseId: string, query: string, contentTypes?: string[]): Promise<{
    courses: Course[];
    curricula: Curriculum[];
    levels: Level[];
    modules: Module[];
    sections: Section[];
    lessons: Lesson[];
    assessments: Assessment[];
  }> => {
    // Program context automatically limits search scope to accessible programs
    const params = new URLSearchParams({
      course_id: courseId,
      query,
      ...(contentTypes && { content_types: contentTypes.join(',') }),
    });
    
    const response = await httpClient.get<any>(
      `${API_ENDPOINTS.courses.advanced.search}?${params.toString()}`
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to search course content');
  },

  // Program Context Utilities
  /**
   * Get current program context being used for API calls
   */
  getCurrentProgramContext: (): string | null => {
    return programContextApi.getCurrentContext();
  },

  /**
   * Check if program context is currently set
   */
  hasProgramContext: (): boolean => {
    return programContextApi.hasContext();
  },

  /**
   * Temporarily make API calls with different program context (super admin only)
   */
  withProgramContext: async <T>(
    programId: string | null,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const originalContext = programContextApi.getCurrentContext();
    
    try {
      programContextApi.setContext(programId);
      return await apiCall();
    } finally {
      programContextApi.setContext(originalContext);
    }
  },
};