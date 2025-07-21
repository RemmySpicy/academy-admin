# Program Context Integration Standards

## Overview

The Academy Management System follows a **program-centric architecture** where all data access is strictly controlled by program context, except for Academy Administration functions.

## Route Categories

### 🏛️ **Academy Administration Routes** (`/admin/academy/*`)
**Purpose**: Super Admin management of the academy itself  
**Access**: Super Admin only  
**Program Context**: **BYPASS** - Uses `X-Bypass-Program-Filter: true` header  
**Examples**:
- `/admin/academy/programs` - Manage all programs
- `/admin/academy/users` - Manage all system users  
- `/admin/academy/settings` - Academy-wide settings

**Implementation**:
```typescript
// ❌ DO NOT use program context hooks
const { data } = usePrograms(); // This would be filtered

// ✅ USE bypass headers for academy admin
const response = await httpClient.get('/api/v1/programs/', {}, {
  'X-Bypass-Program-Filter': 'true'
});
```

### 🎯 **Program Management Routes** (`/admin/*`)
**Purpose**: Program-specific management within assigned programs  
**Access**: All roles (Program Admin, Coordinator, Instructor)  
**Program Context**: **REQUIRED** - Automatic filtering by program assignments  
**Examples**:
- `/admin/students` - Students in current program only
- `/admin/courses` - Courses in current program only  
- `/admin/facilities` - Facilities in current program only

**Implementation**:
```typescript
// ✅ ALWAYS use program context hooks
const { data } = useStudents(page, searchParams); // Auto-filtered by program
const { currentProgram } = useProgramContext(); // Current program context
```

## Hook Development Standards

### ✅ **Program Context Hook Pattern**
All program management hooks MUST follow this pattern:

```typescript
export function useStudents(params?: SearchParams) {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: ['students', params, currentProgram?.id], // Include program ID in key
    queryFn: () => StudentApi.getStudents(params), // API auto-adds program context
    enabled: !!currentProgram, // Only fetch when program context exists
    staleTime: 5 * 60 * 1000,
  });
}
```

### ❌ **Academy Admin Hook Pattern** 
Academy admin hooks should NOT use program context:

