# Academy Tutor & Coordinator Mobile App

React Native/Expo mobile application for academy tutors and program coordinators.

## 📱 Features

### For Tutors
- **Student Management**: View and manage assigned students
- **Attendance Tracking**: Record and track student attendance
- **Progress Monitoring**: Monitor student progress and performance
- **Communication**: Send messages to students and parents
- **Schedule Management**: View and manage class schedules
- **Task Management**: Track lesson preparation and grading tasks

### For Program Coordinators
- **Program Overview**: Comprehensive view of program operations
- **Student Analytics**: Advanced analytics and reporting
- **Staff Coordination**: Manage tutor assignments and communications
- **Resource Management**: Oversee program resources and facilities
- **Performance Reports**: Generate and review performance reports
- **Administrative Tasks**: Handle program administration

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
├── navigation/         # Navigation configuration
├── hooks/             # Custom React hooks
├── services/          # API services (uses shared API client)
├── utils/             # Utility functions
└── types/             # TypeScript type definitions

existing-code/         # Place existing code here for rebuilding
```

## 🚀 Development

### Prerequisites
- Node.js 18+
- Expo CLI
- React Native development environment

### Setup
```bash
cd apps/academy-tutor-app
npm install
expo start
```

### Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔗 Shared Resources

This app uses shared resources from the main repository:

### Shared Types
```typescript
import { UserRole, StudentResponse, CourseResponse } from '../../../shared/types';
```

### Shared API Client
```typescript
import { apiClient } from '../../../shared/api-client';
```

### Usage Examples
```typescript
// Get assigned students
const students = await apiClient.students.list({ programId: selectedProgram });

// Record attendance
await apiClient.attendance.recordSession(sessionData);

// Send communication
await apiClient.communications.send(messageData);

// Get student progress
const progress = await apiClient.students.getProgress(studentId);
```

## 📦 Dependencies

### Core Dependencies
- **React Native**: Mobile framework
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library with drawer support
- **React Native Paper**: Material Design components
- **React Native Gesture Handler**: Gesture support
- **React Native Reanimated**: Animation library

### Shared Dependencies
- **API Client**: Unified API communication
- **TypeScript Types**: Shared type definitions
- **Utilities**: Common helper functions

## 🎨 Design System

Uses Academy design system with:
- Material Design components via React Native Paper
- Consistent color scheme and typography
- Responsive design for various screen sizes
- Professional interface for staff use
- Dark mode support (future enhancement)

## 📱 Platform Support

- **iOS**: iPhone and iPad (optimized for tablet use)
- **Android**: Phone and tablet (optimized for tablet use)
- **Web**: Progressive Web App (development/testing)

## 🔐 Authentication & Authorization

- JWT-based authentication using shared API client
- Role-based access control (tutor, program_coordinator, program_admin)
- Program context filtering for data access
- Secure token storage with auto-refresh

## 👥 User Roles & Permissions

### Tutor
- View assigned students only
- Record attendance for own classes
- Send messages to students/parents
- View student progress and assessments
- Manage personal tasks and schedule

### Program Coordinator
- View all students in assigned programs
- Access comprehensive analytics
- Manage communications across program
- Coordinate staff activities
- Generate reports

### Program Admin
- Full program management access
- Staff assignment and management
- Resource allocation
- Administrative functions

## 🧪 Testing

- Unit tests with Jest
- Component testing with React Native Testing Library
- Integration tests for API services
- E2E testing with Detox (future enhancement)

## 📊 Key Features

### Student Management
- Comprehensive student profiles
- Progress tracking with visual indicators
- Attendance management with easy check-in/out
- Performance analytics and insights

### Communication System
- Direct messaging to students/parents
- Group announcements
- Priority messaging system
- Delivery and read receipts

### Schedule Management
- Weekly/monthly schedule views
- Class roster management
- Room and resource booking
- Calendar integration

### Task Management
- Lesson preparation tracking
- Grading workflows
- Administrative task management
- Priority and deadline management

### Analytics Dashboard
- Student performance metrics
- Attendance patterns
- Progress trends
- Engagement insights

## 📚 Documentation

- [Main Repository Documentation](../../docs/)
- [Shared API Client](../../shared/api-client/README.md)
- [Git Subtree Workflow](../../git-subtree-workflow.md)

## 🚀 Deployment

This app will be deployed to separate repositories using Git Subtrees:
- **Repository**: `academy-tutor-mobile`
- **App Stores**: iOS App Store, Google Play Store
- **Enterprise Distribution**: Internal distribution for staff
- **CI/CD**: GitHub Actions for automated builds

## 🤝 Contributing

1. Make changes in the main repository
2. Test locally with `npm run dev:all`
3. Use Git Subtree to sync changes: `npm run subtree:sync`
4. Deploy to mobile repository: `npm run subtree:push:tutor`