# Academy Students & Parents Mobile App

React Native/Expo mobile application for academy students and their parents/guardians.

## 📱 Features

### For Students
- **Dashboard**: Overview of progress, upcoming assignments, and announcements
- **Progress Tracking**: View course progress, completed lessons, and achievements
- **Attendance**: Check attendance records and statistics
- **Assignments**: View and track assignment due dates and submissions
- **Communications**: Receive messages from tutors and academy staff
- **Profile Management**: Update personal information and preferences

### For Parents/Guardians
- **Child Monitoring**: View children's progress and performance
- **Communication**: Message tutors and receive academy updates
- **Attendance Tracking**: Monitor child's attendance patterns
- **Assignment Overview**: Stay informed about upcoming assignments
- **Emergency Information**: Access and update emergency contact details

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
cd apps/academy-students-app
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
import { UserRole, StudentResponse, ApiResponse } from '../../../shared/types';
```

### Shared API Client
```typescript
import { apiClient } from '../../../shared/api-client';
```

### Usage Example
```typescript
// Get student profile
const studentProfile = await apiClient.students.getMyProfile();

// Get progress data
const progress = await apiClient.students.getMyProgress();

// Get attendance records
const attendance = await apiClient.students.getMyAttendance();
```

## 📦 Dependencies

### Core Dependencies
- **React Native**: Mobile framework
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
- **React Native Paper**: Material Design components

### Shared Dependencies
- **API Client**: Unified API communication
- **TypeScript Types**: Shared type definitions
- **Utilities**: Common helper functions

## 🎨 Design System

Uses Academy design system with:
- Material Design components via React Native Paper
- Consistent color scheme and typography
- Responsive design for various screen sizes
- Dark mode support (future enhancement)

## 📱 Platform Support

- **iOS**: iPhone and iPad
- **Android**: Phone and tablet
- **Web**: Progressive Web App (development/testing)

## 🔐 Authentication

- JWT-based authentication using shared API client
- Role-based access (student, parent)
- Secure token storage
- Auto-refresh token handling

## 🧪 Testing

- Unit tests with Jest
- Component testing with React Native Testing Library
- Integration tests for API services
- E2E testing with Detox (future enhancement)

## 📚 Documentation

- [Main Repository Documentation](../../docs/)
- [Shared API Client](../../shared/api-client/README.md)
- [Git Subtree Workflow](../../git-subtree-workflow.md)

## 🚀 Deployment

This app will be deployed to separate repositories using Git Subtrees:
- **Repository**: `academy-students-mobile`
- **App Stores**: iOS App Store, Google Play Store
- **CI/CD**: GitHub Actions for automated builds

## 🤝 Contributing

1. Make changes in the main repository
2. Test locally with `npm run dev:all`
3. Use Git Subtree to sync changes: `npm run subtree:sync`
4. Deploy to mobile repository: `npm run subtree:push:student`