```typescript
export function useAllPrograms() {
  return useQuery({
    queryKey: ['academy-programs'], // No program ID in key
    queryFn: async () => {
      const response = await httpClient.get('/api/v1/programs/', {}, {
        'X-Bypass-Program-Filter': 'true' // Bypass program filtering
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

## Page Implementation Standards

### 🎯 **Program Management Pages**

**Required Elements**:
1. **Program Context Hook**: `const { currentProgram } = useProgramContext()`
2. **Program-Aware Data Hooks**: Include `currentProgram?.id` in query keys
3. **Auto-Refresh**: Data automatically refreshes on program switch
4. **Page Title**: Use `usePageTitle()` hook
5. **Loading States**: Handle loading when `!currentProgram`

**Example Implementation**:
```typescript
export default function StudentsPage() {
  usePageTitle('Students', 'Manage students in your program');
  
  const [searchParams, setSearchParams] = useState({ page: 1, per_page: 20 });
  
  // ✅ Program context aware
  const { data, isLoading, error } = useStudents(searchParams);
  const deleteStudent = useDeleteStudent();
  
  const students = data?.items || [];
  
  // Auto-refreshes when program context changes
  return (
    <div className="space-y-6">
      {/* Content */}
    </div>
  );
}
```

### 🏛️ **Academy Administration Pages**

**Required Elements**:
1. **Super Admin Route Guard**: Wrap with `SuperAdminRoute`
2. **Bypass Program Context**: Use `X-Bypass-Program-Filter: true`
3. **No Program Context Hooks**: Don't use `useProgramContext()`
4. **Academy-Wide Data**: Access all data across programs

**Example Implementation**:
```typescript
export default function AcademyProgramsPage() {
  usePageTitle('Academy Programs', 'Manage all academy programs');
  
  // ✅ No program context - academy wide
  const { data, isLoading, error } = useAllPrograms(); // Bypasses program filter
  const createProgram = useCreateProgram();
  
  return (
    <SuperAdminRoute>
      <div className="space-y-6">
        {/* Academy-wide content */}
      </div>
    </SuperAdminRoute>
  );
}
```

## API Integration Standards

### 🔧 **HTTP Client Behavior**

**Program Management APIs**:
- Automatically inject `X-Program-Context: {program-id}` header
- Data filtered by user's program assignments
- Returns program-scoped results only

**Academy Admin APIs**:
- Manually add `X-Bypass-Program-Filter: true` header  
- Data includes ALL programs and cross-program data
- Super Admin access required

## Quality Assurance

### ✅ **Program Context Compliance**
Run these checks before committing:

```bash
npm run program-context:lint    # Validates program context usage
npm run quality:academy        # Full Academy Admin checks
```

### 🔍 **Code Review Checklist**

**For Program Management Pages**:
- [ ] Uses program context hooks (`useProgramContext`)
- [ ] Query keys include `currentProgram?.id`
- [ ] Auto-refreshes on program switch
- [ ] Handles loading state when no program context
- [ ] No bypass headers used

**For Academy Admin Pages**:
- [ ] Wrapped in `SuperAdminRoute`
- [ ] Uses bypass headers (`X-Bypass-Program-Filter: true`)
- [ ] No program context hooks used
- [ ] Access to cross-program data
- [ ] Super Admin permissions enforced

## Migration Guidelines

### 🔄 **Converting Direct API Calls to Hooks**

**Before (❌ Problem)**:
```typescript
const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchStudents = async () => {
    const response = await studentApi.getAll(); // No program context!
    setStudents(response.data);
    setLoading(false);
  };
  fetchStudents();
}, []); // Won't refresh on program switch!
```

**After (✅ Solution)**:
```typescript
const { data, isLoading } = useStudents(searchParams); // Program context aware
const students = data?.items || [];
// Automatically refreshes when program context changes!
```

## Common Patterns

### 🔄 **Program Switch Handling**
Program-context hooks automatically handle program switches:

1. User switches program via ProgramSwitcher
2. `currentProgram?.id` changes
3. Query keys update automatically  
4. TanStack Query refetches data
5. UI updates with new program data

### 📊 **Search and Filtering**
Always use server-side filtering for program management:

```typescript
const searchParams = {
  search: searchTerm || undefined,
  status: statusFilter !== 'all' ? statusFilter : undefined,
  page: 1,
  per_page: 50,
};

const { data } = useStudents(searchParams); // Server-side filtering + program context
```

### 🗂️ **Pagination**
Include pagination in query keys for proper caching:

```typescript
const params = { page, per_page, ...searchParams };
const queryKey = [...QUERY_KEYS.list(params), currentProgram?.id];
```

## Examples by Route Type

| Route Pattern | Example | Program Context | Access Level |
|---------------|---------|-----------------|--------------|
| `/admin/academy/*` | `/admin/academy/programs` | **Bypass** | Super Admin |
| `/admin/users/*` | `/admin/users` | **Bypass** | Super Admin |  
| `/admin/students/*` | `/admin/students` | **Required** | Program Roles |
| `/admin/courses/*` | `/admin/courses` | **Required** | Program Roles |
| `/admin/facilities/*` | `/admin/facilities` | **Required** | Program Roles |
| `/admin/team/*` | `/admin/team` | **Required** | Program Roles |

## Error Handling

### 🚨 **No Program Context**
Program management pages should handle missing program context:

```typescript
const { currentProgram } = useProgramContext();

if (!currentProgram) {
  return <div>Please select a program to continue.</div>;
}
```

### 🔒 **Access Denied**
Handle program access restrictions gracefully:

```typescript
const { data, error } = useStudents();

if (error?.message?.includes('Access denied')) {
  return <div>You don't have access to this program's data.</div>;
}
```

---

## Summary

**Golden Rules**:
1. **Academy Admin** (`/admin/academy/*`, `/admin/users/*`) = **BYPASS** program context
2. **Program Management** (`/admin/students/*`, `/admin/courses/*`, etc.) = **REQUIRE** program context  
3. **Always use hooks** instead of direct API calls
4. **Include program ID** in query keys for auto-refresh
5. **Test program switching** to ensure data updates correctly