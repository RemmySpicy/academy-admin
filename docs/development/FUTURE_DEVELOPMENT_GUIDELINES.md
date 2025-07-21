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

### ✅ **Code Review Checklist**

**Program Management Features**:
- [ ] Uses `useProgramContext()` hook
- [ ] Query keys include `currentProgram?.id`  
- [ ] No bypass headers used
- [ ] Auto-refreshes on program switch
- [ ] Handles loading state when no program context
- [ ] Uses `usePageTitle()` hook
- [ ] Follows layout architecture (action buttons beside section headers)

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