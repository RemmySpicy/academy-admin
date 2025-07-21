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
    logout: '/api/v1/auth/logout/',
    refresh: '/api/v1/auth/refresh/',
    me: '/api/v1/auth/me/',
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
  },
  programs: {
    list: '/api/v1/programs/',
    create: '/api/v1/programs/',
    get: (id: string) => `/api/v1/programs/${id}`,
    update: (id: string) => `/api/v1/programs/${id}`,
    delete: (id: string) => `/api/v1/programs/${id}`,
    stats: '/api/v1/programs/stats/',
    tree: (id: string) => `/api/v1/programs/${id}/tree`,
  },
  courses: {
    list: '/api/v1/courses/',
    create: '/api/v1/courses/',
    get: (id: string) => `/api/v1/courses/${id}`,
    update: (id: string) => `/api/v1/courses/${id}`,
    delete: (id: string) => `/api/v1/courses/${id}`,
    stats: '/api/v1/courses/stats/',
    tree: (id: string) => `/api/v1/courses/${id}/tree`,
    duplicate: (id: string) => `/api/v1/courses/${id}/duplicate`,
    bulkUpdate: '/api/v1/courses/bulk-update/',
    curricula: {
      list: '/api/v1/courses/curricula/',
      create: '/api/v1/courses/curricula/',
      get: (id: string) => `/api/v1/courses/curricula/${id}`,
      update: (id: string) => `/api/v1/courses/curricula/${id}`,
      delete: (id: string) => `/api/v1/courses/curricula/${id}`,
      stats: '/api/v1/courses/curricula/stats/',
      tree: (id: string) => `/api/v1/courses/curricula/${id}/tree`,
      duplicate: (id: string) => `/api/v1/courses/curricula/${id}/duplicate`,
      bulkUpdate: '/api/v1/courses/curricula/bulk-update/',
    },
    levels: {
      list: '/api/v1/courses/levels/',
      create: '/api/v1/courses/levels/',
      get: (id: string) => `/api/v1/courses/levels/${id}`,
      update: (id: string) => `/api/v1/courses/levels/${id}`,
      delete: (id: string) => `/api/v1/courses/levels/${id}`,
      reorder: '/api/v1/courses/levels/reorder/',
    },
    modules: {
      list: '/api/v1/courses/modules/',
      create: '/api/v1/courses/modules/',
      get: (id: string) => `/api/v1/courses/modules/${id}`,
      update: (id: string) => `/api/v1/courses/modules/${id}`,
      delete: (id: string) => `/api/v1/courses/modules/${id}`,
      reorder: '/api/v1/courses/modules/reorder/',
    },
    sections: {
      list: '/api/v1/courses/sections/',
      create: '/api/v1/courses/sections/',
      get: (id: string) => `/api/v1/courses/sections/${id}`,
      update: (id: string) => `/api/v1/courses/sections/${id}`,
      delete: (id: string) => `/api/v1/courses/sections/${id}`,
      reorder: '/api/v1/courses/sections/reorder/',
    },
    lessons: {
      list: '/api/v1/courses/lessons/',
      create: '/api/v1/courses/lessons/',
      get: (id: string) => `/api/v1/courses/lessons/${id}`,
      update: (id: string) => `/api/v1/courses/lessons/${id}`,
      delete: (id: string) => `/api/v1/courses/lessons/${id}`,
      reorder: '/api/v1/courses/lessons/reorder/',
      duplicate: (id: string) => `/api/v1/courses/lessons/${id}/duplicate`,
      progress: (id: string) => `/api/v1/courses/lessons/${id}/progress`,
    },
    assessments: {
      list: '/api/v1/courses/assessments/',
      create: '/api/v1/courses/assessments/',
      get: (id: string) => `/api/v1/courses/assessments/${id}`,
      update: (id: string) => `/api/v1/courses/assessments/${id}`,
      delete: (id: string) => `/api/v1/courses/assessments/${id}`,
      criteria: {
        list: (assessmentId: string) => `/api/v1/courses/assessments/${assessmentId}/criteria`,
        create: (assessmentId: string) => `/api/v1/courses/assessments/${assessmentId}/criteria`,
        update: (criteriaId: string) => `/api/v1/courses/criteria/${criteriaId}`,
        delete: (criteriaId: string) => `/api/v1/courses/criteria/${criteriaId}`,
        reorder: (assessmentId: string) => `/api/v1/courses/assessments/${assessmentId}/criteria/reorder`,
      },
      submissions: {
        list: (assessmentId: string) => `/api/v1/courses/assessments/${assessmentId}/submissions`,
        create: (assessmentId: string) => `/api/v1/courses/assessments/${assessmentId}/submissions`,
        get: (submissionId: string) => `/api/v1/courses/submissions/${submissionId}`,
        grade: (submissionId: string) => `/api/v1/courses/submissions/${submissionId}/grade`,
      },
    },
    equipment: {
      list: '/api/v1/courses/equipment/',
      create: '/api/v1/courses/equipment/',
      get: (id: string) => `/api/v1/courses/equipment/${id}`,
      update: (id: string) => `/api/v1/courses/equipment/${id}`,
      delete: (id: string) => `/api/v1/courses/equipment/${id}`,
      requirements: {
        list: '/api/v1/courses/equipment/requirements/',
        create: '/api/v1/courses/equipment/requirements/',
        update: (id: string) => `/api/v1/courses/equipment/requirements/${id}`,
        delete: (id: string) => `/api/v1/courses/equipment/requirements/${id}`,
      },
    },
    media: {
      list: '/api/v1/courses/media/',
      upload: '/api/v1/courses/media/upload/',
      get: (id: string) => `/api/v1/courses/media/${id}`,
      delete: (id: string) => `/api/v1/courses/media/${id}`,
      folders: '/api/v1/courses/media/folders/',
    },
    versions: {
      list: '/api/v1/courses/content-versions/',
      create: '/api/v1/courses/content-versions/',
      get: (id: string) => `/api/v1/courses/content-versions/${id}`,
      restore: (id: string) => `/api/v1/courses/content-versions/${id}/restore`,
      compare: '/api/v1/courses/content-versions/compare/',
    },
    advanced: {
      search: '/api/v1/courses/advanced/search/',
      export: '/api/v1/courses/advanced/export/',
      import: '/api/v1/courses/advanced/import/',
      analytics: '/api/v1/courses/advanced/analytics/',
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
  facilities: {
    list: '/api/v1/facilities',
    create: '/api/v1/facilities',
    get: (id: string) => `/api/v1/facilities/${id}`,
    update: (id: string) => `/api/v1/facilities/${id}`,
    delete: (id: string) => `/api/v1/facilities/${id}`,
    stats: '/api/v1/facilities/stats',
  },
  health: '/api/v1/health/',
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