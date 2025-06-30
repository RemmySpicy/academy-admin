import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { 
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  BarChart2,
  Calendar,
  Shield
} from 'lucide-react';
import AcademySwitcher from '../components/academy/Switcher';
import RevenueChart from '../components/academy/Analytics/RevenueChart';
import EnrollmentMetrics from '../components/academy/Analytics/EnrollmentMetrics';
import FacilityUtilization from '../components/academy/Analytics/FacilityUtilization';
import InstructorPerformance from '../components/academy/Analytics/InstructorPerformance';
import SafetyCompliance from '../components/academy/Analytics/SafetyCompliance';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  h1 {
    font-size: 1.75rem;
    margin: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const DashboardPage = () => {
  // Simulate fetching dashboard data
  const { data: dashboardData, isLoading, error } = useQuery('dashboardData', async () => {
    // In a real app, this would be an API call
    return {
      metrics: {
        totalStudents: 450,
        activeEnrollments: 380,
        newEnrollments: 28,
        completionRate: 92
      },
      facilities: {
        totalHours: 168,
        bookedHours: 124,
        utilization: 73.8,
        mostUtilized: 'Main Pool',
        leastUtilized: 'Training Room B'
      }
    };
  });

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <Container>
      <Header>
        <h1>Dashboard</h1>
        <AcademySwitcher />
      </Header>
      
      <EnrollmentMetrics metrics={dashboardData.metrics} />
      
      <Grid>
        <RevenueChart />
        <FacilityUtilization data={dashboardData.facilities} />
      </Grid>
    </Container>
  );
};

export default DashboardPage; 