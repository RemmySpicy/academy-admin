# Multi-Academy Management System

A comprehensive management system for swimming academies, providing tools for course management, curriculum development, and academy administration.

## Features

- **Dashboard**: Overview of key metrics, revenue charts, and facility utilization
- **Course Management**: Create, edit, and manage courses with detailed information
- **Curriculum Builder**: Design and organize curriculum content with levels, modules, and lessons
- **Student Management**: Track student enrollments, progress, and achievements
- **Facility Management**: Monitor facility usage and scheduling
- **Employee Management**: Manage instructors and staff

## Tech Stack

- React
- React Router for navigation
- Styled Components for styling
- Recharts for data visualization
- Lucide React for icons
- React Query for data fetching

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/RemmySpicy/academy-admin.git
   cd academy-admin
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── academy/        # Academy-specific components
│   ├── courses/        # Course management components
│   ├── shared/         # Shared components (Layout, Navigation)
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── assets/             # Static assets
└── App.js              # Main application component
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## License

This project is licensed under the MIT License - see the LICENSE file for details. 