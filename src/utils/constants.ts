// Application constants

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'academy_auth_token',
  PROGRAM_CONTEXT: 'academy_current_program',
  USER_PREFERENCES: 'academy_user_preferences',
  THEME: 'academy_theme',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
  },
  PROGRAMS: {
    MY_PROGRAMS: '/programs/my-programs',
    DETAILS: (id: string) => `/programs/${id}`,
  },
  COURSES: {
    LIST: '/courses',
    DETAILS: (id: string) => `/courses/${id}`,
    MY_COURSES: '/courses/my-courses',
    ENROLL: (id: string) => `/courses/${id}/enroll`,
  },
  STUDENTS: {
    LIST: '/students',
    DETAILS: (id: string) => `/students/${id}`,
    PROGRESS: (id: string) => `/students/${id}/progress`,
  },
  ENROLLMENTS: {
    LIST: '/enrollments',
    DETAILS: (id: string) => `/enrollments/${id}`,
    PROGRESS: (id: string) => `/enrollments/${id}/progress`,
  },
} as const;

export const USER_TYPES = {
  STUDENT: 'student',
  PARENT: 'parent',
  TUTOR: 'tutor',
  COORDINATOR: 'coordinator',
  PROGRAM_ADMIN: 'program_admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SUSPENDED: 'suspended',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export const THEME_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#3B82F6',
  LIGHT: '#F8FAFC',
  DARK: '#1F2937',
} as const;

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
] as const;

export const AGE_GROUPS = [
  { label: 'Aqua Babies (6 months - 2 years)', value: 'aqua_babies' },
  { label: 'Toddlers (2 - 4 years)', value: 'toddlers' },
  { label: 'Pre-School (4 - 6 years)', value: 'pre_school' },
  { label: 'School Age (6 - 12 years)', value: 'school_age' },
  { label: 'Teenagers (13 - 17 years)', value: 'teenagers' },
  { label: 'Adults (18+ years)', value: 'adults' },
] as const;

export const SWIMMING_LEVELS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Competitive', value: 'competitive' },
] as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const FILE_UPLOAD = {
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif'],
  ALLOWED_DOCUMENT_TYPES: ['pdf', 'doc', 'docx'],
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^(\+234|0)[789][01]\d{8}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_AGE: 3,
  MAX_AGE: 100,
} as const;