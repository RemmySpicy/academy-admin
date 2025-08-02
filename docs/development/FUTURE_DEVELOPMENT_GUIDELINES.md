# Future Development Guidelines - Program Context Integration

## 🎯 **Mandatory Standards for All New Pages**

When developing any new feature in the Academy Management System, follow these strict guidelines to ensure proper program context integration.

## 📋 **Pre-Development Checklist**

### 1. **Determine Route Category**
Before writing any code, answer this question:

**❓ "Is this Academy Administration (managing the academy itself) or Program Management (managing data within programs)?"**

- **🏛️ Academy Administration** → Route: `/admin/academy/*` or `/admin/users/*`
- **🎯 Program Management** → Route: `/admin/*` (excluding academy/users)

### 2. **Choose the Correct Architecture Pattern**

#### 🎯 **Program Management Pages** (95% of features)
**Examples**: Students, Courses, Facilities, Scheduling, Teams, Parents

**Required Pattern**:
```typescript
// ✅ CORRECT - Program Management Page Template
export default function NewFeaturePage() {
  usePageTitle('Feature Name', 'Feature description');
  
  const [searchParams, setSearchParams] = useState({ page: 1, per_page: 20 });
  
  // ✅ MUST use program context hooks
  const { data, isLoading, error } = useNewFeature(searchParams);
  const createNewFeature = useCreateNewFeature();
  const deleteNewFeature = useDeleteNewFeature();
  
  const items = data?.items || [];
  
  // Automatically refreshes when program context changes!
  return (
    <div className="space-y-6">
      {/* Main Action Button */}
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Feature
        </Button>
      </div>
      
      {/* Feature Content */}
      {isLoading && <LoadingSkeleton />}
      {error && <ErrorDisplay error={error} onRetry={refetch} />}
      {!isLoading && !error && <FeatureGrid items={items} />}
    </div>
  );
}
```

#### 🏛️ **Academy Admin Pages** (5% of features)  
**Examples**: System Users, Academy Programs, System Settings

**Required Pattern**:
```typescript
// ✅ CORRECT - Academy Admin Page Template  
export default function NewAcademyFeaturePage() {
  usePageTitle('Academy Feature', 'Academy-wide feature management');
  
  // ✅ NO program context - academy wide data
  const { data, isLoading, error } = useAcademyNewFeature(); // Uses bypass headers
  const createAcademyFeature = useCreateAcademyNewFeature();
  
  return (
    <SuperAdminRoute>
      <div className="space-y-6">
        {/* Academy-wide content - no program filtering */}
      </div>
    </SuperAdminRoute>
  );
}
```

## 🛠️ **Hook Development Requirements**

### ✅ **Program Management Hooks** (Standard Pattern)

**File**: `/src/features/[feature]/hooks/index.ts`

```typescript
/**
 * Feature hooks with program context integration
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgramContext } from '@/store/programContext';
import { FeatureApi } from '../api';
import { FeatureSearchParams, FeatureCreate, FeatureUpdate } from '../types';

// Query keys
export const FEATURE_QUERY_KEYS = {
  all: ['features'] as const,
  lists: () => [...FEATURE_QUERY_KEYS.all, 'list'] as const,
  list: (params: FeatureSearchParams) => [...FEATURE_QUERY_KEYS.lists(), params] as const,
  details: () => [...FEATURE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FEATURE_QUERY_KEYS.details(), id] as const,
  stats: () => [...FEATURE_QUERY_KEYS.all, 'stats'] as const,
};

/**
 * Hook to fetch features with program context
 */
export function useFeatures(params?: FeatureSearchParams) {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...FEATURE_QUERY_KEYS.list(params || {}), currentProgram?.id], // ✅ Include program ID
    queryFn: () => FeatureApi.getFeatures(params), // ✅ Uses httpClient with program context
    enabled: !!currentProgram, // ✅ Only fetch when program context exists
    staleTime: 5 * 60 * 1000,
  });
}

// More hooks following the same pattern...
```

