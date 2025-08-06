/**
 * Application constants for Academy Admin Frontend
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_VERSION = 'v1';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    programAssignments: '/api/v1/auth/me/program-assignments',
    userProgramAssignments: '/api/v1/auth/user-program-assignments',
    userDefaultProgram: (userId: string) => `/api/v1/auth/users/${userId}/default-program`,
    userProgramAccess: (userId: string, programId: string) => `/api/v1/auth/users/${userId}/program-access/${programId}`,
    users: '/api/v1/auth/users',
    createUser: '/api/v1/auth/users',
    updateUser: (userId: string) => `/api/v1/auth/users/${userId}`,
    deleteUser: (userId: string) => `/api/v1/auth/users/${userId}`,
    getUser: (userId: string) => `/api/v1/auth/users/${userId}`,
    changePassword: '/api/v1/auth/change-password',
  },
  students: {
    list: '/api/v1/students',
    create: '/api/v1/students',
    get: (id: string) => `/api/v1/students/${id}`,
    update: (id: string) => `/api/v1/students/${id}`,
    delete: (id: string) => `/api/v1/students/${id}`,
    stats: '/api/v1/students/stats',
    family: (id: string) => `/api/v1/students/${id}/family`,
  },
  users: {
    list: '/api/v1/users',
    create: '/api/v1/users',
    get: (id: string) => `/api/v1/users/${id}`,
    update: (id: string) => `/api/v1/users/${id}`,
    delete: (id: string) => `/api/v1/users/${id}`,
    stats: '/api/v1/users/stats',
  },
  programs: {
    list: '/api/v1/programs',
    create: '/api/v1/programs',
    get: (id: string) => `/api/v1/programs/${id}`,
    update: (id: string) => `/api/v1/programs/${id}`,
    delete: (id: string) => `/api/v1/programs/${id}`,
    stats: '/api/v1/programs/stats',
    tree: (id: string) => `/api/v1/programs/${id}/tree`,
  },
  courses: {
    list: '/api/v1/courses',
    create: '/api/v1/courses',
    get: (id: string) => `/api/v1/courses/${id}`,
    update: (id: string) => `/api/v1/courses/${id}`,
    delete: (id: string) => `/api/v1/courses/${id}`,
    stats: '/api/v1/courses/stats',
    tree: (id: string) => `/api/v1/courses/${id}/tree`,
    duplicate: (id: string) => `/api/v1/courses/${id}/duplicate`,
    bulkUpdate: '/api/v1/courses/bulk-update',
    advanced: {
      search: '/api/v1/courses/advanced/search',
      export: '/api/v1/courses/advanced/export',
      import: '/api/v1/courses/advanced/import',
      analytics: '/api/v1/courses/advanced/analytics',
    },
  },
  parents: {
    list: '/api/v1/parents',
    create: '/api/v1/parents',
    get: (id: string) => `/api/v1/parents/${id}`,
    update: (id: string) => `/api/v1/parents/${id}`,
    delete: (id: string) => `/api/v1/parents/${id}`,
    stats: '/api/v1/parents/stats',
    family: (id: string) => `/api/v1/parents/${id}/family`,
    bulkAction: '/api/v1/parents/bulk-action',
    export: '/api/v1/parents/export',
  },
  teams: {
    members: '/api/v1/teams/members',
    availableUsers: '/api/v1/teams/available-users',
    stats: '/api/v1/teams/stats',
    memberUpdate: (userId: string) => `/api/v1/teams/members/${userId}`,
  },
  analytics: {
    programSwitch: '/api/v1/analytics/program-switch',
  },
  curricula: {
    list: '/api/v1/curricula',
    create: '/api/v1/curricula',
    get: (id: string) => `/api/v1/curricula/${id}`,
    update: (id: string) => `/api/v1/curricula/${id}`,
    delete: (id: string) => `/api/v1/curricula/${id}`,
    stats: '/api/v1/curricula/stats',
    tree: (id: string) => `/api/v1/curricula/${id}/tree`,
    duplicate: (id: string) => `/api/v1/curricula/${id}/duplicate`,
    bulkUpdate: '/api/v1/curricula/bulk-update',
    levels: {
      list: '/api/v1/curricula/levels',
      create: '/api/v1/curricula/levels',
      get: (id: string) => `/api/v1/curricula/levels/${id}`,
      update: (id: string) => `/api/v1/curricula/levels/${id}`,
      delete: (id: string) => `/api/v1/curricula/levels/${id}`,
      reorder: '/api/v1/curricula/levels/reorder',
    },
    modules: {
      list: '/api/v1/curricula/modules',
      create: '/api/v1/curricula/modules',
      get: (id: string) => `/api/v1/curricula/modules/${id}`,
      update: (id: string) => `/api/v1/curricula/modules/${id}`,
      delete: (id: string) => `/api/v1/curricula/modules/${id}`,
      reorder: '/api/v1/curricula/modules/reorder',
    },
    sections: {
      list: '/api/v1/curricula/sections',
      create: '/api/v1/curricula/sections',
      get: (id: string) => `/api/v1/curricula/sections/${id}`,
      update: (id: string) => `/api/v1/curricula/sections/${id}`,
      delete: (id: string) => `/api/v1/curricula/sections/${id}`,
      reorder: '/api/v1/curricula/sections/reorder',
    },
  },
  content: {
    lessons: {
      list: '/api/v1/content/lessons',
      create: '/api/v1/content/lessons',
      get: (id: string) => `/api/v1/content/lessons/${id}`,
      update: (id: string) => `/api/v1/content/lessons/${id}`,
      delete: (id: string) => `/api/v1/content/lessons/${id}`,
      reorder: '/api/v1/content/lessons/reorder',
      duplicate: (id: string) => `/api/v1/content/lessons/${id}/duplicate`,
      progress: (id: string) => `/api/v1/content/lessons/${id}/progress`,
    },
    assessments: {
      list: '/api/v1/content/assessments',
      create: '/api/v1/content/assessments',
      get: (id: string) => `/api/v1/content/assessments/${id}`,
      update: (id: string) => `/api/v1/content/assessments/${id}`,
      delete: (id: string) => `/api/v1/content/assessments/${id}`,
      criteria: {
        list: (assessmentId: string) => `/api/v1/content/assessments/${assessmentId}/criteria`,
        create: (assessmentId: string) => `/api/v1/content/assessments/${assessmentId}/criteria`,
        update: (criteriaId: string) => `/api/v1/content/criteria/${criteriaId}`,
        delete: (criteriaId: string) => `/api/v1/content/criteria/${criteriaId}`,
        reorder: (assessmentId: string) => `/api/v1/content/assessments/${assessmentId}/criteria/reorder`,
      },
      submissions: {
        list: (assessmentId: string) => `/api/v1/content/assessments/${assessmentId}/submissions`,
        create: (assessmentId: string) => `/api/v1/content/assessments/${assessmentId}/submissions`,
        get: (submissionId: string) => `/api/v1/content/submissions/${submissionId}`,
        grade: (submissionId: string) => `/api/v1/content/submissions/${submissionId}/grade`,
      },
    },
    versions: {
      list: '/api/v1/content/versions',
      create: '/api/v1/content/versions',
      get: (id: string) => `/api/v1/content/versions/${id}`,
      restore: (id: string) => `/api/v1/content/versions/${id}/restore`,
      compare: '/api/v1/content/versions/compare',
    },
  },
  equipment: {
    list: '/api/v1/equipment',
    create: '/api/v1/equipment',
    get: (id: string) => `/api/v1/equipment/${id}`,
    update: (id: string) => `/api/v1/equipment/${id}`,
    delete: (id: string) => `/api/v1/equipment/${id}`,
    requirements: {
      list: '/api/v1/equipment/requirements',
      create: '/api/v1/equipment/requirements',
      update: (id: string) => `/api/v1/equipment/requirements/${id}`,
      delete: (id: string) => `/api/v1/equipment/requirements/${id}`,
    },
  },
  media: {
    list: '/api/v1/media',
    upload: '/api/v1/media/upload',
    get: (id: string) => `/api/v1/media/${id}`,
    delete: (id: string) => `/api/v1/media/${id}`,
    folders: '/api/v1/media/folders',
  },
  facilities: {
    list: '/api/v1/facilities',
    create: '/api/v1/facilities',
    get: (id: string) => `/api/v1/facilities/${id}`,
    update: (id: string) => `/api/v1/facilities/${id}`,
    delete: (id: string) => `/api/v1/facilities/${id}`,
    stats: '/api/v1/facilities/stats',
  },
  health: '/api/v1/health',
} as const;

// Authentication
export const AUTH_STORAGE_KEY = 'academy_admin_auth';
export const TOKEN_STORAGE_KEY = 'academy_admin_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'academy_admin_refresh_token';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Student Status
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

export const STUDENT_STATUS_LABELS = {
  [STUDENT_STATUS.ACTIVE]: 'Active',
  [STUDENT_STATUS.INACTIVE]: 'Inactive',
  [STUDENT_STATUS.PENDING]: 'Pending',
  [STUDENT_STATUS.SUSPENDED]: 'Suspended',
} as const;

export const STUDENT_STATUS_COLORS = {
  [STUDENT_STATUS.ACTIVE]: 'success',
  [STUDENT_STATUS.INACTIVE]: 'secondary',
  [STUDENT_STATUS.PENDING]: 'warning',
  [STUDENT_STATUS.SUSPENDED]: 'destructive',
} as const;

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STAFF: 'staff',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.INSTRUCTOR]: 'Instructor',
  [USER_ROLES.STAFF]: 'Staff',
} as const;

// Form Validation
export const VALIDATION_RULES = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters long',
    },
  },
  phone: {
    pattern: {
      value: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number',
    },
  },
  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters long',
    },
    maxLength: {
      value: 50,
      message: 'Name must be less than 50 characters',
    },
  },
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
} as const;

// Currency
export const CURRENCY = {
  CODE: 'NGN',
  SYMBOL: '₦',
  NAME: 'Nigerian Naira',
  FORMAT: (amount: number) => `₦${amount.toLocaleString('en-NG')}`,
} as const;

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    CREATED: 'Successfully created',
    UPDATED: 'Successfully updated',
    DELETED: 'Successfully deleted',
    SAVED: 'Successfully saved',
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    VALIDATION: 'Please check your input and try again.',
  },
} as const;