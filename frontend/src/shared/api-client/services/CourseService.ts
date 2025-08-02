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
   * Enhanced enrollment with facility selection and payment tracking
   */
  async enrollStudentWithFacility(params: {
    user_id: string;
    course_id: string;
    facility_id?: string;
    location_type: 'our-facility' | 'client-location' | 'virtual';
    session_type: 'private' | 'group' | 'school_group';
    age_group: string;
    coupon_code?: string;
    assignment_type?: string;
    credits_awarded?: number;
    assignment_notes?: string;
    referral_source?: string;
    special_requirements?: string;
    notes?: string;
  }): Promise<ApiResponse<CourseEnrollment>> {
    return this.http.post<CourseEnrollment>('/course-assignments/assign', params);
  }

  /**
   * Remove course enrollment
   */
  async removeEnrollment(userId: string, courseId: string, reason?: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/course-assignments/remove/${userId}/${courseId}`, {
      data: { reason },
    });
  }

  /**
   * Validate facility availability for course enrollment
   */
  async validateFacilityAvailability(params: {
    course_id: string;
    facility_id: string;
    age_group: string;
    location_type: string;
    session_type: string;
  }): Promise<ApiResponse<{
    available: boolean;
    facility_name: string;
    reason?: string;
    price?: number;
    pricing_notes?: string;
    course_name?: string;
    course_description?: string;
    supported_age_groups?: string[];
    supported_location_types?: string[];
    supported_session_types?: string[];
    suggestion?: string;
  }>> {
    const { course_id, facility_id, ...queryParams } = params;
    return this.http.get(`/course-assignments/validate-facility-availability/${course_id}/${facility_id}`, {
      params: queryParams,
    });
  }

  /**
   * Check student age eligibility for course
   */
  async checkAgeEligibility(userId: string, courseId: string): Promise<ApiResponse<{
    eligible: boolean;
    reason?: string;
    student_age?: number;
    course_age_groups?: string[];
    applicable_age_groups: string[];
    recommended_age_group?: string;
  }>> {
    return this.http.get(`/course-assignments/student-age-eligibility/${userId}/${courseId}`);
  }

  /**
   * Get available facilities for a course
   */
  async getAvailableFacilities(params: {
    course_id: string;
    age_group: string;
    location_type: string;
    session_type: string;
  }): Promise<ApiResponse<Array<{
    facility_id: string;
    facility_name: string;
    address?: string;
    price: number;
    pricing_notes?: string;
    contact_phone?: string;
    operating_hours?: Record<string, any>;
  }>>> {
    const { course_id, ...queryParams } = params;
    return this.http.get(`/course-assignments/available-facilities/${course_id}`, {
      params: queryParams,
    });
  }

  /**
   * Calculate pricing for enrollment
   */
  async calculateEnrollmentPricing(params: {
    facility_id: string;
    course_id: string;
    age_group: string;
    location_type: string;
    session_type: string;
    coupon_code?: string;
  }): Promise<ApiResponse<{
    base_price: number;
    discount_amount: number;
    total_amount: number;
    coupon_code?: string;
    coupon_valid: boolean;
    coupon_message: string;
    payment_thresholds: Record<string, number>;
  }>> {
    return this.http.post('/course-assignments/calculate-pricing', params);
  }

  /**
   * Get student's default facility
   */
  async getStudentDefaultFacility(userId: string): Promise<ApiResponse<{
    facility_id?: string;
    facility_name?: string;
    last_used_date?: string;
    location_type?: string;
    session_type?: string;
  }>> {
    return this.http.get(`/course-assignments/student-default-facility/${userId}`);
  }

  /**
   * Get user's course assignments
   */
  async getUserAssignments(userId: string): Promise<ApiResponse<CourseEnrollment[]>> {
    return this.http.get(`/course-assignments/user-assignments/${userId}`, {
      useCache: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutes
    });
  }

  /**
   * Get courses available for assignment
   */
  async getAssignableCourses(): Promise<ApiResponse<Course[]>> {
    return this.http.get('/course-assignments/assignable-courses', {
      useCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Bulk enrollment operations
   */
  async bulkEnrollStudents(assignments: Array<{
    user_id: string;
    course_id: string;
    facility_id?: string;
    location_type: string;
    session_type: string;
    age_group: string;
    coupon_code?: string;
  }>): Promise<ApiResponse<{
    total_processed: number;
    total_successful: number;
    total_failed: number;
    successful_assignments: any[];
    failed_assignments: any[];
  }>> {
    return this.http.post('/course-assignments/bulk-assign', { assignments });
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