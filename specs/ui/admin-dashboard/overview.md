# Admin Dashboard Overview UI Specification

## Interface Overview

The admin dashboard provides a comprehensive overview and navigation hub for the Academy Management System. It serves as the primary interface for Super Admins and Program Admins to access all system features, monitor key metrics, and manage day-to-day operations.

## User Flow

### Initial Access
1. User logs in through authentication system
2. Dashboard loads with role-appropriate features
3. Location context is established (if applicable)
4. Dashboard displays personalized overview

### Navigation Flow
1. **Primary Navigation**: Main menu access to all features
2. **Quick Actions**: Immediate access to common tasks
3. **Context Switching**: Location and program switching
4. **Search**: Global search across all data

### Dashboard Interaction
1. **Overview Cards**: Key metrics and statistics
2. **Recent Activity**: Latest system activities
3. **Quick Access**: Shortcuts to frequently used features
4. **Alerts**: System notifications and warnings

## Layout Specifications

### Overall Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo | Navigation | Search | Location | User        │
├─────────────────────────────────────────────────────────────┤
│ Sidebar          │ Main Content Area                        │
│ ┌─────────────┐  │ ┌─────────────────────────────────────┐   │
│ │ Navigation  │  │ │ Dashboard Content                   │   │
│ │ Menu        │  │ │ - Overview Cards                    │   │
│ │             │  │ │ - Recent Activity                   │   │
│ │             │  │ │ - Quick Actions                     │   │
│ │             │  │ │ - Charts & Analytics               │   │
│ │             │  │ └─────────────────────────────────────┘   │
│ └─────────────┘  │                                          │
├─────────────────────────────────────────────────────────────┤
│ Footer: System Status | Help | Support                      │
└─────────────────────────────────────────────────────────────┘
```

### Desktop Layout (≥1024px)
- **Header Height**: 64px
- **Sidebar Width**: 280px (expanded), 80px (collapsed)
- **Main Content**: Remaining width with max-width 1600px
- **Footer Height**: 40px

### Tablet Layout (768px - 1023px)
- **Header Height**: 64px
- **Sidebar**: Overlay when opened, hidden by default
- **Main Content**: Full width with 24px margins
- **Footer Height**: 40px

### Mobile Layout (<768px)
- **Header Height**: 56px
- **Sidebar**: Overlay when opened, hidden by default
- **Main Content**: Full width with 16px margins
- **Footer**: Minimal or hidden

## Component Specifications

### Header Component
```typescript
interface HeaderProps {
  user: User;
  currentLocation?: Location;
  locations?: Location[];
  onLocationChange?: (locationId: string) => void;
  onLogout?: () => void;
}
```

#### Header Elements
1. **Logo/Brand** (Left)
   - Academy logo or name
   - Link to dashboard home
   - Size: 32px height

2. **Primary Navigation** (Left-Center)
   - Main menu items
   - Responsive collapse on mobile
   - Active state indicators

3. **Global Search** (Center)
   - Search input with icon
   - Expandable on mobile
   - Search suggestions dropdown

4. **Location Switcher** (Right-Center)
   - Current location display
   - Dropdown for location selection
   - "All Locations" option for Super Admins

5. **User Menu** (Right)
   - User avatar/initials
   - Dropdown with profile options
   - Logout functionality

### Sidebar Navigation
```typescript
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  userRole: 'super_admin' | 'program_admin';
  currentLocation?: Location;
}
```

#### Navigation Structure
```
Dashboard
├── Overview
├── Students
│   ├── All Students
│   ├── Add Student
│   └── Student Reports
├── Parents
│   ├── All Parents
│   ├── Add Parent
│   └── Parent Communications
├── Scheduling
│   ├── Calendar View
│   ├── Create Session
│   ├── Manage Bookings
│   └── Instructor Schedule
├── Curriculum
│   ├── Program Builder
│   ├── Assessment Rubrics
│   ├── Content Library
│   └── Equipment Management
├── Locations (Super Admin only)
│   ├── All Locations
│   ├── Add Location
│   └── Location Reports
├── Administration
│   ├── User Management (Super Admin only)
│   ├── System Settings
│   └── Audit Logs
└── Reports
    ├── Student Progress
    ├── Financial Reports
    ├── Attendance Reports
    └── Analytics Dashboard
```

#### Navigation States
- **Active**: Current page highlighted
- **Hover**: Subtle background change
- **Expanded**: Full text and icons
- **Collapsed**: Icons only with tooltips

### Main Content Area
```typescript
interface MainContentProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}
```

#### Content Layout Patterns
1. **Dashboard Grid**: 12-column responsive grid
2. **Card Layout**: Consistent card containers
3. **Section Spacing**: 32px between major sections
4. **Content Padding**: 24px on desktop, 16px on mobile

### Dashboard Overview Cards
```typescript
interface OverviewCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'stable';
    period: string;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

#### Overview Cards Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Total       │ │ Active      │ │ New This    │ │ Revenue     │ │
│ │ Students    │ │ Sessions    │ │ Month       │ │ This Month  │ │
│ │ 1,234       │ │ 56          │ │ 89          │ │ $12,345     │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Instructors │ │ Locations   │ │ Programs    │ │ Capacity    │ │
│ │ 12          │ │ 3           │ │ 8           │ │ 85%         │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Recent Activity Feed
```typescript
interface ActivityItem {
  id: string;
  type: 'student' | 'session' | 'enrollment' | 'payment' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user: User;
  metadata?: Record<string, any>;
}
```

