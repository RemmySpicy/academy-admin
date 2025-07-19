# Shared Resources

This directory contains code and resources shared across all Academy applications (admin dashboard, tutor app, student app).

## Directory Structure

### 📝 `types/`
**Shared TypeScript type definitions**
- Exported from backend Pydantic schemas
- Consistent data models across all apps
- API request/response types
- Enum definitions

### 🔌 `api-client/`
**Unified API client library**
- Authentication handling with JWT tokens
- Automatic program context injection
- Error handling and retry logic
- Request/response type safety
- Role-based API access patterns

### 🛠️ `utils/`
**Common utilities and helpers**
- Date/time formatting utilities
- Validation helpers
- Constants and configuration
- Common business logic

## Usage

### In Admin Dashboard (Next.js)
```typescript
import { ApiClient } from '../shared/api-client';
import { CourseType, StudentType } from '../shared/types';

const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL);
```

### In Mobile Apps (React Native)
```typescript
import { ApiClient } from '../../shared/api-client';
import { CourseType, StudentType } from '../../shared/types';

const api = new ApiClient('http://localhost:8000'); // Development
```

## Development Guidelines

### Adding New Types
1. **Export from backend schemas** - Use automated generation when possible
2. **Version compatibility** - Ensure compatibility across all apps
3. **Documentation** - Document complex types with JSDoc comments

### API Client Updates
1. **Backward compatibility** - Don't break existing apps
2. **Error handling** - Handle errors consistently across apps
3. **Testing** - Test API client with all app types

### Utilities
1. **Pure functions** - Keep utilities stateless and testable
2. **Platform agnostic** - Work in both web and mobile environments
3. **Well documented** - Clear documentation for all utility functions

## Synchronization

Changes to shared resources affect all apps:
- **Admin Dashboard**: Immediate effect (same repo)
- **Mobile Apps**: Synced via git subtree operations
- **Testing**: Validate changes across all app types before committing

## TypeScript Configuration

Shared resources use strict TypeScript configuration:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Versioning Strategy

Shared resources follow semantic versioning:
- **Major**: Breaking changes requiring app updates
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes and minor improvements