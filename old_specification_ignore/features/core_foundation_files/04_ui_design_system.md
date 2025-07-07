# UI Design System - Elitesgen Academy Management System

## Design Philosophy

### Core Principles
- **Professional & Clean**: Enterprise-grade interface that inspires confidence
- **Efficiency-Focused**: Optimized for daily administrative workflows
- **Consistent Experience**: Unified design language across all features
- **Accessibility First**: WCAG 2.1 AA compliance through Radix UI primitives
- **Responsive Design**: Desktop-optimized with mobile considerations

### Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: shadcn/ui component library built on Radix UI primitives
- **UI Primitives**: Radix UI for accessibility foundations
- **State Management**: Zustand for global state
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library

## Color System

### Primary Color Palette
- **Primary Purple**: `#8B5CF6` (violet-500) - Main brand color
- **Primary Purple Dark**: `#7C3AED` (violet-600) - Hover states
- **Primary Purple Light**: `#A78BFA` (violet-400) - Disabled states
- **Purple Gradient**: `linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)`

### Semantic Color System
- **Success**: `#10B981` (emerald-500) - Completed, Paid, Active states
- **Warning**: `#F59E0B` (amber-500) - Pending, Warning states
- **Error**: `#EF4444` (red-500) - Cancelled, Overdue, Error states
- **Info**: `#3B82F6` (blue-500) - Upcoming, Partial, In-progress states

### Neutral Color Palette
- **Gray 900**: `#111827` - Primary text, headers
- **Gray 700**: `#374151` - Secondary text
- **Gray 500**: `#6B7280` - Muted text, placeholders
- **Gray 300**: `#D1D5DB` - Borders, dividers
- **Gray 100**: `#F3F4F6` - Background surfaces
- **Gray 50**: `#F9FAFB` - Page backgrounds
- **White**: `#FFFFFF` - Card backgrounds, primary surfaces

## Typography System

### Font Family
- **Primary**: `Inter, system-ui, sans-serif` - Modern, readable interface font
- **Monospace**: `'JetBrains Mono', monospace` - Code, IDs, technical data

### Typography Scale
- **Display Large**: `text-4xl font-bold` (36px) - Page titles
- **Display Medium**: `text-3xl font-bold` (30px) - Section headers
- **Heading Large**: `text-2xl font-semibold` (24px) - Card titles
- **Heading Medium**: `text-xl font-semibold` (20px) - Sub-sections
- **Heading Small**: `text-lg font-medium` (18px) - Table headers
- **Body Large**: `text-base` (16px) - Primary body text
- **Body Medium**: `text-sm` (14px) - Secondary text, labels
- **Body Small**: `text-xs` (12px) - Captions, metadata
- **Caption**: `text-xs text-gray-500` (12px) - Supporting information

### Text Color Classes
- **Primary**: `text-gray-900` - Main content
- **Secondary**: `text-gray-700` - Secondary content
- **Muted**: `text-gray-500` - Supporting text
- **Success**: `text-emerald-600` - Success messages
- **Warning**: `text-amber-600` - Warning messages
- **Error**: `text-red-600` - Error messages
- **Link**: `text-violet-600 hover:text-violet-700` - Interactive links

## Spacing System

### Base Unit: 4px (0.25rem)
- **xs**: `4px` (0.25rem) - `space-1`
- **sm**: `8px` (0.5rem) - `space-2`
- **md**: `12px` (0.75rem) - `space-3`
- **lg**: `16px` (1rem) - `space-4`
- **xl**: `20px` (1.25rem) - `space-5`
- **2xl**: `24px` (1.5rem) - `space-6`
- **3xl**: `32px` (2rem) - `space-8`
- **4xl**: `48px` (3rem) - `space-12`
- **5xl**: `64px` (4rem) - `space-16`

### Component Spacing Guidelines
- **Card Padding**: `p-6` (24px) - Standard card internal spacing
- **Section Spacing**: `space-y-6` (24px) - Between major sections
- **Form Field Spacing**: `space-y-4` (16px) - Between form elements
- **Button Spacing**: `space-x-3` (12px) - Between buttons
- **Table Cell Padding**: `px-6 py-4` - Table cell internal spacing

## Component Library

### shadcn/ui Foundation
- **Component System**: Pre-built components using Radix UI primitives
- **Customization**: Tailwind CSS-based theming and variants
- **Accessibility**: Built-in WCAG compliance through Radix foundations
- **Consistency**: Unified design language across all components
- **Developer Experience**: Copy-paste components with full customization

### Core shadcn/ui Components

#### Form Components
- **Input**: `<Input />` - Text inputs with validation states
- **Textarea**: `<Textarea />` - Multi-line text input
- **Select**: `<Select />` - Dropdown selection with search
- **Checkbox**: `<Checkbox />` - Boolean selection
- **RadioGroup**: `<RadioGroup />` - Single selection from options
- **Switch**: `<Switch />` - Toggle boolean states
- **DatePicker**: `<Calendar />` + `<Popover />` - Date selection
- **Label**: `<Label />` - Form field labels with proper associations

