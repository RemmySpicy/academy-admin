# Frontend Layout Architecture

## Overview

The Academy Admin frontend uses a **context-based layout architecture** that provides clean separation of concerns and consistent user experience across all feature pages.

## Architecture Components

### 1. **PageHeaderContext**

Global React context that manages page titles and descriptions for the header.

```typescript
// Location: src/contexts/PageHeaderContext.tsx
interface PageHeaderContextType {
  title?: string;
  description?: string;
  setPageHeader: (title?: string, description?: string) => void;
}
```

### 2. **usePageTitle Hook**

Convenience hook for feature pages to set their title and description in the global header.

```typescript
// Location: src/hooks/usePageTitle.tsx
export function usePageTitle(title?: string, description?: string) {
  const { setPageHeader } = usePageHeader();
  
  useEffect(() => {
    setPageHeader(title, description);
    return () => setPageHeader(undefined, undefined); // Cleanup on unmount
  }, [title, description, setPageHeader]);
}
```

### 3. **DashboardLayout Component**

Main layout wrapper that provides the sidebar, header, and content area. Now integrates with PageHeaderContext.

```typescript
// Location: src/components/layout/DashboardLayout.tsx
export function DashboardLayout({ children, title, description, headerActions }: DashboardLayoutProps) {
  const { title: contextTitle, description: contextDescription } = usePageHeader();
  
  // Use context values if available, otherwise fall back to props
  const displayTitle = contextTitle || title;
  const displayDescription = contextDescription || description;
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header title={displayTitle} description={displayDescription}>
            {headerActions}
          </Header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

### 4. **Header Component**

Global header that displays page titles on the left and program context on the right.

```typescript
// Location: src/components/layout/Header.tsx
export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6">
      {/* Left section - Legacy children support */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        {children}
      </div>

      {/* Left section - Page title and description */}
      <div className="flex-1 flex flex-col justify-center min-w-0 px-2 sm:px-4">
        {title && (
          <div className="min-w-0 w-full">
            <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
            {description && (
              <p className="hidden sm:block text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right section - Program Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <ProgramSwitcher />
      </div>
    </header>
  );
}
```

### 5. **Admin Layout Integration**

The admin layout provides the PageHeaderContext to all feature pages.

```typescript
// Location: src/app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <PageHeaderProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </PageHeaderProvider>
    </RouteGuard>
  );
}
```

## Feature Page Patterns

### 1. **Basic Feature Page Structure**

All feature pages follow this pattern:

```typescript
export default function FeaturePage() {
  // Set page header information
  usePageTitle('Feature Name', 'Feature description for global header');
  
  return (
    <div className="space-y-6">
      {/* Page content goes here */}
    </div>
  );
}
```

### 2. **Pages with Tabs**

For pages that use tabs, action buttons are placed beside section headers within each tab:

```typescript
export default function TabbedFeaturePage() {
  usePageTitle('Feature Name', 'Feature description');
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tab1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Section Title</CardTitle>
                  <CardDescription>Section description</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Tab content */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 3. **Pages without Tabs**

For simple pages without tabs, action buttons are positioned at the top-right:

```typescript
export default function SimpleFeaturePage() {
  usePageTitle('Feature Name', 'Feature description');
  
  return (
    <div className="space-y-6">
      {/* Main Action Button */}
      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      
      {/* Page content */}
      <Card>
        {/* Feature content */}
      </Card>
    </div>
  );
}
```

## Design Principles

### 1. **Single Source of Truth**
- Page titles and descriptions are managed by PageHeaderContext
- No duplicate headers or layouts within feature pages
- Clean separation between global navigation and page content

### 2. **Contextual Action Placement**
- Action buttons are positioned beside the relevant content they affect
- For tabbed interfaces: buttons beside section headers within tabs
- For simple pages: buttons at top-right of page content area
- Never in the global header to maintain clear information hierarchy

### 3. **Responsive Design**
- Headers adapt to screen size with appropriate text truncation
- Action button placement remains consistent across viewport sizes
- Mobile-first approach with progressive enhancement

### 4. **Component Reusability**
- Layout components are reusable across different feature areas
- Context system allows for flexible page header management
- Consistent patterns reduce cognitive load for developers

## Benefits

1. **Consistency**: All pages follow the same layout patterns
2. **Maintainability**: Clear separation of concerns makes updates easier
3. **User Experience**: Predictable layout and action button placement
4. **Developer Experience**: Simple hooks and patterns for new features
5. **Performance**: Context-based approach minimizes re-renders

## Migration Notes

When updating existing pages to follow this architecture:

1. Remove any `DashboardLayout` wrappers from feature pages
2. Add `usePageTitle(title, description)` at the top of the component
3. Remove local page headers (title/description divs)
4. Move action buttons to appropriate contextual locations
5. Ensure proper JSX structure with matching opening/closing tags

## File Locations

- **Context**: `src/contexts/PageHeaderContext.tsx`
- **Hook**: `src/hooks/usePageTitle.tsx`
- **Layout**: `src/components/layout/DashboardLayout.tsx`
- **Header**: `src/components/layout/Header.tsx`
- **Admin Layout**: `src/app/admin/layout.tsx`
- **Example Pages**: All files in `src/app/admin/*/page.tsx`