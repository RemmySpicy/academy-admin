/**
 * Course management types
 * Derived from backend course models and schemas
 */

import { AuditFields, Status } from './common';

/**
 * Course entity
 */
export interface Course extends AuditFields {
  program_id: string;
  name: string;
  description: string;
  code?: string;
  level: number;
  duration_hours?: number;
  prerequisites?: string[];
  is_active: boolean;
  course_type: CourseType;
  difficulty_level: DifficultyLevel;
  max_students?: number;
  current_enrollment?: number;
  instructor_ids?: string[];
  metadata?: Record<string, any>;
}

/**
 * Course types
 */
export type CourseType = 
  | 'core'
  | 'elective' 
  | 'workshop'
  | 'seminar'
  | 'lab'
  | 'project'
  | 'assessment';

/**
 * Course difficulty levels
 */
export type DifficultyLevel = 
  | 'beginner'
  | 'intermediate' 
  | 'advanced'
  | 'expert';

/**
 * Course creation request
 */
export interface CreateCourseRequest {
  program_id: string;
  name: string;
  description: string;
  code?: string;
  level: number;
  duration_hours?: number;
  prerequisites?: string[];
  is_active?: boolean;
  course_type: CourseType;
  difficulty_level: DifficultyLevel;
  max_students?: number;
  instructor_ids?: string[];
  metadata?: Record<string, any>;
}

/**
 * Course update request
 */
export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  code?: string;
  level?: number;
  duration_hours?: number;
  prerequisites?: string[];
  is_active?: boolean;
  course_type?: CourseType;
  difficulty_level?: DifficultyLevel;
  max_students?: number;
  instructor_ids?: string[];
  metadata?: Record<string, any>;
}

/**
 * Course with detailed information
 */
export interface CourseDetail extends Course {
  curricula: Curriculum[];
  modules: Module[];
  lessons: Lesson[];
  assessments: Assessment[];
  enrollments: CourseEnrollment[];
  instructors: CourseInstructor[];
}

/**
 * Curriculum within a course
 */
export interface Curriculum extends AuditFields {
  course_id: string;
  program_id: string;
  name: string;
  description: string;
  sequence_order: number;
  is_required: boolean;
  estimated_hours?: number;
}

/**
 * Module within a curriculum
 */
export interface Module extends AuditFields {
  curriculum_id: string;
  program_id: string;
  name: string;
  description: string;
  sequence_order: number;
  learning_objectives?: string[];
  estimated_hours?: number;
}

/**
 * Lesson within a module
 */
export interface Lesson extends AuditFields {
  module_id: string;
  program_id: string;
  name: string;
  content: string;
  lesson_type: LessonType;
  sequence_order: number;
  duration_minutes?: number;
  materials_required?: string[];
  homework_assigned?: boolean;
}

/**
 * Lesson types
 */
export type LessonType = 
  | 'lecture'
  | 'practical'
  | 'discussion'
  | 'presentation'
  | 'exercise'
  | 'review'
  | 'assessment';

/**
 * Assessment/assignment
 */
export interface Assessment extends AuditFields {
  course_id: string;
  program_id: string;
  name: string;
  description: string;
  assessment_type: AssessmentType;
  max_score: number;
  passing_score?: number;
  due_date?: string;
  is_required: boolean;
  instructions?: string;
  rubric?: AssessmentRubric[];
}

/**
 * Assessment types
 */
export type AssessmentType = 
  | 'quiz'
  | 'test'
  | 'assignment'
  | 'project'
  | 'presentation'
  | 'practical'
  | 'portfolio';

/**
 * Assessment rubric criteria
 */
export interface AssessmentRubric {
  id: string;
  criteria: string;
  description: string;
  max_points: number;
  scoring_levels: {
    level: string;
    points: number;
    description: string;
  }[];
}

/**
 * Course enrollment
 */
export interface CourseEnrollment extends AuditFields {
  course_id: string;
  student_id: string;
  enrolled_at: string;
  status: 'enrolled' | 'completed' | 'dropped' | 'failed';
  completion_date?: string;
  grade?: string;
  progress_percentage: number;
  attendance_count?: number;
  total_sessions?: number;
}

/**
 * Course instructor assignment
 */
export interface CourseInstructor extends AuditFields {
  course_id: string;
  user_id: string;
  instructor_name: string;
  role: 'primary' | 'assistant' | 'guest';
  assigned_at: string;
  expertise_areas?: string[];
}

/**
 * Student progress in course
 */
export interface StudentCourseProgress {
  course_id: string;
  student_id: string;
  overall_progress: number;
  modules_completed: number;
  total_modules: number;
  lessons_completed: number;
  total_lessons: number;
  assessments_completed: number;
  total_assessments: number;
  current_grade?: number;
  last_activity: string;
}

/**
 * Course statistics
 */
export interface CourseStats {
  total_courses: number;
  active_courses: number;
  total_enrollments: number;
  completion_rate: number;
  average_rating?: number;
  courses_by_type: Record<CourseType, number>;
  difficulty_distribution: Record<DifficultyLevel, number>;
}