### ❌ **Academy Admin Hooks** (Bypass Pattern)

**File**: `/src/features/academy/hooks/index.ts`

```typescript
/**
 * Academy admin hooks - bypass program context
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/lib/api/httpClient';

export function useAcademyFeatures() {
  return useQuery({
    queryKey: ['academy-features'], // ❌ NO program ID in key
    queryFn: async () => {
      const response = await httpClient.get('/api/v1/features/', {}, {
        'X-Bypass-Program-Filter': 'true' // ✅ Bypass program filtering
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

## 🔗 **API Endpoint Management (UPDATED 2025-01-29)**

### ✅ **Use Centralized API Endpoints**

**All API endpoints are now centralized in `/frontend/src/lib/api/endpoints.ts`**

#### ❌ **DON'T: Hardcoded API Paths**
```typescript
// ❌ WRONG - Hardcoded paths
const response = await httpClient.get('/api/v1/programs');
const user = await httpClient.get('/api/v1/users/123');
const courses = await httpClient.get('/api/v1/courses');
```

#### ✅ **DO: Use Centralized Endpoints**
```typescript
// ✅ CORRECT - Centralized endpoints
import { httpClient, API_ENDPOINTS } from '@/lib/api/httpClient';

const response = await httpClient.get(API_ENDPOINTS.programs.list);
const user = await httpClient.get(API_ENDPOINTS.users.byId('123'));
const courses = await httpClient.get(API_ENDPOINTS.courses.list);
```

### 🔧 **API Service Implementation Pattern**

#### ✅ **Modern API Service Structure**
```typescript
// ✅ CORRECT - Feature API service using centralized endpoints
import { httpClient, API_ENDPOINTS } from '@/lib/api/httpClient';
import type { Feature, FeatureCreate, FeatureUpdate } from '../types';

export class FeatureApiService {
  static async getAll(params?: SearchParams) {
    return httpClient.get(API_ENDPOINTS.features.list, params);
  }

  static async getById(id: string) {
    return httpClient.get(API_ENDPOINTS.features.byId(id));
  }

  static async create(data: FeatureCreate) {
    return httpClient.post(API_ENDPOINTS.features.create, data);
  }

  static async update(id: string, data: FeatureUpdate) {
    return httpClient.put(API_ENDPOINTS.features.update(id), data);
  }

  static async delete(id: string) {
    return httpClient.delete(API_ENDPOINTS.features.delete(id));
  }
}
```

### 📝 **Available Endpoint Categories**

The centralized system includes endpoints for:
- **Authentication**: `API_ENDPOINTS.auth.*`
- **Programs**: `API_ENDPOINTS.programs.*`
- **Users**: `API_ENDPOINTS.users.*`
- **Students**: `API_ENDPOINTS.students.*`
- **Parents**: `API_ENDPOINTS.parents.*`
- **Courses**: `API_ENDPOINTS.courses.*`
- **Curricula**: `API_ENDPOINTS.curricula.*`
- **Content**: `API_ENDPOINTS.content.*`
- **Scheduling**: `API_ENDPOINTS.scheduling.*`
- **Equipment**: `API_ENDPOINTS.equipment.*`
- **Media**: `API_ENDPOINTS.media.*`
- **Organizations**: `API_ENDPOINTS.organizations.*`
- **Teams**: `API_ENDPOINTS.teams.*`
- **Facilities**: `API_ENDPOINTS.facilities.*`
- **Payments**: `API_ENDPOINTS.payments.*`  
- **System**: `API_ENDPOINTS.system.*`

### 🎯 **Benefits of Centralized Endpoints**

1. **Single Source of Truth**: All API paths in one location
2. **Type Safety**: Function-based endpoints prevent typos
3. **Easy Maintenance**: Update API version in one place
4. **Consistent Usage**: Same pattern across all features
5. **Better IDE Support**: Autocomplete and IntelliSense

### 🔄 **Migration from Legacy Endpoints**

If you encounter hardcoded paths in existing code:

```typescript
// ❌ Replace these patterns:
const BASE_PATH = '/api/v1/features';
await httpClient.get(`${BASE_PATH}/${id}`);
await httpClient.get('/api/v1/features/stats');