#### Navigation Components
- **Button**: `<Button />` - Primary actions with variants (default, destructive, outline, secondary, ghost, link)
- **DropdownMenu**: `<DropdownMenu />` - Context menus and action lists
- **NavigationMenu**: `<NavigationMenu />` - Main navigation structure
- **Breadcrumb**: `<Breadcrumb />` - Hierarchical navigation
- **Tabs**: `<Tabs />` - Content organization and switching
- **Pagination**: `<Pagination />` - Data set navigation

#### Data Display Components
- **Table**: `<Table />` - Structured data display with sorting and filtering
- **Card**: `<Card />` - Content containers with headers and actions
- **Badge**: `<Badge />` - Status indicators and labels
- **Avatar**: `<Avatar />` - User profile images with fallbacks
- **Separator**: `<Separator />` - Visual content division
- **Skeleton**: `<Skeleton />` - Loading state placeholders

#### Feedback Components
- **Dialog**: `<Dialog />` - Modal windows and confirmations
- **AlertDialog**: `<AlertDialog />` - Critical action confirmations
- **Toast**: `<Toast />` - Temporary notifications
- **Alert**: `<Alert />` - Persistent notifications and messages
- **Progress**: `<Progress />` - Task completion indicators
- **Spinner**: Custom loading indicators

#### Layout Components
- **Sheet**: `<Sheet />` - Sliding panels and drawers
- **Popover**: `<Popover />` - Contextual information displays
- **HoverCard**: `<HoverCard />` - Rich hover previews
- **Tooltip**: `<Tooltip />` - Contextual help text
- **Collapsible**: `<Collapsible />` - Expandable content sections
- **Accordion**: `<Accordion />` - FAQ-style content organization

### Custom Component Extensions

#### Academy-Specific Components
- **ProgramSwitcher**: Multi-program context selection
- **FacilityBadge**: Location identification with status
- **StudentProgressCard**: Visual progress tracking
- **SessionScheduleGrid**: Calendar-style session display
- **AssessmentStarRating**: 0-3 star visual rating system
- **CurriculumTreeView**: Hierarchical curriculum navigation
- **AttendanceMarker**: Quick attendance status toggle
- **PaymentStatusBadge**: Financial status indicators

#### Enhanced Form Components
- **SearchableSelect**: Select with real-time search filtering
- **MultiSelect**: Multiple option selection with chips
- **DateRangePicker**: Start and end date selection
- **TimeSlotPicker**: Available time slot selection
- **FileUpload**: Document and media upload interface
- **RichTextEditor**: Enhanced text editing for descriptions

#### Data Visualization Components
- **StatsCard**: Key metric display with trends
- **ProgressChart**: Student advancement visualization
- **AttendanceChart**: Attendance pattern displays
- **ScheduleCalendar**: Monthly session overview
- **EnrollmentFunnel**: Enrollment status pipeline

### Layout Components

#### Main Application Shell
- **Sidebar**: Fixed 256px width, purple gradient background
- **Header**: 64px height with page title and actions
- **Content Area**: Flexible width with max-width constraints
- **Footer**: Minimal height with essential links