#### Activity Display
- **Timeline Layout**: Chronological list
- **Action Icons**: Type-specific icons
- **Timestamps**: Relative times (2 hours ago)
- **User Attribution**: Who performed the action
- **Quick Actions**: Jump to related item

### Quick Actions Panel
```typescript
interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  permission?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}
```

#### Common Quick Actions
- **Add Student**: Create new student profile
- **Schedule Session**: Quick session creation
- **View Calendar**: Jump to scheduling calendar
- **Generate Report**: Access reporting tools
- **Manage Enrollments**: Student enrollment management
- **System Settings**: Access configuration

### Charts and Analytics
```typescript
interface ChartProps {
  title: string;
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'area';
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  onTimeframeChange?: (timeframe: string) => void;
}
```

#### Chart Types
1. **Enrollment Trends**: Line chart showing student growth
2. **Session Utilization**: Bar chart of session capacity
3. **Revenue Analysis**: Area chart of financial performance
4. **Program Distribution**: Pie chart of program enrollment

## Responsive Behavior

### Desktop (≥1024px)
- **Sidebar**: Always visible, collapsible
- **Grid**: 4-column card layout
- **Charts**: Full-width with side-by-side comparison
- **Navigation**: Full menu structure

### Tablet (768px - 1023px)
- **Sidebar**: Overlay on demand
- **Grid**: 2-column card layout
- **Charts**: Stacked layout
- **Navigation**: Hamburger menu

### Mobile (<768px)
- **Sidebar**: Full-screen overlay
- **Grid**: Single column layout
- **Charts**: Simplified mobile-optimized versions
- **Navigation**: Bottom navigation or hamburger

## Interaction Patterns

### Navigation Interactions
```typescript
// Navigation state management
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// Auto-collapse on mobile
useEffect(() => {
  if (window.innerWidth < 768) {
    setSidebarCollapsed(true);
  }
}, []);
```

### Search Functionality
```typescript
// Global search with debouncing
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

const debouncedSearch = useCallback(
  debounce((query: string) => {
    performSearch(query);
  }, 300),
  []
);
```

### Card Interactions
- **Hover Effects**: Subtle shadow and transform
- **Click Actions**: Navigate to detailed view
- **Quick Actions**: Inline action buttons
- **Data Refresh**: Pull-to-refresh on mobile

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical tab sequence
- **Skip Links**: Skip to main content
- **Keyboard Shortcuts**: Common actions
- **Focus Management**: Proper focus handling

### Screen Reader Support
```typescript
// ARIA labels and descriptions
<nav aria-label="Main navigation">
  <ul role="list">
    <li role="listitem">
      <a href="/students" aria-current="page">
        Students
      </a>
    </li>
  </ul>
</nav>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {notification && <div>{notification}</div>}
</div>
```

### High Contrast Support
- **Color Contrast**: Minimum 4.5:1 ratio
- **Focus Indicators**: Visible focus outlines
- **Alternative Text**: All icons have alt text
- **Semantic HTML**: Proper heading hierarchy

## Performance Considerations

### Loading States
```typescript
// Skeleton loading for dashboard cards
const OverviewCardSkeleton = () => (
  <Card>
    <CardContent>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
      </div>
    </CardContent>
  </Card>
);
```

### Data Fetching
- **Lazy Loading**: Load components on demand
- **Caching**: Cache frequently accessed data
- **Real-time Updates**: WebSocket for live data
- **Pagination**: Efficient data loading

### Code Splitting
```typescript
// Lazy load dashboard sections
const StudentManagement = lazy(() => import('./StudentManagement'));
const Scheduling = lazy(() => import('./Scheduling'));
const Curriculum = lazy(() => import('./Curriculum'));

// Suspense boundaries for loading states
<Suspense fallback={<DashboardSkeleton />}>
  <StudentManagement />
</Suspense>
```

## Error Handling

### Error States
```typescript
interface ErrorBoundaryProps {
  fallback: React.ComponentType<{error: Error}>;
  onError?: (error: Error) => void;
}

// Error display component
const ErrorFallback = ({ error }: { error: Error }) => (
  <Card>
    <CardContent>
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    </CardContent>
  </Card>
);
```

### Network Error Handling
- **Offline Detection**: Show offline status
- **Retry Logic**: Automatic retry for failed requests
- **Graceful Degradation**: Fallback functionality
- **Error Notifications**: User-friendly error messages

## Testing Requirements

### Unit Testing
- **Component Rendering**: Test all components render correctly
- **User Interactions**: Test click handlers and navigation
- **Responsive Behavior**: Test layout changes
- **Accessibility**: Test keyboard navigation and ARIA

### Integration Testing
- **Authentication Flow**: Test login and role-based access
- **Data Fetching**: Test API integration
- **Navigation**: Test routing and deep linking
- **State Management**: Test global state updates

### Performance Testing
- **Load Times**: Dashboard should load within 2 seconds
- **Memory Usage**: Monitor for memory leaks
- **Bundle Size**: Keep JavaScript bundle under 500KB
- **Rendering Performance**: Smooth 60fps interactions

## Implementation Notes

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Charts**: Recharts

### File Structure
```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── components/
├── components/
│   ├── ui/
│   ├── dashboard/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── OverviewCard.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── QuickActions.tsx
│   └── layout/
├── hooks/
├── lib/
└── types/
```

### Performance Optimizations
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Optimize expensive calculations
- **Virtual Scrolling**: For large data lists
- **Image Optimization**: Next.js Image component
- **Font Loading**: Optimize web font loading