// ✅ With centralized endpoints:
await httpClient.get(API_ENDPOINTS.features.byId(id));
await httpClient.get(API_ENDPOINTS.features.stats);
```

## 📂 **File Structure Standards**

### 🎯 **Program Management Feature**
```
src/features/[feature-name]/
├── api/
│   ├── index.ts           # Export API services
│   └── featureApi.ts      # API service using httpClient
├── hooks/
│   └── index.ts           # Program context hooks  
├── types/
│   └── index.ts           # TypeScript types
├── components/
│   ├── FeatureCard.tsx
│   ├── FeatureForm.tsx
│   └── FeatureList.tsx
└── README.md              # Feature documentation
```

### 🏛️ **Academy Admin Feature**  
```
src/features/academy/[feature-name]/
├── api/
│   └── academyFeatureApi.ts  # API service with bypass headers
├── hooks/
│   └── index.ts              # Academy hooks (no program context)
├── types/
│   └── index.ts
└── components/
    └── AcademyFeatureManager.tsx
```

## 🔍 **Quality Assurance Requirements**

### 🧪 **Pre-Commit Testing**
**MANDATORY** - Run these commands before every commit:

```bash
npm run program-context:lint    # Validates program context compliance
npm run quality:academy        # Full Academy Admin checks  
npm run test:feature [name]     # Test your specific feature
```

### 🔧 **Recent Critical Fixes (2025-01-29)**
**All new development must follow these patterns to avoid common issues:**

#### **User Creation Best Practices**
- **Auto Full Name**: Always rely on service layer to generate `full_name` from `first_name + last_name`
- **Permission Validation**: Use proper role checks for user creation operations
- **Enum Consistency**: Ensure Python enums match database enum values exactly

#### **Service Method Naming**
- **Consistent Naming**: Use descriptive method names that match actual implementations
- **Route-Service Alignment**: Verify route handlers call correct service methods
- **Error Handling**: Implement proper error responses for missing methods

#### **Database Query Patterns**
- **Avoid DISTINCT Issues**: Use subquery filtering instead of JOIN + DISTINCT for program context
- **Proper Filtering**: Filter by relationships rather than obsolete direct foreign keys

### ✅ **Code Review Checklist**

**Program Management Features**:
- [ ] Uses `useProgramContext()` hook
- [ ] Query keys include `currentProgram?.id`  
- [ ] No bypass headers used
- [ ] Auto-refreshes on program switch
- [ ] Handles loading state when no program context
- [ ] Uses `usePageTitle()` hook
- [ ] Follows layout architecture (action buttons beside section headers)
- [ ] **NEW**: User creation uses auto `full_name` generation
- [ ] **NEW**: Permission checks validate role-based user creation access
- [ ] **NEW**: Service methods use correct names matching implementations
- [ ] **NEW**: Database queries avoid obsolete `program_id` direct references

**Academy Admin Features**:
- [ ] Wrapped in `SuperAdminRoute`
- [ ] Uses `X-Bypass-Program-Filter: true` headers
- [ ] No `useProgramContext()` used  
- [ ] Access to cross-program data
- [ ] Super Admin permissions enforced

### 🔬 **Testing Program Context Integration**

**Manual Testing Steps**:
1. **Login as Program Admin** (not Super Admin)
2. **Switch between different programs** using ProgramSwitcher
3. **Verify data auto-refreshes** for each program switch
4. **Check data filtering** - should only see program-specific data
5. **Test create/edit/delete operations** within program context

## 🚨 **Common Mistakes to Avoid**

### ❌ **DON'T: Direct API Calls in Pages**
```typescript
// ❌ WRONG - Direct API calls
const [data, setData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const response = await featureApi.getAll(); // Won't refresh on program switch!
    setData(response.data);
  };
  fetchData();
}, []); // Missing program dependency!
```

### ✅ **DO: Program Context Hooks**
```typescript
// ✅ CORRECT - Program context hooks
const { data, isLoading, error } = useFeatures(searchParams); // Auto-refreshes!
const features = data?.items || [];
```

### ❌ **DON'T: Manual State Management**
```typescript
// ❌ WRONG - Manual loading/error states
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