#### Grid System
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Two Column**: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- **Three Column**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Auto Fit**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-auto-fit gap-6`

### Navigation Components

#### Sidebar Navigation
- **Primary Menu**: Hierarchical structure with icons
- **User Profile**: Avatar, name, role display at top
- **Program Switcher**: Dropdown for multi-program context
- **Logout**: Fixed at bottom of sidebar

#### Breadcrumb Navigation
- **Style**: `text-sm text-gray-500` with `>` separators
- **Active**: Last item in `text-gray-900 font-medium`
- **Links**: Hover states with `text-violet-600`

#### Tab Navigation
- **Style**: Horizontal tabs with bottom border
- **Active Tab**: `border-b-2 border-violet-500 text-violet-600`
- **Inactive Tab**: `text-gray-500 hover:text-gray-700`

### Data Display Components

#### Cards
- **Standard Card**: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
- **Header Card**: Additional `border-l-4 border-violet-500` accent
- **Stats Card**: Centered content with large numbers
- **Action Card**: Hover states with `hover:shadow-md` transition

#### Tables
- **Table Container**: `bg-white shadow-sm rounded-lg overflow-hidden`
- **Table Header**: `bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`
- **Table Row**: `px-6 py-4 whitespace-nowrap` with alternating backgrounds
- **Action Buttons**: Right-aligned with consistent spacing

#### Lists
- **Simple List**: Clean vertical list with dividers
- **Avatar List**: Profile pictures with names and metadata
- **Action List**: List items with trailing action buttons

### Form Components

#### Input Fields
- **Base Input**: `block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500`
- **Error State**: `border-red-300 focus:border-red-500 focus:ring-red-500`
- **Disabled State**: `bg-gray-50 text-gray-500 cursor-not-allowed`

#### Select Dropdowns
- **Base Select**: Consistent styling with input fields
- **Multi-Select**: Chip-based selection with clear indicators
- **Searchable Select**: Integrated search functionality

#### Buttons
- **Primary Button**: `bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md font-medium`
- **Secondary Button**: `bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-medium`
- **Danger Button**: `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium`
- **Text Button**: `text-violet-600 hover:text-violet-700 font-medium`

#### Form Layout
- **Two Column Form**: `grid grid-cols-1 md:grid-cols-2 gap-6`
- **Form Section**: `space-y-6` with section headers
- **Field Group**: `space-y-1` for label and input
- **Form Actions**: Right-aligned button group at bottom

### Status & Feedback Components

#### Status Badges
- **Active**: `bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium`
- **Pending**: `bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium`
- **Inactive**: `bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium`
- **Error**: `bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium`

#### Progress Indicators
- **Progress Bar**: Violet gradient with percentage display
- **Step Indicator**: Numbered steps with completion states
- **Loading Spinner**: Violet-colored with smooth animation

#### Toast Notifications
- **Success Toast**: Emerald background with checkmark icon
- **Error Toast**: Red background with error icon
- **Info Toast**: Blue background with info icon
- **Warning Toast**: Amber background with warning icon

### Modal & Overlay Components

#### Modal Windows
- **Modal Overlay**: `fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity`
- **Modal Panel**: `bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full`
- **Modal Header**: `px-6 py-4 border-b border-gray-200`
- **Modal Body**: `px-6 py-4`
- **Modal Footer**: `px-6 py-4 bg-gray-50 flex justify-end space-x-3`

#### Dropdown Menus
- **Dropdown Container**: `absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`
- **Dropdown Item**: `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`
- **Dropdown Divider**: `border-t border-gray-100`

### Interactive Components

#### Search & Filters
- **Search Bar**: Icon prefix with placeholder text
- **Filter Dropdown**: Multi-select with apply/clear actions
- **Sort Options**: Dropdown with directional indicators

#### Pagination
- **Page Numbers**: Centered with previous/next navigation
- **Page Info**: "Showing X of Y results" display
- **Items Per Page**: Configurable page size selector

#### Date & Time Pickers
- **Date Picker**: Calendar popup with range selection
- **Time Picker**: Dropdown with 15-minute intervals
- **Date Range**: Start and end date selection

## Animation & Transitions

### Transition Classes
- **Standard**: `transition-all duration-200 ease-in-out`
- **Fast**: `transition-all duration-150 ease-in-out`
- **Slow**: `transition-all duration-300 ease-in-out`

### Common Animations
- **Fade In**: `animate-fadeIn` - Opacity 0 to 1
- **Slide Up**: `animate-slideUp` - Transform Y translation
- **Scale In**: `animate-scaleIn` - Scale from 0.95 to 1
- **Bounce**: `animate-bounce` - For success feedback

### Hover States
- **Cards**: `hover:shadow-md transition-shadow duration-200`
- **Buttons**: Color transitions with `transition-colors duration-200`
- **Links**: `hover:text-violet-700 transition-colors duration-150`

## Responsive Design

### Breakpoint System
- **sm**: `640px` - Small tablets and large phones
- **md**: `768px` - Tablets
- **lg**: `1024px` - Small desktops
- **xl**: `1280px` - Large desktops
- **2xl**: `1536px` - Extra large screens

### Desktop-First Approach
- **Primary**: Optimized for 1200px+ screens
- **Tablet**: Graceful degradation for 768px-1024px
- **Mobile**: Functional but simplified for <768px

### Responsive Patterns
- **Navigation**: Collapsible sidebar on mobile
- **Tables**: Horizontal scroll on small screens
- **Forms**: Single column on mobile, two column on desktop
- **Modals**: Full screen on mobile, centered on desktop

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles

### Semantic HTML
- **Headings**: Proper heading hierarchy (h1-h6)
- **Lists**: Semantic list markup for navigation and data
- **Forms**: Label associations and fieldset grouping
- **Tables**: Header associations and caption elements

### Radix UI Integration
- **Primitives**: Accessible component primitives
- **Keyboard Support**: Built-in keyboard navigation
- **ARIA Support**: Automatic ARIA attribute management
- **Focus Management**: Proper focus trap and restoration

## Component Usage Guidelines

### Consistency Rules
- **Spacing**: Use design system spacing scale consistently
- **Colors**: Stick to defined color palette and semantic meanings
- **Typography**: Use established type scale and weights
- **Components**: Reuse existing components before creating new ones

### Performance Considerations
- **Bundle Size**: Import only needed Tailwind utilities
- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Lazy load heavy components
- **Animation Performance**: Use CSS transforms for smooth animations

### Development Workflow
- **Component Library**: Centralized component definitions
- **Design Tokens**: Shared design values across components
- **Testing**: Visual regression testing for UI consistency
- **Documentation**: Storybook-style component documentation

This comprehensive design system ensures consistent, professional, and accessible user interfaces throughout the Elitesgen Academy Management System, providing a solid foundation for efficient administrative workflows and future mobile app development.