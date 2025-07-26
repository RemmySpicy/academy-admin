# Name Field Migration - From full_name to first_name/last_name

## Overview

This document outlines the migration from a single `full_name` field to separate `first_name` and `last_name` fields across the Academy Management System.

## Migration Summary

### Database Changes
- **Migration**: `20250726_add_name_fields`
- **Added Fields**: 
  - `first_name` VARCHAR(100) NOT NULL
  - `last_name` VARCHAR(100) NOT NULL
- **Indexes**: Added performance indexes for name-based searches
- **Data Migration**: Automatically split existing `full_name` data

### Backend Changes

#### Models Updated
- `app/features/authentication/models/user.py`
  - Added `first_name` and `last_name` fields
  - Kept `full_name` as computed property

#### Schemas Updated
- `app/features/authentication/schemas/auth.py`
- `app/features/authentication/schemas/user_enhanced.py`
- `app/features/teams/schemas/team_schemas.py`
- `app/features/organizations/schemas/partner_admin_schemas.py`

#### Services Updated
- `app/features/authentication/services/user_service.py`
  - Updated search functionality to include both name fields
  - Updated student profile creation logic

### Frontend Changes

#### Components Updated
- `frontend/src/features/academy/components/dialogs/UserCreateDialog.tsx`
- `frontend/src/app/admin/students/new/page.tsx`
- `frontend/src/features/parents/components/ParentForm.tsx` (already implemented)

#### TypeScript Types Updated
- `frontend/src/shared/types/user.ts`
- `frontend/src/shared/types/auth.ts`

## Implementation Details

### Data Migration Strategy
The migration automatically splits existing `full_name` values:
- First word becomes `first_name`
- Remaining words become `last_name`
- Empty values are handled gracefully

### Search Enhancement
User search now includes:
- First name matching
- Last name matching
- Full name concatenation matching
- Email and username matching

### Form Updates
All user creation forms now use:
```tsx
<FormField label="First Name" field="first_name" required />
<FormField label="Last Name" field="last_name" required />
```

## API Changes

### Request Schemas
**Before:**
```json
{
  "username": "jdoe",
  "email": "john@example.com", 
  "full_name": "John Doe"
}
```

**After:**
```json
{
  "username": "jdoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Response Schemas
API responses now include separate name fields while maintaining `full_name` as a computed property for compatibility.

## Benefits

1. **Better Data Structure**: Separate name fields allow for better sorting and filtering
2. **Improved Search**: More granular search capabilities
3. **Internationalization Ready**: Better support for different name formats
4. **Form Validation**: Individual validation for each name component
5. **Data Quality**: Enforced structure prevents inconsistent name formatting

## Testing

### Database Migration
- ✅ Migration runs successfully
- ✅ Existing data preserved and correctly split
- ✅ New records can be created with separate fields

### API Endpoints
- ✅ User creation endpoints accept new schema
- ✅ Search functionality works with new fields
- ✅ Response schemas include both individual and computed full name

### Frontend Forms
- ✅ User creation dialog updated
- ✅ Student creation form updated
- ✅ Form validation works for both fields

## Rollback Plan

If needed, the migration can be rolled back:
1. Run `alembic downgrade` to previous migration
2. Revert code changes to use `full_name` field
3. Update frontend forms back to single name input

## Future Considerations

1. **Middle Name Support**: Could add `middle_name` field if needed
2. **Name Prefixes/Suffixes**: Consider adding fields for titles (Dr., Jr., etc.)
3. **Cultural Names**: May need additional flexibility for non-Western name structures
4. **Display Name**: Could add separate display name field for preferences

## Files Modified

### Backend Files
- `backend/alembic/versions/20250726_add_name_fields.py`
- `backend/app/features/authentication/models/user.py`
- `backend/app/features/authentication/schemas/auth.py`
- `backend/app/features/authentication/schemas/user_enhanced.py`
- `backend/app/features/authentication/services/user_service.py`
- `backend/app/features/teams/schemas/team_schemas.py`
- `backend/app/features/organizations/schemas/partner_admin_schemas.py`

### Frontend Files
- `frontend/src/features/academy/components/dialogs/UserCreateDialog.tsx`
- `frontend/src/app/admin/students/new/page.tsx`
- `frontend/src/shared/types/user.ts`
- `frontend/src/shared/types/auth.ts`

### Documentation
- `docs/architecture/NAME_FIELD_MIGRATION.md` (this file)

## Completion Status

- ✅ Database migration
- ✅ Backend model updates
- ✅ Backend schema updates
- ✅ Backend service updates
- ✅ Frontend component updates
- ✅ TypeScript type updates
- ✅ Testing and validation
- ✅ Documentation

The migration has been completed successfully and all functionality is working as expected.