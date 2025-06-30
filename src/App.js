import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components';
import Layout from './components/shared/Layout';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import CoursesPage from './pages/CoursesPage';
import EmployeesPage from './pages/EmployeesPage';
import FacilitiesPage from './pages/FacilitiesPage';
import SchedulingPage from './pages/SchedulingPage';
import PaymentsPage from './pages/PaymentsPage';
import SafetyPage from './pages/SafetyPage';
import CommunicationsPage from './pages/CommunicationsPage';

const queryClient = new QueryClient();

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f7fafc;
`;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContainer>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/students/*" element={<StudentsPage />} />
              <Route path="/courses/*" element={<CoursesPage />} />
              <Route path="/employees/*" element={<EmployeesPage />} />
              <Route path="/facilities/*" element={<FacilitiesPage />} />
              <Route path="/scheduling/*" element={<SchedulingPage />} />
              <Route path="/payments/*" element={<PaymentsPage />} />
              <Route path="/safety/*" element={<SafetyPage />} />
              <Route path="/communications/*" element={<CommunicationsPage />} />
            </Routes>
          </Layout>
        </Router>
      </AppContainer>
    </QueryClientProvider>
  );
}

export default App; 