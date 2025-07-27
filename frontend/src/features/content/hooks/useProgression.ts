/**
 * React hooks for the star-based curriculum progression system
 * 
 * These hooks provide integration with the progression API endpoints
 * for managing progression settings, student progress, assessments,
 * and analytics across the curriculum system.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpClient } from '@/lib/api/httpClient';

// Types
interface CurriculumProgressionSettings {
  id: string;
  curriculum_id: string;
  module_unlock_threshold_percentage: number;
  require_minimum_one_star_per_lesson: boolean;
  allow_cross_level_progression: boolean;
  allow_lesson_retakes: boolean;
  track_time_spent: boolean;
  track_attempts: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface LevelAssessmentCriteria {
  id: string;
  level_id: string;
  name: string;
  description: string;
  sequence_order: number;
  weight: number;
  max_score: number;
  min_passing_score: number;
  assessment_guidelines: string;
  score_descriptors: Array<{
    score: number;
    description: string;
  }>;
  status: string;
  weighted_max_score: number;
}

interface StudentLessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  stars_earned: number | null;
  is_completed: boolean;
  completion_date: string | null;
  last_attempt_date: string | null;
  attempt_count: number;
  total_time_spent_minutes: number | null;
  graded_by_instructor_id: string | null;
  graded_date: string | null;
  instructor_notes: string | null;
  student_name?: string;
  lesson_title?: string;
  instructor_name?: string;
}

interface StudentModuleUnlock {
  id: string;
  student_id: string;
  module_id: string;
  is_unlocked: boolean;
  unlocked_date: string | null;
  stars_earned: number;
  total_possible_stars: number;
  unlock_percentage: number;
  threshold_met: boolean;
  student_name?: string;
  module_name?: string;
}

interface StudentLevelAssessment {
  id: string;
  student_id: string;
  level_id: string;
  assessed_by_instructor_id: string;
  status: 'pending' | 'completed' | 'suspended' | 'passed' | 'failed';
  assessment_date: string | null;
  criteria_scores: Record<string, number>;
  overall_score: number | null;
  passed: boolean | null;
  can_continue_next_level: boolean;
  progression_suspended: boolean;
  suspension_reason: string | null;
  instructor_notes: string | null;
  remediation_notes: string | null;
  student_name?: string;
  level_name?: string;
  instructor_name?: string;
}

interface StudentProgressSummary {
  student_id: string;
  student_name: string;
  curriculum_id: string;
  curriculum_name: string;
  total_lessons: number;
  completed_lessons: number;
  graded_lessons: number;
  average_stars: number | null;
  total_modules: number;
  unlocked_modules: number;
  current_module: any | null;
  current_level: any | null;
  pending_assessments: any[];
  total_time_spent_minutes: number;
  last_activity_date: string | null;
  progress_percentage: number;
}

interface BulkGradingRequest {
  grades: Array<{
    student_id: string;
    lesson_id: string;
    stars_earned: number;
    notes?: string;
  }>;
  instructor_id: string;
}

// Query Keys
export const progressionKeys = {
  all: ['progression'] as const,
  settings: () => [...progressionKeys.all, 'settings'] as const,
  settingsByCurriculum: (curriculumId: string) => 
    [...progressionKeys.settings(), curriculumId] as const,
  
  criteria: () => [...progressionKeys.all, 'criteria'] as const,
  criteriaByLevel: (levelId: string) => 
    [...progressionKeys.criteria(), levelId] as const,
  
  lessonProgress: () => [...progressionKeys.all, 'lesson-progress'] as const,
  lessonProgressByStudent: (studentId: string, filters?: any) => 
    [...progressionKeys.lessonProgress(), studentId, filters] as const,
  
  moduleUnlocks: () => [...progressionKeys.all, 'module-unlocks'] as const,
  moduleUnlocksByStudent: (studentId: string, curriculumId?: string) => 
    [...progressionKeys.moduleUnlocks(), studentId, curriculumId] as const,
  
  levelAssessments: () => [...progressionKeys.all, 'level-assessments'] as const,
  levelAssessmentsByStudent: (studentId: string, curriculumId?: string) => 
    [...progressionKeys.levelAssessments(), studentId, curriculumId] as const,
  pendingAssessments: () => [...progressionKeys.levelAssessments(), 'pending'] as const,
  
  analytics: () => [...progressionKeys.all, 'analytics'] as const,
  studentSummary: (studentId: string, curriculumId: string) => 
    [...progressionKeys.analytics(), 'student-summary', studentId, curriculumId] as const,
  instructorDashboard: () => [...progressionKeys.analytics(), 'instructor-dashboard'] as const,
};

// Progression Settings Hooks
export function useProgressionSettings(curriculumId: string) {
  return useQuery({
    queryKey: progressionKeys.settingsByCurriculum(curriculumId),
    queryFn: async (): Promise<CurriculumProgressionSettings> => {
      const response = await httpClient.get(`/courses/progression/settings/curriculum/${curriculumId}`);
      return response.data.data;
    },
    enabled: !!curriculumId,
  });
}

export function useCreateProgressionSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      curriculum_id: string;
      module_unlock_threshold_percentage?: number;
      require_minimum_one_star_per_lesson?: boolean;
      allow_cross_level_progression?: boolean;
      allow_lesson_retakes?: boolean;
      track_time_spent?: boolean;
      track_attempts?: boolean;
    }): Promise<CurriculumProgressionSettings> => {
      const response = await httpClient.post('/courses/progression/settings', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.settingsByCurriculum(data.curriculum_id)
      });
      toast.success('Progression settings created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create progression settings');
    },
  });
}

export function useUpdateProgressionSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      settingsId, 
      data 
    }: { 
      settingsId: string; 
      data: Partial<CurriculumProgressionSettings> 
    }): Promise<CurriculumProgressionSettings> => {
      const response = await httpClient.put(`/courses/progression/settings/${settingsId}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.settingsByCurriculum(data.curriculum_id)
      });
      toast.success('Progression settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update progression settings');
    },
  });
}

// Assessment Criteria Hooks
export function useAssessmentCriteria(levelId: string) {
  return useQuery({
    queryKey: progressionKeys.criteriaByLevel(levelId),
    queryFn: async (): Promise<LevelAssessmentCriteria[]> => {
      const response = await httpClient.get(`/courses/progression/assessment-criteria/level/${levelId}`);
      return response.data.data.items;
    },
    enabled: !!levelId,
  });
}

export function useCreateAssessmentCriteria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      level_id: string;
      name: string;
      description?: string;
      sequence_order: number;
      weight?: number;
      max_score?: number;
      min_passing_score?: number;
      assessment_guidelines?: string;
      score_descriptors?: Array<{ score: number; description: string }>;
    }): Promise<LevelAssessmentCriteria> => {
      const response = await httpClient.post('/courses/progression/assessment-criteria', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.criteriaByLevel(data.level_id)
      });
      toast.success('Assessment criteria created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create assessment criteria');
    },
  });
}

// Student Lesson Progress Hooks
export function useStudentLessonProgress(
  studentId: string, 
  options: {
    curriculumId?: string;
    moduleId?: string;
  } = {}
) {
  return useQuery({
    queryKey: progressionKeys.lessonProgressByStudent(studentId, options),
    queryFn: async (): Promise<StudentLessonProgress[]> => {
      const params = new URLSearchParams();
      if (options.curriculumId) params.set('curriculum_id', options.curriculumId);
      if (options.moduleId) params.set('module_id', options.moduleId);
      
      const response = await httpClient.get(
        `/courses/progression/lesson-progress/student/${studentId}?${params}`
      );
      return response.data.data.items;
    },
    enabled: !!studentId,
  });
}

export function useGradeLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      studentId,
      lessonId,
      starsEarned,
      notes,
    }: {
      studentId: string;
      lessonId: string;
      starsEarned: number;
      notes?: string;
    }): Promise<StudentLessonProgress> => {
      const params = new URLSearchParams({
        student_id: studentId,
        lesson_id: lessonId,
        stars_earned: starsEarned.toString(),
      });
      if (notes) params.set('notes', notes);
      
      const response = await httpClient.post(`/courses/progression/lesson-progress/grade?${params}`);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.lessonProgressByStudent(data.student_id)
      });
      queryClient.invalidateQueries({
        queryKey: progressionKeys.moduleUnlocksByStudent(data.student_id)
      });
      toast.success('Lesson graded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to grade lesson');
    },
  });
}

export function useBulkGradeLessons() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: BulkGradingRequest): Promise<StudentLessonProgress[]> => {
      const response = await httpClient.post('/courses/progression/lesson-progress/bulk-grade', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate queries for all affected students
      const studentIds = [...new Set(data.map(progress => progress.student_id))];
      studentIds.forEach(studentId => {
        queryClient.invalidateQueries({
          queryKey: progressionKeys.lessonProgressByStudent(studentId)
        });
        queryClient.invalidateQueries({
          queryKey: progressionKeys.moduleUnlocksByStudent(studentId)
        });
      });
      toast.success(`Successfully graded ${data.length} lessons`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to bulk grade lessons');
    },
  });
}

// Module Unlocks Hooks
export function useStudentModuleUnlocks(
  studentId: string,
  curriculumId?: string
) {
  return useQuery({
    queryKey: progressionKeys.moduleUnlocksByStudent(studentId, curriculumId),
    queryFn: async (): Promise<StudentModuleUnlock[]> => {
      const params = new URLSearchParams();
      if (curriculumId) params.set('curriculum_id', curriculumId);
      
      const response = await httpClient.get(
        `/courses/progression/module-unlocks/student/${studentId}?${params}`
      );
      return response.data.data;
    },
    enabled: !!studentId,
  });
}

// Level Assessment Hooks
export function useStudentLevelAssessments(
  studentId: string,
  curriculumId?: string
) {
  return useQuery({
    queryKey: progressionKeys.levelAssessmentsByStudent(studentId, curriculumId),
    queryFn: async (): Promise<StudentLevelAssessment[]> => {
      const params = new URLSearchParams();
      if (curriculumId) params.set('curriculum_id', curriculumId);
      
      const response = await httpClient.get(
        `/courses/progression/level-assessments/student/${studentId}?${params}`
      );
      return response.data.data.items;
    },
    enabled: !!studentId,
  });
}

export function usePendingAssessments() {
  return useQuery({
    queryKey: progressionKeys.pendingAssessments(),
    queryFn: async (): Promise<StudentLevelAssessment[]> => {
      const response = await httpClient.get('/courses/progression/level-assessments/instructor/pending');
      return response.data.data.items;
    },
  });
}

export function useCreateLevelAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      level_id: string;
      assessed_by_instructor_id: string;
      criteria_scores?: Record<string, number>;
      instructor_notes?: string;
    }): Promise<StudentLevelAssessment> => {
      const response = await httpClient.post('/courses/progression/level-assessments', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.levelAssessmentsByStudent(data.student_id)
      });
      queryClient.invalidateQueries({
        queryKey: progressionKeys.pendingAssessments()
      });
      toast.success('Level assessment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create level assessment');
    },
  });
}

export function useCompleteLevelAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      assessmentId,
      criteriaScores,
      notes,
    }: {
      assessmentId: string;
      criteriaScores: Record<string, number>;
      notes?: string;
    }): Promise<StudentLevelAssessment> => {
      const response = await httpClient.put(
        `/courses/progression/level-assessments/${assessmentId}/complete`,
        { criteria_scores: criteriaScores, notes }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.levelAssessmentsByStudent(data.student_id)
      });
      queryClient.invalidateQueries({
        queryKey: progressionKeys.pendingAssessments()
      });
      toast.success('Level assessment completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to complete level assessment');
    },
  });
}

export function useSuspendStudentProgression() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      assessmentId,
      suspensionReason,
    }: {
      assessmentId: string;
      suspensionReason: string;
    }): Promise<StudentLevelAssessment> => {
      const params = new URLSearchParams({ suspension_reason: suspensionReason });
      const response = await httpClient.put(
        `/courses/progression/level-assessments/${assessmentId}/suspend?${params}`
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: progressionKeys.levelAssessmentsByStudent(data.student_id)
      });
      queryClient.invalidateQueries({
        queryKey: progressionKeys.pendingAssessments()
      });
      toast.success('Student progression suspended');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to suspend student progression');
    },
  });
}

// Analytics Hooks
export function useStudentProgressSummary(
  studentId: string,
  curriculumId: string
) {
  return useQuery({
    queryKey: progressionKeys.studentSummary(studentId, curriculumId),
    queryFn: async (): Promise<StudentProgressSummary> => {
      const response = await httpClient.get(
        `/courses/progression/analytics/student/${studentId}/summary?curriculum_id=${curriculumId}`
      );
      return response.data.data;
    },
    enabled: !!studentId && !!curriculumId,
  });
}

export function useInstructorDashboard() {
  return useQuery({
    queryKey: progressionKeys.instructorDashboard(),
    queryFn: async () => {
      const response = await httpClient.get('/courses/progression/analytics/instructor/dashboard');
      return response.data.data;
    },
  });
}