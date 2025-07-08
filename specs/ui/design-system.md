# Design System Specification

## Overview

The Academy Management System design system provides a comprehensive foundation for building consistent, accessible, and professional interfaces across all admin dashboard components. Built on shadcn/ui components with Tailwind CSS, it ensures visual consistency and excellent user experience.

## Design Philosophy

### Core Principles
- **Consistency**: Unified visual language across all interfaces
- **Accessibility**: WCAG 2.1 AA compliance for all components
- **Scalability**: Modular system that grows with the application
- **Professional**: Business-appropriate design for educational institutions
- **Efficiency**: Optimized for desktop-first admin workflows

### Visual Hierarchy
- **Primary Actions**: Prominent buttons and primary navigation
- **Secondary Actions**: Supporting actions and alternative paths
- **Tertiary Actions**: Utility actions and less common operations
- **Information Display**: Clear data presentation and status indicators

## Color Palette

### Primary Colors
```css
/* Academy Blue - Primary brand color */
--primary: 220 91% 50%;           /* #1e40af */
--primary-foreground: 210 40% 98%; /* #f8fafc */

/* Success Green - Positive actions and status */
--success: 142 76% 36%;           /* #16a34a */
--success-foreground: 355 100% 97%; /* #fef7f7 */

/* Warning Orange - Caution and attention */
--warning: 25 95% 53%;            /* #f59e0b */
--warning-foreground: 60 9% 98%;  /* #fefce8 */

/* Error Red - Errors and destructive actions */
--error: 0 72% 51%;               /* #dc2626 */
--error-foreground: 0 86% 97%;    /* #fef2f2 */
```

### Neutral Colors
```css
/* Background Colors */
--background: 0 0% 100%;          /* #ffffff */
--foreground: 222 84% 5%;         /* #0a0a0a */

/* Surface Colors */
--card: 0 0% 100%;                /* #ffffff */
--card-foreground: 222 84% 5%;    /* #0a0a0a */

/* Border Colors */
--border: 214 32% 91%;            /* #e2e8f0 */
--input: 214 32% 91%;             /* #e2e8f0 */

/* Muted Colors */
--muted: 210 40% 96%;             /* #f1f5f9 */
--muted-foreground: 215 16% 47%;  /* #64748b */

/* Accent Colors */
--accent: 210 40% 96%;            /* #f1f5f9 */
--accent-foreground: 222 84% 5%;  /* #0a0a0a */
```

### Status Colors
```css
/* Attendance Status */
--present: 142 76% 36%;           /* #16a34a - Green */
--absent: 0 72% 51%;              /* #dc2626 - Red */
--excused: 25 95% 53%;            /* #f59e0b - Orange */

/* Payment Status */
--paid: 142 76% 36%;              /* #16a34a - Green */
--overdue: 0 72% 51%;             /* #dc2626 - Red */
--sent: 25 95% 53%;               /* #f59e0b - Orange */

/* Session Status */
--completed: 142 76% 36%;         /* #16a34a - Green */
--upcoming: 220 91% 50%;          /* #1e40af - Blue */
--cancelled: 0 72% 51%;           /* #dc2626 - Red */
```

## Typography

### Font Stack
```css
/* Primary Font - Inter */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace Font - JetBrains Mono */
font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Font Scales
```css
/* Heading Scale */
--text-4xl: 2.25rem;    /* 36px - Page titles */
--text-3xl: 1.875rem;   /* 30px - Section headers */
--text-2xl: 1.5rem;     /* 24px - Card titles */
--text-xl: 1.25rem;     /* 20px - Subheadings */
--text-lg: 1.125rem;    /* 18px - Large text */

/* Body Scale */
--text-base: 1rem;      /* 16px - Body text */
--text-sm: 0.875rem;    /* 14px - Small text */
--text-xs: 0.75rem;     /* 12px - Captions */
```

### Font Weights
```css
--font-light: 300;      /* Light text */
--font-normal: 400;     /* Normal text */
--font-medium: 500;     /* Medium emphasis */
--font-semibold: 600;   /* Strong emphasis */
--font-bold: 700;       /* Bold text */
```

## Spacing System

### Spacing Scale
```css
/* Spacing Units (rem) */
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

### Component Spacing
- **Button padding**: 0.5rem 1rem (8px 16px)
- **Card padding**: 1.5rem (24px)
- **Modal padding**: 2rem (32px)
- **Form field spacing**: 1rem (16px)
- **Section spacing**: 2rem (32px)

## Component Library

### Button Components

#### Primary Button
```css
/* Primary actions - Create, Save, Submit */
background: var(--primary);
color: var(--primary-foreground);
border-radius: 0.375rem;
padding: 0.5rem 1rem;
font-weight: 500;
```

#### Secondary Button
```css
/* Secondary actions - Cancel, Back */
background: transparent;
border: 1px solid var(--border);
color: var(--foreground);
border-radius: 0.375rem;
padding: 0.5rem 1rem;
font-weight: 500;
```

