# Build and Enum Issues Troubleshooting Guide

**Common build errors, enum type mismatches, and import issues encountered during Academy Admin development.**

## 📖 Table of Contents

- [Overview](#overview)
- [Enum Type Issues](#enum-type-issues)
- [Import and Module Issues](#import-and-module-issues)
- [Build and Compilation Errors](#build-and-compilation-errors)
- [Database Migration Issues](#database-migration-issues)
- [Authentication Problems](#authentication-problems)
- [Frontend Build Issues](#frontend-build-issues)
- [Prevention Strategies](#prevention-strategies)

## Overview

This guide documents common issues encountered during Academy Admin development, particularly around enum type mismatches, import errors, and build failures. These issues often arise when:

- Adding new enum types to the database
- Importing modules across different parts of the application
- Building frontend components with missing dependencies
- Migrating database schemas with type changes

## Enum Type Issues

### 1. ProfileType Enum Mismatch

**Problem:** SQLAlchemy expecting uppercase enum values but PostgreSQL has lowercase values.

```
LookupError: 'full_user' is not among the defined enum values. 
Enum name: profiletype. Possible values: FULL_USER, PROFILE_ONL..
```

**Root Cause:** Mismatch between Python enum definition and PostgreSQL enum values.

```python
# Python enum (correct)
class ProfileType(str, enum.Enum):
    FULL_USER = "full_user"
    PROFILE_ONLY = "profile_only"

# PostgreSQL enum had lowercase values: {'full_user', 'profile_only'}
# But SQLAlchemy expected uppercase: {'FULL_USER', 'PROFILE_ONLY'}
```

**Solution:**
```sql
-- 1. Drop existing constraint
ALTER TABLE users DROP CONSTRAINT check_full_user_credentials;

-- 2. Convert column to text temporarily  
ALTER TABLE users ALTER COLUMN profile_type TYPE text USING profile_type::text;

-- 3. Update values to uppercase
UPDATE users SET profile_type = 'FULL_USER' WHERE profile_type = 'full_user';
UPDATE users SET profile_type = 'PROFILE_ONLY' WHERE profile_type = 'profile_only';

-- 4. Create new enum with uppercase values
DROP TYPE profiletype_old;
CREATE TYPE profiletype AS ENUM ('FULL_USER', 'PROFILE_ONLY');

-- 5. Convert column back to enum
ALTER TABLE users ALTER COLUMN profile_type TYPE profiletype USING profile_type::profiletype;

-- 6. Set default value
ALTER TABLE users ALTER COLUMN profile_type SET DEFAULT 'FULL_USER'::profiletype;
```

**Prevention:**
- Always verify enum values match between Python and PostgreSQL
- **STANDARD (2025-01-29): Use lowercase values for all enums**
- Test enum operations after migrations

**Note:** As of 2025-01-29, all enums have been standardized to use lowercase values (e.g., `"active"`, `"inactive"`) for consistency between Python and PostgreSQL.

### 2. OrganizationStatus Enum Issues

**Problem:** Multiple enum definitions causing import conflicts.

```python
# Multiple files defining the same enum
# backend/app/features/organizations/models/organization.py
# backend/app/features/common/models/enums.py
```

**Solution:**
- Centralize enum definitions in `app/features/common/models/enums.py`
- Import enums from the central location
- Remove duplicate definitions

```python
# ✅ Correct approach
from app.features.common.models.enums import OrganizationStatus

# ❌ Avoid duplicate definitions
class OrganizationStatus(str, enum.Enum):  # Don't define again!
```

### 3. Enum Migration Best Practices

**Creating New Enums:**
```sql
-- Use conditional creation to avoid errors
DO $$ BEGIN
    CREATE TYPE organizationstatus AS ENUM ('active', 'inactive', 'suspended', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

**Modifying Existing Enums:**
```sql
-- Add new enum value
ALTER TYPE organizationstatus ADD VALUE 'archived';

-- Rename enum values (requires recreation)
ALTER TYPE organizationstatus RENAME TO organizationstatus_old;
CREATE TYPE organizationstatus AS ENUM ('active', 'inactive', 'suspended', 'pending', 'archived');
-- Update tables to use new enum...
DROP TYPE organizationstatus_old;
```

## Import and Module Issues

### 1. Duplicate Model Class Errors

**Problem:** Multiple definitions of the same class causing SQLAlchemy errors.

```
InvalidRequestError: Multiple classes found for path "OrganizationMembership" 
in the registry of this declarative base.
```

**Root Cause:** Same model class defined in multiple files.

**Solution:**
```python
# ❌ Wrong: Duplicate class definition
# File 1: organization.py
class OrganizationMembership(BaseModel):
    pass

# File 2: organization_membership.py  
class OrganizationMembership(BaseModel):  # Duplicate!
    pass

# ✅ Correct: Import from single source
# File 1: organization.py
from .organization_membership import OrganizationMembership

# File 2: organization_membership.py
class OrganizationMembership(BaseModel):
    pass
```

### 2. Missing Service Methods

**Problem:** Method not found errors when calling service methods.

```
AttributeError: 'UserService' object has no attribute 'get_by_id'
```

**Solution:**
```python
# Check base service class for available methods
class BaseService:
    def get(self, db: Session, id: str):  # ✅ Available
        pass
    
    def get_by_id(self, db: Session, id: str):  # ❌ Not available
        pass

# Fix the method call
# ❌ Wrong
user = user_service.get_by_id(db, user_id)

# ✅ Correct  
user = user_service.get(db, user_id)
```

### 3. Import Path Issues

**Problem:** Module not found errors due to incorrect import paths.

```
ModuleNotFoundError: No module named 'app.core.database'
```

**Solution:**
```python
# ❌ Wrong import path
from app.core.database import get_db

# ✅ Correct import path
from app.features.common.models.database import get_db
```

**Debug Process:**
1. Check if the file exists at the expected path
2. Verify the module structure matches the import
3. Look for typos in module names
4. Check if `__init__.py` files exist in directories

## Build and Compilation Errors

### 1. Missing Dependencies

**Problem:** Import errors for missing modules or hooks.

```
Module not found: Can't resolve '@/hooks/useDebounce'
Module not found: Can't resolve '@/hooks/useProgramContext'
```

**Solution:**
Create missing files with appropriate exports:

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
```

```typescript
// src/hooks/useProgramContext.ts
export { useProgramContext } from '@/store/programContext';
```

### 2. Type Definition Issues

**Problem:** TypeScript compilation errors due to missing or incorrect types.

```typescript
// ❌ Type error
interface User {
  profile_type: string;  // Should be enum
}

// ✅ Correct typing
interface User {
  profile_type: ProfileType;
}

enum ProfileType {
  FULL_USER = 'FULL_USER',
  PROFILE_ONLY = 'PROFILE_ONLY'
}
```

### 3. Component Import Issues

**Problem:** Components not found due to incorrect import paths.

```typescript
// ❌ Wrong path
import { httpClient } from '@/lib/httpClient';

// ✅ Correct path
import { httpClient } from '@/lib/api/httpClient';
```

## Database Migration Issues

### 1. Foreign Key Constraint Violations

**Problem:** Cannot add foreign key due to existing data mismatches.

```sql
ERROR: insert or update on table "organization_memberships" violates 
foreign key constraint "organization_memberships_user_id_fkey"
```

**Solution:**
```sql
-- 1. Check for orphaned records
SELECT om.* FROM organization_memberships om 
LEFT JOIN users u ON om.user_id = u.id 
WHERE u.id IS NULL;

-- 2. Clean up orphaned records
DELETE FROM organization_memberships 
WHERE user_id NOT IN (SELECT id FROM users);

-- 3. Re-run migration
```

### 2. Enum Type Conversion Issues

**Problem:** Cannot convert column to new enum type due to existing data.

```sql
ERROR: column "status" cannot be cast automatically to type organizationstatus
```

**Solution:**
```sql
-- Use explicit casting with USING clause
ALTER TABLE organizations 
ALTER COLUMN status TYPE organizationstatus 
USING status::text::organizationstatus;
```

### 3. Migration Rollback Issues

**Problem:** Cannot rollback migration due to dependencies.

**Solution:**
```python
# Create proper down migration
def downgrade():
    # Remove constraints first
    op.drop_constraint('fk_constraint_name', 'table_name')
    
    # Drop tables in reverse dependency order
    op.drop_table('child_table')
    op.drop_table('parent_table')
    
    # Drop enums last
    op.execute("DROP TYPE IF EXISTS organizationstatus")
```

## Authentication Problems

### 1. JWT Token Validation Errors

**Problem:** "Could not validate credentials" errors.

**Common Causes:**
- Expired tokens
- Invalid token format
- Secret key mismatch
- Token not properly formatted

**Solution:**
```python
# Check token format
headers = {
    'Authorization': f'Bearer {token}',  # Must include 'Bearer '
    'Content-Type': 'application/json'
}

# Verify token is not expired
import jwt
try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print("Token is valid")
except jwt.ExpiredSignatureError:
    print("Token has expired")
except jwt.InvalidTokenError:
    print("Invalid token")
```

### 2. Profile Type Authentication Issues

**Problem:** Authentication fails due to profile type mismatches.

**Solution:**
- Ensure only `FULL_USER` profiles can authenticate
- Check database values match enum definitions
- Verify profile type constraints are properly set

```python
# Add constraint to ensure authentication logic
ALTER TABLE users ADD CONSTRAINT check_profile_credentials CHECK (
    (profile_type = 'FULL_USER' AND email IS NOT NULL AND password_hash IS NOT NULL) 
    OR 
    (profile_type = 'PROFILE_ONLY')
);
```

## Frontend Build Issues

### 1. Next.js Module Resolution Issues

**Problem:** Next.js cannot resolve modules despite files existing.

**Solutions:**
1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check tsconfig.json paths:**
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Restart development server:**
   ```bash
   docker compose restart frontend
   ```

### 2. Component Export Issues

**Problem:** Named exports not found from modules.

```typescript
// ❌ Component not exported
// File: components/MyComponent.tsx
export default function MyComponent() {}

// Import trying to use named export
import { MyComponent } from './components/MyComponent';  // Error!

// ✅ Solutions:
// Option 1: Use default import
import MyComponent from './components/MyComponent';

// Option 2: Add named export
export default function MyComponent() {}
export { MyComponent };  // Add this line
```

### 3. Type Import Issues

**Problem:** Type imports causing build failures.

```typescript
// ❌ Mixing type and value imports
import { User, type UserRole } from './types';

// ✅ Separate type imports
import type { UserRole } from './types';
import { User } from './types';
```

## Prevention Strategies

### 1. Development Best Practices

**Enum Management:**
- Define enums in central location (`common/models/enums.py`)
- Use consistent naming conventions (UPPER_CASE for enum members)
- Verify enum values match between Python and PostgreSQL
- Test enum operations after every migration

**Import Management:**
- Use absolute imports with path aliases (`@/components/...`)
- Avoid circular imports
- Check import paths match actual file structure
- Use TypeScript for better import validation

**Service Layer:**
- Check base class methods before calling
- Use consistent method naming across services
- Document available methods in service classes
- Use dependency injection properly

### 2. Testing Strategies

**Enum Testing:**
```python
def test_profile_type_enum():
    # Test enum values match database
    user = User(profile_type=ProfileType.FULL_USER)
    assert user.profile_type == ProfileType.FULL_USER
    
    # Test database storage and retrieval
    db.add(user)
    db.commit()
    
    retrieved_user = db.query(User).first()
    assert retrieved_user.profile_type == ProfileType.FULL_USER
```

**Import Testing:**
```python
def test_imports():
    # Test that all expected modules can be imported
    from app.features.organizations.models.organization import Organization
    from app.features.organizations.services.payment_override_service import PaymentOverrideService
    
    # Test class instantiation
    org = Organization(name="Test Org")
    service = PaymentOverrideService(db)
```

### 3. Monitoring and Debugging

**Error Logging:**
```python
import logging

logger = logging.getLogger(__name__)

try:
    result = potentially_failing_operation()
except Exception as e:
    logger.error(f"Operation failed: {e}", exc_info=True)
    raise
```

**Database Debugging:**
```sql
-- Check enum values
SELECT enum_range(NULL::profiletype);

-- Check table constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'users'::regclass;

-- Check foreign key relationships
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

### 4. Development Workflow

**Before Adding New Features:**
1. ✅ Check existing enum definitions
2. ✅ Verify import paths are correct
3. ✅ Test database migrations in development
4. ✅ Run type checking (`npm run type-check`)
5. ✅ Test authentication flows

**During Development:**
1. ✅ Use consistent naming conventions
2. ✅ Test imports immediately after creating files
3. ✅ Verify enum operations work correctly
4. ✅ Check both Python and TypeScript types match
5. ✅ Test database operations with real data

**Before Deployment:**
1. ✅ Run full test suite
2. ✅ Check for any remaining type errors
3. ✅ Verify all migrations work correctly
4. ✅ Test authentication end-to-end
5. ✅ Check frontend builds without errors

## Quick Reference Commands

### Database Debugging
```bash
# Connect to database
docker compose exec db psql -U admin -d academy_admin

# Check enum values
SELECT enum_range(NULL::profiletype);

# Check table structure  
\d users

# Check constraints
\d+ organization_memberships
```

### Application Debugging
```bash
# Backend logs
docker compose logs backend --tail 20

# Frontend logs  
docker compose logs frontend --tail 20

# Restart services
docker compose restart backend frontend

# Clean rebuild
docker compose down && docker compose up -d
```

### Development Tools
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Test specific modules
pytest tests/test_organizations.py -v

# Database migration
alembic upgrade head
```

---

**📋 Last Updated**: 2025-07-26  
**🔧 Version**: 1.0.0  
**👥 Maintainer**: Academy Admin Development Team