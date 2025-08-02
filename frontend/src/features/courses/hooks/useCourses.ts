/**
 * React hooks for course management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  courseApiService,
  type Course,
  type CourseCreate,
  type CourseUpdate,
  type CourseSearchParams,
  type BulkCourseUpdate,
  type CourseStats,
  type CourseTree
} from '../api/courseApiService';

// Query Keys
export const COURSE_QUERY_KEYS = {
  COURSES: 'courses',
  COURSE: 'course',
  COURSE_TREE: 'course-tree',
  COURSE_STATS: 'course-stats',
  COURSE_CURRICULA: 'course-curricula',
  COURSE_SEARCH: 'course-search',
} as const;

// Course List Hook
export const useCourses = (params: CourseSearchParams = {}) => {
  return useQuery({
    queryKey: [COURSE_QUERY_KEYS.COURSES, params],
    queryFn: () => courseApiService.getCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

// Single Course Hook
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: [COURSE_QUERY_KEYS.COURSE, id],
    queryFn: () => courseApiService.getCourse(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Course Tree Hook (with full hierarchy)
export const useCourseTree = (id: string) => {
  return useQuery({
    queryKey: [COURSE_QUERY_KEYS.COURSE_TREE, id],
    queryFn: () => courseApiService.getCourseTree(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1, // Only retry once to avoid auth issues
    retryOnMount: false, // Don't retry on component mount
  });
};

// Course Statistics Hook
export const useCourseStats = (params?: { program_id?: string; date_from?: string; date_to?: string }) => {
  return useQuery({
    queryKey: [COURSE_QUERY_KEYS.COURSE_STATS, params],
    queryFn: () => courseApiService.getCourseStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Course Curricula Hook
export const useCourseCurricula = (courseId: string, params: any = {}) => {
  return useQuery({
    queryKey: [COURSE_QUERY_KEYS.COURSE_CURRICULA, courseId, params],
    queryFn: () => courseApiService.getCourseCurricula(courseId, params),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};

// Course Content Search Hook
export const useCourseContentSearch = (courseId: string, query: string, contentTypes?: string[]) => {
  return useQuery({
    queryKey: [COURSE_QUERY_KEYS.COURSE_SEARCH, courseId, query, contentTypes],
    queryFn: () => courseApiService.searchCourseContent(courseId, query, contentTypes),
    enabled: !!courseId && !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create Course Mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CourseCreate) => courseApiService.createCourse(data),
    onSuccess: (newCourse) => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE_STATS] });
      
      // Update the cache with the new course
      queryClient.setQueryData([COURSE_QUERY_KEYS.COURSE, newCourse.id], newCourse);
    },
  });
};

// Update Course Mutation
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseUpdate }) => 
      courseApiService.updateCourse(id, data),
    onSuccess: (updatedCourse, variables) => {
      // Update the specific course in cache
      queryClient.setQueryData([COURSE_QUERY_KEYS.COURSE, variables.id], updatedCourse);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE_TREE, variables.id] });
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE_STATS] });
      
      toast.success('Course updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update course: ${error.message}`);
    },
  });
};

// Delete Course Mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => courseApiService.deleteCourse(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE, deletedId] });
      queryClient.removeQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE_TREE, deletedId] });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE_STATS] });
      
      toast.success('Course deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete course: ${error.message}`);
    },
  });
};

// Duplicate Course Mutation
export const useDuplicateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, options }: { id: string; options?: { include_curricula?: boolean; new_name?: string } }) =>
      courseApiService.duplicateCourse(id, options),
    onSuccess: (duplicatedCourse) => {
      // Invalidate courses list to show the new course
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE_STATS] });
      
      // Add the new course to cache
      queryClient.setQueryData([COURSE_QUERY_KEYS.COURSE, duplicatedCourse.id], duplicatedCourse);
      
      toast.success('Course duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate course: ${error.message}`);
    },
  });
};

// Bulk Update Courses Mutation
export const useBulkUpdateCourses = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BulkCourseUpdate) => courseApiService.bulkUpdateCourses(data),
    onSuccess: (result) => {
      // Invalidate all course-related queries
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE_STATS] });
      
      // Invalidate individual course queries for updated courses
      data.course_ids.forEach(id => {
        queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE, id] });
        queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEYS.COURSE_TREE, id] });
      });
      
      toast.success(`${result.updated_count} courses updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update courses: ${error.message}`);
    },
  });
};

// Convenience hook for course management
export const useCourseManagement = (params: CourseSearchParams = {}) => {
  const courses = useCourses(params);
  const stats = useCourseStats();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const duplicateCourse = useDuplicateCourse();
  const bulkUpdateCourses = useBulkUpdateCourses();
  
  return {
    // Data
    courses: courses.data?.items || [],
    stats: stats.data,
    pagination: {
      page: courses.data?.page || 1,
      limit: courses.data?.limit || 20,
      total: courses.data?.total || 0,
      total_pages: courses.data?.total_pages || 0,
      has_next: courses.data?.has_next || false,
      has_prev: courses.data?.has_prev || false,
    },
    
    // Loading states
    isLoading: courses.isLoading,
    isLoadingStats: stats.isLoading,
    
    // Error states
    error: courses.error,
    statsError: stats.error,
    
    // Mutations
    createCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
    bulkUpdateCourses,
    
    // Actions
    refetch: courses.refetch,
    refetchStats: stats.refetch,
    
    // Computed values
    totalCourses: courses.data?.total || 0,
    publishedCourses: stats.data?.published_courses || 0,
    draftCourses: stats.data?.draft_courses || 0,
    averageCompletionRate: stats.data?.average_completion_rate || 0,
  };
};

// Hook for course detail page with tree data
export const useCourseDetail = (id: string) => {
  const course = useCourse(id);
  // Remove old courseTree and curricula calls - curricula is now separate
  // const courseTree = useCourseTree(id);
  // const curricula = useCourseCurricula(id);
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  
  return {
    // Core data
    course: course.data,
    // Remove old hierarchy data
    courseTree: null,
    curricula: [],
    
    // Loading states
    isLoading: course.isLoading,
    isCurriculaLoading: false,
    
    // Error states
    error: course.error,
    curriculaError: null,
    
    // Mutations
    updateCourse,
    deleteCourse,
    
    // Actions
    refetch: () => {
      course.refetch();
      // Remove old refetch calls
    },
    
    // Computed values - reset to 0 since curricula is separate now
    totalCurricula: 0,
    totalLevels: 0,
    totalModules: 0,
    totalLessons: 0,
  };
};