# Academy Mobile Shared Library

Shared components, hooks, services, and utilities for Academy Management System mobile applications.

## Overview

This library provides reusable components and functionality shared between:
- **Academy Instructors App** - For tutors and coordinators
- **Academy Students App** - For students and parents

## Architecture

Built for multi-program academy management with:
- Program context support
- Role-based access control
- Consistent API integration
- Shared UI components
- Common utilities and hooks

## Structure

```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Form components (inputs, validation)
│   ├── modals/         # Modal components
│   └── elements/       # Basic UI elements
├── hooks/              # Custom React hooks
├── services/           # API services and HTTP clients
├── types/              # TypeScript type definitions
├── utils/              # Helper functions and utilities
└── index.ts            # Main exports
```

## Usage

### In Mobile Apps

```typescript
// Import shared components
import { CustomInput, CustomButton } from '@academy/mobile-shared';

// Import shared hooks
import { useAuth, useApiClient } from '@academy/mobile-shared';

// Import shared services
import { authService, apiClient } from '@academy/mobile-shared';
```

### Development

This library is managed as a git subtree in the main academy-admin repository for development convenience.

## Features

- ✅ **Form Components** - Validated input fields, dropdowns, checkboxes
- ✅ **Authentication** - JWT auth context and token management
- ✅ **API Integration** - HTTP client configured for academy backend
- ✅ **Program Context** - Multi-program support with context switching
- ✅ **Type Safety** - Full TypeScript support with strict typing
- ✅ **Error Handling** - Consistent error boundaries and user feedback

## Dependencies

See `package.json` for peer dependencies. This library is designed to work with:
- React Native 0.74+
- Expo SDK 51+
- React Navigation 6+
- React Hook Form 7+

## Development Workflow

1. **Develop**: Make changes in `/apps/shared/` within academy-admin repo
2. **Test**: Test with both mobile apps side-by-side
3. **Deploy**: Push to separate repository via git subtree
4. **Sync**: Apps pull latest shared library updates

## License

MIT