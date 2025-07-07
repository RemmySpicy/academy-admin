# Academy Admin Frontend

The frontend application for the Academy Admin system, built with Next.js 14+ and modern React technologies.

## 🚀 Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Drag & Drop**: React DnD Kit
- **Date Handling**: Date-fns

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/UI components
│   │   └── ...             # Custom components
│   ├── lib/                # Utility functions
│   │   ├── utils.ts        # General utilities
│   │   └── ...             # Additional utilities
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── store/              # Zustand stores
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ required
- npm or yarn package manager

### Setup
```bash
# Install dependencies
npm install

# Or from project root
npm run install:frontend
```

### Development Server
```bash
# Start development server
npm run dev

# Or from project root
npm run frontend:dev
```

The application will be available at http://localhost:3000

### Building for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## ⚙️ Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📦 Key Dependencies

### Core
- **next**: React framework with App Router
- **react**: UI library
- **typescript**: Type safety

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **@radix-ui/react-***: Accessible UI primitives
- **lucide-react**: Icon library
- **framer-motion**: Animation library

### Forms & Validation
- **react-hook-form**: Form management
- **zod**: Schema validation
- **@hookform/resolvers**: Form resolvers

### State Management
- **zustand**: Lightweight state management
- **@tanstack/react-query**: Server state management

### Data Visualization
- **recharts**: Chart library
- **@dnd-kit/core**: Drag and drop

### Utilities
- **date-fns**: Date manipulation
- **clsx**: Conditional class names
- **tailwind-merge**: Merge Tailwind classes

## 🎨 Styling

The application uses Tailwind CSS for styling with a custom design system:

- **Colors**: Defined in `tailwind.config.js`
- **Components**: Shadcn/UI components in `src/components/ui/`
- **Global Styles**: Located in `src/app/globals.css`

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript type checking

# Testing
npm run test        # Run Jest tests
npm run test:watch  # Run tests in watch mode
```

## 🧪 Testing

The frontend uses the following testing stack:

- **Jest**: Test runner
- **React Testing Library**: Component testing
- **@testing-library/jest-dom**: Additional matchers

Test files should be placed next to the component they test with `.test.tsx` or `.spec.tsx` extension.

## 🚀 Deployment

The frontend can be deployed to:

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Static site hosting
- **Railway**: Full-stack deployment
- **Docker**: Container deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📚 Folder Conventions

- **components/**: Reusable React components
- **app/**: Next.js App Router pages and layouts
- **lib/**: Utility functions and configurations
- **hooks/**: Custom React hooks
- **types/**: TypeScript type definitions
- **store/**: Zustand store definitions

## 🔍 Code Quality

- **ESLint**: Configured for Next.js and TypeScript
- **TypeScript**: Strict mode enabled
- **Prettier**: Code formatting (configure as needed)

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Follow the existing naming conventions
4. Add appropriate tests for new features
5. Run linting and type checking before committing