/**
 * Shared TypeScript types for Academy Admin ecosystem
 * 
 * This file contains type definitions shared across:
 * - Admin Dashboard (Next.js)
 * - Tutor App (React Native) 
 * - Student App (React Native)
 * 
 * Types are derived from backend Pydantic schemas to ensure consistency.
 */

// Re-export all types for easy importing
export * from './auth';
export * from './user';
export * from './program';
export * from './course';
export * from './student';
export * from './facility';
export * from './common';