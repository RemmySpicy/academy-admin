/**
 * Course management service for API client
 */

import { HttpClient } from '../core/HttpClient';
import { ApiResponse } from '../core/types';
import { 
  Course, 
  CourseDetail, 
  CreateCourseRequest, 
  UpdateCourseRequest,
  CourseStats,
  Curriculum,
  Module,
  Lesson,
  Assessment,
  CourseEnrollment,
  StudentCourseProgress,
  PaginatedResponse
} from '../../types';

export class CourseService {
  constructor(private http: HttpClient) {}

  /**
   * Get all courses (program-filtered automatically)
   */
  async getCourses(params?: {
    search?: string;
    course_type?: string;
    difficulty_level?: string;
    is_active?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Course>>> {
    return this.http.get<PaginatedResponse<Course>>('/courses', {
      params,
      useCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Get specific course by ID
   */
  async getCourse(courseId: string): Promise<ApiResponse<CourseDetail>> {
    return this.http.get<CourseDetail>(`/courses/${courseId}`, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Create new course
   */
  async createCourse(courseData: CreateCourseRequest): Promise<ApiResponse<Course>> {
    return this.http.post<Course>('/courses', courseData);
  }

  /**
   * Update existing course
   */
  async updateCourse(courseId: string, updates: UpdateCourseRequest): Promise<ApiResponse<Course>> {
    return this.http.put<Course>(`/courses/${courseId}`, updates);
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/courses/${courseId}`);
  }

  /**
   * Get course statistics
   */
  async getCourseStats(): Promise<ApiResponse<CourseStats>> {
    return this.http.get<CourseStats>('/courses/stats', {
      useCache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }

  /**
   * Get courses assigned to current tutor
   */
  async getAssignedCourses(): Promise<ApiResponse<Course[]>> {
    return this.http.get<Course[]>('/courses/assigned', {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Get courses enrolled by student
   */
  async getEnrolledCourses(studentId?: string): Promise<ApiResponse<CourseEnrollment[]>> {
    const endpoint = studentId ? `/courses/enrolled/${studentId}` : '/courses/enrolled';
    return this.http.get<CourseEnrollment[]>(endpoint, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Enroll student in course
   */
  async enrollStudent(courseId: string, studentId: string): Promise<ApiResponse<CourseEnrollment>> {
    return this.http.post<CourseEnrollment>(`/courses/${courseId}/enroll`, {
      student_id: studentId,
    });
  }

  /**
   * Unenroll student from course
   */
  async unenrollStudent(courseId: string, studentId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/courses/${courseId}/enroll/${studentId}`);
  }

  /**
   * Get student progress in course
   */
  async getStudentProgress(courseId: string, studentId: string): Promise<ApiResponse<StudentCourseProgress>> {
    return this.http.get<StudentCourseProgress>(`/courses/${courseId}/progress/${studentId}`, {
      useCache: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutes
    });
  }

  /**
   * Update student progress
   */
  async updateStudentProgress(
    courseId: string, 
    studentId: string, 
    progress: Partial<StudentCourseProgress>
  ): Promise<ApiResponse<StudentCourseProgress>> {
    return this.http.patch<StudentCourseProgress>(`/courses/${courseId}/progress/${studentId}`, progress);
  }

  // Curriculum Management

  /**
   * Get curricula for a course
   */
  async getCourseCurricula(courseId: string): Promise<ApiResponse<Curriculum[]>> {
    return this.http.get<Curriculum[]>(`/courses/${courseId}/curricula`, {
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }

  /**
   * Create curriculum for course
   */
  async createCurriculum(courseId: string, curriculumData: Omit<Curriculum, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Curriculum>> {
    return this.http.post<Curriculum>(`/courses/${courseId}/curricula`, curriculumData);
  }

  /**
   * Update curriculum
   */
  async updateCurriculum(curriculumId: string, updates: Partial<Curriculum>): Promise<ApiResponse<Curriculum>> {
    return this.http.put<Curriculum>(`/curricula/${curriculumId}`, updates);
  }

  /**
   * Delete curriculum
   */
  async deleteCurriculum(curriculumId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/curricula/${curriculumId}`);
  }

  // Module Management

  /**
   * Get modules for a curriculum
   */
  async getCurriculumModules(curriculumId: string): Promise<ApiResponse<Module[]>> {
    return this.http.get<Module[]>(`/curricula/${curriculumId}/modules`, {
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }

  /**
   * Create module for curriculum
   */
  async createModule(curriculumId: string, moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Module>> {
    return this.http.post<Module>(`/curricula/${curriculumId}/modules`, moduleData);
  }

  /**
   * Update module
   */
  async updateModule(moduleId: string, updates: Partial<Module>): Promise<ApiResponse<Module>> {
    return this.http.put<Module>(`/modules/${moduleId}`, updates);
  }

  /**
   * Delete module
   */
  async deleteModule(moduleId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/modules/${moduleId}`);
  }

  // Lesson Management

  /**
   * Get lessons for a module
   */
  async getModuleLessons(moduleId: string): Promise<ApiResponse<Lesson[]>> {
    return this.http.get<Lesson[]>(`/modules/${moduleId}/lessons`, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Create lesson for module
   */
  async createLesson(moduleId: string, lessonData: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Lesson>> {
    return this.http.post<Lesson>(`/modules/${moduleId}/lessons`, lessonData);
  }

  /**
   * Update lesson
   */
  async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    return this.http.put<Lesson>(`/lessons/${lessonId}`, updates);
  }

  /**
   * Delete lesson
   */
  async deleteLesson(lessonId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/lessons/${lessonId}`);
  }

  // Assessment Management

  /**
   * Get assessments for a course
   */
  async getCourseAssessments(courseId: string): Promise<ApiResponse<Assessment[]>> {
    return this.http.get<Assessment[]>(`/courses/${courseId}/assessments`, {
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }

  /**
   * Create assessment for course
   */
  async createAssessment(courseId: string, assessmentData: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Assessment>> {
    return this.http.post<Assessment>(`/courses/${courseId}/assessments`, assessmentData);
  }

  /**
   * Update assessment
   */
  async updateAssessment(assessmentId: string, updates: Partial<Assessment>): Promise<ApiResponse<Assessment>> {
    return this.http.put<Assessment>(`/assessments/${assessmentId}`, updates);
  }

  /**
   * Delete assessment
   */
  async deleteAssessment(assessmentId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/assessments/${assessmentId}`);
  }

  /**
   * Submit assessment for student
   */
  async submitAssessment(
    assessmentId: string, 
    studentId: string, 
    submission: any
  ): Promise<ApiResponse<any>> {
    return this.http.post(`/assessments/${assessmentId}/submit`, {
      student_id: studentId,
      submission,
    });
  }

  /**
   * Grade assessment submission
   */
  async gradeAssessment(
    assessmentId: string, 
    studentId: string, 
    grade: {
      score: number;
      feedback?: string;
      rubric_scores?: Record<string, number>;
    }
  ): Promise<ApiResponse<any>> {
    return this.http.post(`/assessments/${assessmentId}/grade`, {
      student_id: studentId,
      ...grade,
    });
  }
}