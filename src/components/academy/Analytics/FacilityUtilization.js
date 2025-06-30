import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Building2, Clock, Calendar, AlertTriangle } from 'lucide-react';

const Container = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 24px;
  height: 400px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin-bottom: 24px;
  
  h2 {
    font-size: 1.25rem;
    margin: 0 0 8px 0;
  }
  
  p {
    color: var(--gray-600);
    font-size: 14px;
    margin: 0;
  }
`;

const FacilityStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => props.bgColor || 'var(--gray-100)'};
    color: ${props => props.iconColor || 'var(--gray-600)'};
  }
  
  .stat-content {
    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-800);
    }
    
    .stat-label {
      font-size: 14px;
      color: var(--gray-600);
    }
  }
`;

const UtilizationBar = styled.div`
  margin-bottom: 24px;
  
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .label {
      font-size: 14px;
      font-weight: 500;
      color: var(--gray-700);
    }
    
    .value {
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-800);
    }
  }
  
  .bar {
    height: 12px;
    background-color: var(--gray-200);
    border-radius: var(--border-radius-full);
    overflow: hidden;
    
    .progress {
      height: 100%;
      background-color: var(--primary-color);
      width: ${props => props.progress || '0%'};
    }
  }
`;

const ChartContainer = styled.div`
  flex: 1;
  min-height: 150px;
`;

// Sample data for the chart
const chartData = [
  { day: 'Mon', hours: 18 },
  { day: 'Tue', hours: 22 },
  { day: 'Wed', hours: 20 },
  { day: 'Thu', hours: 24 },
  { day: 'Fri', hours: 26 },
  { day: 'Sat', hours: 12 },
  { day: 'Sun', hours: 2 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '10px', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{`${label}`}</p>
        <p style={{ margin: '0', color: 'var(--primary-color)' }}>
          {`Hours: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

const FacilityUtilization = ({ data }) => {
  return (
    <Container>
      <Header>
        <h2>Facility Utilization</h2>
        <p>Weekly utilization metrics for all facilities</p>
      </Header>
      
      <FacilityStats>
        <StatItem bgColor="#e6f7ff" iconColor="#4299e1">
          <div className="icon-wrapper">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{data.bookedHours}/{data.totalHours} hrs</div>
            <div className="stat-label">Weekly Booked Hours</div>
          </div>
        </StatItem>
        
        <StatItem bgColor="#fef5ed" iconColor="#ed8936">
          <div className="icon-wrapper">
            <Building2 size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{data.mostUtilized}</div>
            <div className="stat-label">Most Utilized Facility</div>
          </div>
        </StatItem>
      </FacilityStats>
      
      <UtilizationBar progress={`${data.utilization}%`}>
        <div className="header">
          <div className="label">Overall Utilization</div>
          <div className="value">{data.utilization}%</div>
        </div>
        <div className="bar">
          <div className="progress"></div>
        </div>
      </UtilizationBar>
      
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="hours" 
              fill="var(--primary-color)" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Container>
  );
};

export default FacilityUtilization; 