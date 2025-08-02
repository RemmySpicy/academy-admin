# Statistics Data Filtering Fixes

## Overview
This document covers troubleshooting steps for Academy Administration statistics features, specifically addressing data filtering mismatches and zero-value displays.

## Common Issues and Solutions

### Issue 1: Statistics Showing All Zeros (Fixed - 2025-08-02)

#### **Problem Description**
- Program statistics page displays all zeros for courses, students, team members
- Backend API returns 200 OK but data appears empty
- Database contains actual data but service doesn't retrieve it

#### **Root Cause**
Backend service was using incorrect status value filtering:
```python
# INCORRECT - Service was filtering for 'active' status
active_courses = db.query(Course).filter(
    Course.program_id == program_id,
    Course.status == 'active'  # ❌ No courses have 'active' status
).count()
```

But actual database values are:
- **Courses**: `'published'` (active) and `'draft'` (inactive)
- **Students**: `'active'`, `'inactive'`, `'graduated'`, `'suspended'`

#### **Solution Applied** ✅
Updated service to use correct status mapping:
```python
# CORRECT - Updated to use 'published' for active courses
active_courses = db.query(Course).filter(
    Course.program_id == program_id,
    Course.status == 'published'  # ✅ Matches actual database values
).count()
```

#### **Expected Results After Fix**
For Swimming program specifically:
- **Total Courses**: 7
- **Active Courses**: 4 (published courses)
- **Inactive Courses**: 3 (draft courses)
- **Total Students**: 7
- **Active Students**: 3
- **Team Members**: 14
- **Facilities**: 3

#### **Files Modified**
- `backend/app/features/programs/services/program_service.py` - Line 236 (status filtering fix)

### Issue 2: Frontend TypeError on Statistics Access (Fixed - 2025-08-02)

#### **Problem Description**
```
TypeError: Cannot read properties of undefined (reading 'total')
```

#### **Root Cause**
Frontend component accessed nested properties without checking if parent objects exist:
```typescript
// INCORRECT - Direct property access
<span>{statistics.courses.total}</span>  // ❌ Crashes if courses is undefined
```

#### **Solution Applied** ✅
Implemented production-quality error handling:

1. **Data Validation Function**:
```typescript
const isValidStatistics = (stats: any): boolean => {
  return stats && 
    typeof stats === 'object' && 
    stats.courses && 
    stats.students && 
    stats.team && 
    stats.facilities && 
    stats.configuration;
};
```

2. **Safe Value Extraction**:
```typescript
const getStatValue = (value: number | undefined | null): number => {
  return typeof value === 'number' && !isNaN(value) ? value : 0;
};
```

3. **Comprehensive Error States**:
```typescript
{statsError ? (
  <Alert with retry button />
) : isValidStatistics(statistics) ? (
  <Statistics display with safe value access />
) : (
  <Enhanced empty state with refresh />
)}
```

#### **Files Modified**
- `frontend/src/features/academy/components/programs/ProgramViewPage.tsx` - Complete error handling overhaul

## Diagnostic Steps

### Step 1: Verify Database Data
```sql
-- Check if programs have data
SELECT p.id, p.name, 
       (SELECT COUNT(*) FROM courses c WHERE c.program_id = p.id) as courses,
       (SELECT COUNT(*) FROM students s WHERE s.program_id = p.id) as students,
       (SELECT COUNT(*) FROM user_program_assignments upa WHERE upa.program_id = p.id) as team_members
FROM programs p
ORDER BY p.name;
```

### Step 2: Check Status Value Consistency
```sql
-- Verify course status values
SELECT DISTINCT status FROM courses WHERE program_id = 'your-program-id';

-- Verify student status values  
SELECT DISTINCT status FROM students WHERE program_id = 'your-program-id';
```

### Step 3: Test API Endpoint Directly
```bash
# Test statistics endpoint
curl -H "Authorization: Bearer <token>" \
     "http://localhost:8000/api/v1/programs/{program-id}/statistics?bypass_program_filter=true"
```

### Step 4: Check Backend Logs
```bash
# Monitor for API calls and errors
docker compose logs backend -f | grep -i "statistics\|error"
```

### Step 5: Verify Frontend Error Handling
Check browser console for:
- Network request success/failure
- JavaScript errors in statistics component
- Data structure validation results

## Prevention Guidelines

### Backend Service Development
1. **Always verify actual database values** before writing filtering queries
2. **Use database queries** to check existing status values: `SELECT DISTINCT status FROM table_name`
3. **Add logging** for statistics calculations to debug data mismatches
4. **Test with actual data** not just sample/mock data

### Frontend Component Development
1. **Implement data validation** functions for API responses
2. **Use optional chaining** (`?.`) and nullish coalescing (`??`) for safe property access
3. **Provide comprehensive error states** with retry mechanisms
4. **Add loading skeletons** for better user experience
5. **Test error scenarios** including network failures and malformed data

### Integration Testing
1. **Verify API response structure** matches frontend expectations
2. **Test with empty databases** and databases with various data states
3. **Check cross-feature data dependencies** (e.g., course status affects statistics)
4. **Validate error handling** for all failure modes

## Related Documentation
- [API Endpoints Reference](../api/API_ENDPOINTS.md#program-statistics) - Statistics endpoint documentation
- [Feature Integration Guide](../architecture/FEATURE_INTEGRATION_GUIDE.md#academy-administration-program-statistics-integration) - Statistics integration patterns
- [Table Visibility Fixes](TABLE_VISIBILITY_FIXES.md) - Related data visibility issues
- [Schema Synchronization Fixes](SCHEMA_SYNCHRONIZATION_FIXES.md) - Database schema consistency

## Future Considerations

### Data Consistency Monitoring
- Add data validation tests for status value consistency
- Implement automated checks for service/database schema alignment
- Create alerts for statistical anomalies (e.g., all zeros when data exists)

### Performance Optimization
- Consider caching for frequently accessed statistics
- Implement incremental updates for real-time statistics
- Add database indexes for statistics query performance