#### Destructive Button
```css
/* Destructive actions - Delete, Remove */
background: var(--error);
color: var(--error-foreground);
border-radius: 0.375rem;
padding: 0.5rem 1rem;
font-weight: 500;
```

### Card Components

#### Standard Card
```css
/* Basic card container */
background: var(--card);
border: 1px solid var(--border);
border-radius: 0.5rem;
padding: 1.5rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

#### Statistics Card
```css
/* Dashboard statistics display */
background: var(--card);
border: 1px solid var(--border);
border-radius: 0.5rem;
padding: 1.5rem;
text-align: center;
```

### Input Components

#### Text Input
```css
/* Standard text input */
border: 1px solid var(--input);
border-radius: 0.375rem;
padding: 0.5rem 0.75rem;
font-size: 0.875rem;
background: var(--background);
```

#### Select Input
```css
/* Dropdown select */
border: 1px solid var(--input);
border-radius: 0.375rem;
padding: 0.5rem 0.75rem;
font-size: 0.875rem;
background: var(--background);
```

#### Search Input
```css
/* Search input with icon */
border: 1px solid var(--input);
border-radius: 0.375rem;
padding: 0.5rem 0.75rem;
padding-left: 2.5rem;
font-size: 0.875rem;
background: var(--background);
```

### Table Components

#### Data Table
```css
/* Standard data table */
border: 1px solid var(--border);
border-radius: 0.5rem;
overflow: hidden;

/* Table header */
thead {
  background: var(--muted);
  font-weight: 600;
}

/* Table rows */
tbody tr:nth-child(even) {
  background: var(--muted);
}
```

### Status Components

#### Status Badge
```css
/* Status indicator badge */
border-radius: 9999px;
padding: 0.25rem 0.75rem;
font-size: 0.75rem;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.025em;
```

#### Progress Bar
```css
/* Progress indicator */
background: var(--muted);
border-radius: 9999px;
height: 0.5rem;
overflow: hidden;
```

## Layout System

### Grid System
```css
/* 12-column grid */
.grid-cols-12 {
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

/* Common grid patterns */
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
```

### Flexbox Utilities
```css
/* Flex containers */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }

/* Flex alignment */
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
```

### Container Sizes
```css
/* Container widths */
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1536px; }
```

## Interactive States

### Hover States
```css
/* Button hover */
button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Card hover */
.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Link hover */
a:hover {
  text-decoration: underline;
}
```

### Focus States
```css
/* Focus ring */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Input focus */
input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### Active States
```css
/* Button active */
button:active {
  transform: translateY(0);
}

/* Link active */
a:active {
  color: var(--primary);
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile first breakpoints */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Responsive Patterns
- **Desktop-first**: Optimized for desktop admin workflows
- **Mobile-friendly**: Responsive behavior for smaller screens
- **Touch-friendly**: Adequate touch targets on mobile devices
- **Scalable**: Consistent scaling across all screen sizes

## Accessibility Guidelines

### WCAG 2.1 AA Compliance
- **Color contrast**: 4.5:1 minimum ratio for normal text
- **Large text contrast**: 3:1 minimum ratio for large text
- **Focus indicators**: Visible focus states for all interactive elements
- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader support**: Proper ARIA labels and descriptions

### Semantic HTML
- **Proper heading hierarchy**: h1 → h2 → h3 structure
- **Form labels**: Associated labels for all form controls
- **Landmark roles**: Navigation, main, complementary regions
- **Button roles**: Proper button vs. link usage

## Animation System

### Transition Timing
```css
/* Standard transitions */
transition-duration: 150ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Slow transitions */
transition-duration: 300ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Fast transitions */
transition-duration: 75ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations
- **Fade in/out**: Opacity transitions
- **Slide in/out**: Transform transitions
- **Scale**: Transform scale transitions
- **Rotate**: Transform rotate transitions

## Icon System

### Icon Library
- **Lucide React**: Primary icon library
- **Radix UI Icons**: Supplementary icons
- **Consistent sizing**: 16px, 20px, 24px standard sizes
- **Semantic usage**: Icons support text, not replace it

### Icon Guidelines
- **Accessibility**: Alt text for decorative icons
- **Consistency**: Same icon for same meaning
- **Sizing**: Proportional to text size
- **Alignment**: Proper vertical alignment with text

## Implementation Guidelines

### CSS Architecture
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Properties**: CSS variables for theme values
- **Component Classes**: Reusable component styles
- **Responsive Utilities**: Mobile-first responsive design

### Component Structure
- **shadcn/ui**: Base component library
- **Custom Components**: Application-specific components
- **Composition**: Composable component patterns
- **Consistency**: Uniform component APIs

### Development Workflow
- **Design Tokens**: Centralized design values
- **Component Library**: Shared component documentation
- **Testing**: Visual regression testing
- **Documentation**: Living style guide maintenance