try {
  setLoading(true);
  const response = await api.getData();
  setData(response.data);
} finally {
  setLoading(false);
}
```

### ✅ **DO: Hook-Based State Management**
```typescript
// ✅ CORRECT - Hook-based states
const { data, isLoading, error } = useFeatures(); // Handled automatically!
```

### ❌ **DON'T: Manual Refresh After Mutations**
```typescript
// ❌ WRONG - Manual refresh
const handleDelete = async (id: string) => {
  await featureApi.delete(id);
  fetchData(); // Manual refresh
};
```

### ✅ **DO: Automatic Cache Invalidation**
```typescript
// ✅ CORRECT - Automatic refresh  
const deleteFeature = useDeleteFeature(); // Hook handles cache invalidation
const handleDelete = async (id: string) => {
  await deleteFeature.mutateAsync(id); // Auto-refreshes!
};
```

## 📖 **Reference Examples**

### 🎯 **Perfect Program Management Examples**
- ✅ **Facilities Page**: `/admin/facilities/page.tsx` - Recently updated template
- ✅ **Courses Page**: `/admin/courses/page.tsx` - Comprehensive hook usage
- ✅ **Students Page**: `/admin/students/page.tsx` - Mixed data (students + parents)

### 🏛️ **Perfect Academy Admin Examples**  
- ✅ **Users Page**: `/admin/users/page.tsx` - Correctly bypasses program context
- ✅ **Academy Programs**: `/admin/academy/programs/page.tsx` - Super Admin only

## 🔄 **Migration Path for Existing Pages**

If you find an existing page using direct API calls:

### Step 1: **Create Program Context Hooks**
```typescript
// Create /src/features/[feature]/hooks/index.ts following the standard pattern
```

### Step 2: **Replace useState with Hooks**  
```typescript
// Replace manual state management with useFeatures(), useFeatureStats(), etc.
```

### Step 3: **Update Handlers to Use Mutations**
```typescript
// Replace direct API calls in handlers with mutation hooks
```

### Step 4: **Remove Manual Loading/Error Logic**
```typescript
// Remove useEffect, manual loading states, manual error handling
```

### Step 5: **Test Program Context Switching**
```typescript
// Verify data auto-refreshes when switching programs
```

## 🎯 **Success Criteria**

A page is considered **program context compliant** when:

1. **✅ Auto-Refresh**: Data automatically updates when switching programs
2. **✅ Proper Filtering**: Only shows data for the current program context  
3. **✅ No Manual Loading**: Uses hook-based loading states
4. **✅ Consistent Error Handling**: Uses hook-based error handling
5. **✅ Cache Management**: Mutations automatically invalidate related queries
6. **✅ Performance**: Leverages TanStack Query caching and background updates

## 💡 **Pro Tips**

### 🚀 **Performance Optimization**
```typescript
// Use staleTime to reduce unnecessary requests
const { data } = useFeatures(params, {
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Use select to transform data and prevent unnecessary re-renders
const { data: featureNames } = useFeatures(params, {
  select: (data) => data.items.map(item => item.name),
});
```

### 🔄 **Background Updates**
```typescript
// Enable background refetching for always-fresh data
const { data } = useFeatures(params, {
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
});
```

### 🎯 **Conditional Queries** 
```typescript
// Disable queries when conditions aren't met
const { data } = useFeatureDetails(selectedId, {
  enabled: !!selectedId && !!currentProgram,
});
```

## 🔧 **Program Configuration Integration Patterns** ✅ **NEW (2025-08-02)**

When building features that need to integrate with Academy Administration Program configurations, follow these established patterns.

### 🎯 **Configuration Integration Requirements**

Features that create or manage program-specific data MUST integrate with program configuration:

- **Course Management**: Age groups, difficulty levels, session types
- **Curriculum Building**: Difficulty levels for progression structure
- **Scheduling System**: Session types with capacity limits
- **Student Assessment**: Difficulty levels for appropriate testing
- **Facility Management**: Session types for capacity planning

### ✅ **Dynamic Configuration Loading Pattern**

#### **1. Program Configuration Hooks**

Create hooks that automatically fetch configuration from Academy Administration:

```typescript
// /src/features/programs/hooks/useProgram.ts
export function useProgramAgeGroups(programId?: string) {
  const config = useProgramConfiguration(programId);
  return {
    ...config,
    data: config.data?.age_groups || [],
  };
}

export function useProgramDifficultyLevels(programId?: string) {
  const config = useProgramConfiguration(programId);
  return {
    ...config,
    data: config.data?.difficulty_levels || [],
  };
}

export function useProgramSessionTypes(programId?: string) {
  const config = useProgramConfiguration(programId);
  return {
    ...config,
    data: config.data?.session_types || [],
  };
}
```

#### **2. Smart Fallback System**

Always provide sensible defaults when program configuration is unavailable:

```typescript
// ✅ CORRECT - Smart fallback with user feedback
const { data: ageGroups, isLoading: ageGroupsLoading } = useProgramAgeGroups(currentProgram?.id);
const { data: difficultyLevels, isLoading: difficultyLoading } = useProgramDifficultyLevels(currentProgram?.id);

// Create options with fallbacks
const ageGroupOptions = ageGroups?.map(ag => ({ 
  value: ag.id, 
  label: ag.name 
})) || fallbackAgeRangeOptions;

const difficultyOptions = difficultyLevels?.map(dl => ({ 
  value: dl.id, 
  label: dl.name 
})) || fallbackDifficultyOptions;
```

#### **3. User Experience Guidelines**

Provide clear feedback about configuration sources:

```typescript
// Loading indicators
{ageGroupsLoading && <div className="text-sm text-muted-foreground">Loading from program...</div>}

// Source transparency
{ageGroups?.length > 0 ? (
  <div className="text-xs text-muted-foreground">
    Age groups from {currentProgram?.name} configuration
  </div>
) : (
  <div className="text-xs text-muted-foreground">
    Using default age groups • <Link to="/admin/academy/programs">Setup program configuration</Link>
  </div>
)}
```

### 🔄 **Performance Best Practices**

#### **Configuration Caching**
```typescript
// Use staleTime for configuration data (changes infrequently)
export function useProgramConfiguration(programId?: string) {
  return useQuery({
    queryKey: ['program-configuration', programId],
    queryFn: () => programApi.getProgram(programId!),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}
```

#### **Real-time Updates**
```typescript
// Configuration changes should reflect immediately
const queryClient = useQueryClient();

const updateProgramConfig = useMutation({
  mutationFn: programApi.updateProgram,
  onSuccess: () => {
    // Invalidate all program configuration queries
    queryClient.invalidateQueries({ queryKey: ['program-configuration'] });
  },
});
```

### 🏗️ **TypeScript Integration**

Define proper interfaces for configuration data:

```typescript
// /src/features/programs/api/index.ts
export interface AgeGroup {
  id: string;
  name: string;
  from_age: number;
  to_age: number;
}

export interface DifficultyLevel {
  id: string;
  name: string;
  weight: number;
}

export interface SessionType {
  id: string;
  name: string;
  capacity: number;
}

export interface ProgramConfiguration {
  age_groups: AgeGroup[];
  difficulty_levels: DifficultyLevel[];
  session_types: SessionType[];
  default_session_duration: number;
}
```

### 🧪 **Integration Testing**

Test configuration integration thoroughly:

```typescript
describe('Feature Program Configuration Integration', () => {
  test('uses program configuration when available', async () => {
    const mockProgram = {
      id: 'program-123',
      age_groups: [{ id: 'custom', name: 'Custom Age Group', from_age: 5, to_age: 10 }]
    };
    
    // Mock program configuration
    mockUseQuery.mockReturnValue({
      data: mockProgram,
      isLoading: false,
      error: null
    });
    
    render(<FeatureForm />);
    
    expect(screen.getByText('Custom Age Group')).toBeInTheDocument();
    expect(screen.getByText('Age groups from Test Program configuration')).toBeInTheDocument();
  });
  
  test('falls back to defaults when configuration unavailable', async () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });
    
    render(<FeatureForm />);
    
    expect(screen.getByText('6-8 years')).toBeInTheDocument(); // Default
    expect(screen.getByText('Using default age groups')).toBeInTheDocument();
  });
});
```

### 📋 **Implementation Checklist**

When adding program configuration integration:

- [ ] **Create Configuration Hooks**: Use the established hook pattern
- [ ] **Add TypeScript Interfaces**: Define proper types for configuration data
- [ ] **Implement Smart Fallbacks**: Provide defaults when configuration unavailable
- [ ] **Add Loading States**: Show loading indicators during configuration fetch
- [ ] **Provide Source Transparency**: Tell users where configuration comes from
- [ ] **Add Performance Optimization**: Use appropriate caching strategies
- [ ] **Write Integration Tests**: Test both configuration and fallback scenarios
- [ ] **Update Documentation**: Document new integration patterns
- [ ] **Add Error Handling**: Handle configuration fetch failures gracefully

### 🎯 **Integration Examples**

#### **Course Management Integration** ✅ **REFERENCE IMPLEMENTATION**
See `/frontend/src/features/courses/components/CourseForm.tsx` for the complete reference implementation showing:
- Dynamic configuration loading with `useProgramAgeGroups`, `useProgramDifficultyLevels`, `useProgramSessionTypes`
- Smart fallback system with sensible defaults
- User experience with loading states and source transparency
- Type-safe configuration handling

#### **Future Integration Patterns**
Use the course management integration as a template for:
- **Curriculum Builder**: Difficulty levels for progression structure
- **Session Scheduling**: Session types with capacity validation
- **Assessment Creation**: Difficulty levels for appropriate testing
- **Student Enrollment**: Age groups for course eligibility

---

## 📚 **Required Reading**

Before developing any new feature:

1. **📖 Read**: [`PROGRAM_CONTEXT_STANDARDS.md`](PROGRAM_CONTEXT_STANDARDS.md)
2. **🔍 Study**: Facilities page (`/admin/facilities/page.tsx`) as template
3. **🧪 Test**: Program switching behavior on existing compliant pages
4. **✅ Verify**: Run quality checks before committing

**Remember**: Program context integration is **mandatory**, not optional. Non-compliant pages will be rejected in code review.

## 🚀 **Quick Start Template**

Copy this template for new program management features:

```typescript
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { useNewFeature, useDeleteNewFeature } from '@/features/new-feature/hooks';

export default function NewFeaturePage() {
  usePageTitle('New Feature', 'Manage new feature within your program');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const searchParams = {
    search: searchTerm || undefined,
    page: currentPage,
    per_page: 20,
  };

  // ✅ Program context hooks - auto-refresh on program switch
  const { data, isLoading, error } = useNewFeature(searchParams);
  const deleteFeature = useDeleteNewFeature();
  
  const features = data?.items || [];

  const handleDelete = async (id: string) => {
    if (confirm('Delete this feature?')) {
      try {
        await deleteFeature.mutateAsync(id);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Action Button */}
      <div className="flex justify-end">
        <Button onClick={() => {}}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {/* Content */}
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!isLoading && !error && (
        <div className="grid gap-4">
          {features.map((feature) => (
            <div key={feature.id}>
              {feature.name}
              <Button onClick={() => handleDelete(feature.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

This template ensures your new feature will work correctly with program context from day one! 🎉