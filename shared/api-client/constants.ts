/**
 * Constants for API client
 */

// API Configuration
export const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY: 1000, // 1 second
  DEFAULT_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50,
  MAX_RETRY_DELAY: 30000, // 30 seconds
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login/json',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    RESET_PASSWORD: '/auth/password-reset',
    VERIFY: '/auth/verify',
  },
  
  // Programs
  PROGRAMS: {
    LIST: '/programs',
    DETAIL: (id: string) => `/programs/${id}`,
    STATS: '/programs/stats',
    MY_PROGRAMS: '/programs/my-programs',
    ACTIVITY: (id: string) => `/programs/${id}/activity`,
    ENROLLMENTS: (id: string) => `/programs/${id}/enrollments`,
    USERS: (id: string) => `/programs/${id}/users`,
    SEARCH: '/programs/search',
    FEATURED: '/programs/featured',
  },
  
  // Courses
  COURSES: {
    LIST: '/courses',
    DETAIL: (id: string) => `/courses/${id}`,
    STATS: '/courses/stats',
    ASSIGNED: '/courses/assigned',
    ENROLLED: '/courses/enrolled',
    CURRICULA: (id: string) => `/courses/${id}/curricula`,
    ASSESSMENTS: (id: string) => `/courses/${id}/assessments`,
  },
  
  // Students
  STUDENTS: {
    LIST: '/students',
    DETAIL: (id: string) => `/students/${id}`,
    STATS: '/students/stats',
    MY_PROFILE: '/students/me',
    ATTENDANCE: (id: string) => `/students/${id}/attendance`,
    ASSESSMENTS: (id: string) => `/students/${id}/assessments`,
    PARENTS: (id: string) => `/students/${id}/parents`,
    COMMUNICATIONS: (id: string) => `/students/${id}/communications`,
    SEARCH: '/students/search',
    BULK: '/students/bulk',
    EXPORT: '/students/export',
  },
  
  // Facilities
  FACILITIES: {
    LIST: '/facilities',
    DETAIL: (id: string) => `/facilities/${id}`,
    STATS: '/facilities/stats',
    BOOKINGS: (id: string) => `/facilities/${id}/bookings`,
    AVAILABILITY: (id: string) => `/facilities/${id}/availability`,
    EQUIPMENT: (id: string) => `/facilities/${id}/equipment`,
    UTILIZATION: (id: string) => `/facilities/${id}/utilization`,
    SEARCH: '/facilities/search',
    AVAILABLE: '/facilities/available',
  },
  
  // Users
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    STATS: '/users/stats',
    PROFILE: '/users/profile',
    PROGRAMS: (id: string) => `/users/${id}/programs`,
    TEAM: '/users/team',
    ACTIVITY: (id: string) => `/users/${id}/activity`,
    SESSIONS: (id: string) => `/users/${id}/sessions`,
    SEARCH: '/users/search',
    BULK_UPDATE: '/users/bulk-update',
    EXPORT: '/users/export',
  },
  
  // Communications
  COMMUNICATIONS: {
    LIST: '/communications',
    DETAIL: (id: string) => `/communications/${id}`,
    SEND: '/communications/send',
    REPLY: (id: string) => `/communications/${id}/reply`,
    MY_MESSAGES: '/communications/my-messages',
    UNREAD_COUNT: '/communications/unread-count',
    TEMPLATES: '/communications/templates',
    BULK_SCHEDULE: '/communications/bulk-schedule',
    STATS: '/communications/stats',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
  PROGRAM_CONTEXT_ERROR: 'PROGRAM_CONTEXT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  PROGRAM_ADMIN: 'program_admin',
  PROGRAM_COORDINATOR: 'program_coordinator',
  TUTOR: 'instructor',
  STUDENT: 'student',
  PARENT: 'parent',
} as const;

// Student Status
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  WITHDRAWN: 'withdrawn',
  SUSPENDED: 'suspended',
  ON_HOLD: 'on_hold',
} as const;

// Course Types
export const COURSE_TYPES = {
  CORE: 'core',
  ELECTIVE: 'elective',
  WORKSHOP: 'workshop',
  SEMINAR: 'seminar',
  LAB: 'lab',
  PROJECT: 'project',
  ASSESSMENT: 'assessment',
} as const;

// Facility Types
export const FACILITY_TYPES = {
  POOL: 'pool',
  COURT: 'court',
  GYM: 'gym',
  FIELD: 'field',
  CLASSROOM: 'classroom',
  LAB: 'lab',
  LIBRARY: 'library',
  AUDITORIUM: 'auditorium',
  WORKSHOP: 'workshop',
  OUTDOOR_SPACE: 'outdoor_space',
} as const;

// Communication Types
export const COMMUNICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PHONE_CALL: 'phone_call',
  IN_PERSON: 'in_person',
  APP_NOTIFICATION: 'app_notification',
  PARENT_CONFERENCE: 'parent_conference',
  PROGRESS_REPORT: 'progress_report',
} as const;

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  EARLY_DEPARTURE: 'early_departure',
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_INFO: 'user_info',
  PROGRAM_CONTEXT: 'program_context',
  PROGRAMS: 'programs',
  COURSES: 'courses',
  STUDENTS: 'students',
  FACILITIES: 'facilities',
  TEAM_MEMBERS: 'team_members',
  COMMUNICATIONS: 'communications',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'academy_access_token',
  REFRESH_TOKEN: 'academy_refresh_token',
  TOKEN_EXPIRES_AT: 'academy_token_expires_at',
  PROGRAM_CONTEXT: 'academy_program_context',
  USER_PREFERENCES: 'academy_user_preferences',
  OFFLINE_QUEUE: 'academy_offline_queue',
} as const;

// HTTP Headers
export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  PROGRAM_CONTEXT: 'X-Program-Context',
  BYPASS_PROGRAM_FILTER: 'X-Bypass-Program-Filter',
  REQUEST_ID: 'X-Request-ID',
  USER_AGENT: 'User-Agent',
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  PDF: 'application/pdf',
  CSV: 'text/csv',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
} as const;

// Date Formats
export const DATE_FORMATS = {
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large files
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 254,
  PHONE_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  NOTES_MAX_LENGTH: 2000,
} as const;

// Feature Flags (for mobile app differences)
export const FEATURES = {
  OFFLINE_SUPPORT: 'offline_support',
  PUSH_NOTIFICATIONS: 'push_notifications',
  BIOMETRIC_AUTH: 'biometric_auth',
  BACKGROUND_SYNC: 'background_sync',
  CAMERA_INTEGRATION: 'camera_integration',
  GPS_TRACKING: 'gps_tracking',
  REAL_TIME_MESSAGING: 'real_time_messaging',
} as const;

// App-specific Constants
export const APPS = {
  ADMIN_DASHBOARD: 'admin_dashboard',
  TUTOR_MOBILE: 'tutor_mobile',
  STUDENT_MOBILE: 'student_mobile',
  PARENT_MOBILE: 'parent_mobile',
} as const;