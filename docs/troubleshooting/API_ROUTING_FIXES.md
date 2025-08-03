# API Routing & Trailing Slash Fixes (2025-08-03)

## Overview
This document details the comprehensive fix applied to resolve `ERR_NAME_NOT_RESOLVED` errors and 307 redirect issues across the Academy Admin system.

## Issues Resolved

### 1. System-Wide Trailing Slash Issue
**Symptoms**:
- Frontend errors: `GET http://backend:8000/api/v1/[endpoint]/?page=1... net::ERR_NAME_NOT_RESOLVED`
- 307 Temporary Redirect responses from backend
- Pages failing to load with network resolution errors
- Frontend making direct calls to Docker service name instead of using proxy

**Root Cause**: 
- FastAPI route definitions using `@router.get("/")` patterns
- Frontend calling endpoints without trailing slashes (e.g., `/api/v1/curricula`)
- Backend redirecting to add trailing slash (e.g., `/api/v1/curricula/`)
- Redirect included full backend hostname `http://backend:8000` which is not resolvable from browser

**Solution Applied**:
```python
# BEFORE (Problematic)
@router.get("/", response_model=CurriculumListResponse)
@router.post("/", response_model=CurriculumResponse)

# AFTER (Fixed)
@router.get("", response_model=CurriculumListResponse)
@router.post("", response_model=CurriculumResponse)
```

### 2. Features Fixed
Updated route definitions in the following features:

#### Core Features
- **Curricula**: `/api/v1/curricula` ✅
- **Facilities**: `/api/v1/facilities` ✅
- **Media**: `/api/v1/media` ✅

#### Sub-route Features  
- **Curricula Levels**: `/api/v1/curricula/levels` ✅
- **Curricula Modules**: `/api/v1/curricula/modules` ✅
- **Curricula Sections**: `/api/v1/curricula/sections` ✅

#### Additional Features
- **Content Lessons**: `/api/v1/content/lessons` ✅
- **Organizations**: `/api/v1/organizations` ✅
- **Facility Pricing**: `/api/v1/facilities/pricing` ✅
- **Parent Relationships**: `/api/v1/parents/relationships` ✅
- **Partner Auth**: `/api/v1/organizations/partner-auth` ✅
- **Scheduling Sessions**: `/api/v1/scheduling/sessions` ✅

### 3. Frontend Configuration
**Environment Variables**:
```bash
# .env file
NEXT_PUBLIC_API_URL=
# Empty value forces relative paths that get proxied by Next.js
```

**Next.js Proxy Configuration**:
```javascript
// next.config.js
async rewrites() {
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
    ];
  }
  return [];
}
```

## Technical Details

### Files Modified
**Backend Route Files** (18 route definitions updated):
```
backend/app/features/curricula/routes/curricula.py
backend/app/features/curricula/routes/levels.py
backend/app/features/curricula/routes/modules.py
backend/app/features/curricula/routes/sections.py
backend/app/features/facilities/routes/facilities.py
backend/app/features/facilities/routes/facility_course_pricing.py
backend/app/features/content/routes/lessons.py
backend/app/features/media/routes/media.py
backend/app/features/organizations/routes/organizations.py
backend/app/features/organizations/routes/partner_auth.py
backend/app/features/parents/routes/relationships.py
backend/app/features/scheduling/routes/sessions.py
```

**Frontend Configuration**:
```
.env (NEXT_PUBLIC_API_URL setting)
frontend/src/lib/constants.ts (endpoint definitions)
```

### Test Results
**Before Fix**:
```bash
curl http://localhost:3000/api/v1/curricula?page=1
# Result: ERR_NAME_NOT_RESOLVED or 307 redirect timeout
```

**After Fix**:
```bash
curl http://localhost:3000/api/v1/curricula?page=1
# Result: {"detail":"Not authenticated"} - proper API response
```

## Verification Steps
To verify the fix is working:

1. **Check endpoint accessibility**:
```bash
curl -s "http://localhost:3000/api/v1/curricula?page=1&per_page=2"
# Should return authentication error, not network error
```

2. **Check with authentication**:
```bash
TOKEN="your-jwt-token"
curl -s "http://localhost:3000/api/v1/curricula?page=1&per_page=2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Program-Context: 1"
# Should return proper paginated response
```

3. **Check backend logs**:
```bash
docker compose logs backend | tail -10
# Should show 200/401 responses, not 307 redirects
```

## Prevention
To prevent this issue in future development:

### Route Definition Standards
```python
# ✅ CORRECT - No trailing slash
@router.get("", response_model=ResponseType)
@router.post("", response_model=ResponseType)

# ❌ AVOID - Trailing slash causes redirects
@router.get("/", response_model=ResponseType)
@router.post("/", response_model=ResponseType)
```

### Testing Checklist
- [ ] Test endpoints through frontend proxy (`http://localhost:3000/api/...`)
- [ ] Verify no 307 redirects in browser network tab
- [ ] Check backend logs for proper status codes
- [ ] Test with authentication headers
- [ ] Verify program context filtering works

## Related Documentation
- [`docs/api/API_ENDPOINTS.md`](../api/API_ENDPOINTS.md) - Updated endpoint reference
- [`CLAUDE.md`](../../CLAUDE.md) - Latest system updates
- [`docs/development/DEVELOPMENT_WORKFLOW.md`](../development/DEVELOPMENT_WORKFLOW.md) - Development standards