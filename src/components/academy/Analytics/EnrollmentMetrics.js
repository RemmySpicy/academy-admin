import React from 'react';
import styled from 'styled-components';
import { ArrowUp, ArrowDown, Users, UserCheck, UserPlus, Award } from 'lucide-react';

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 24px;
  display: flex;
  flex-direction: column;
  
  .metric-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius);
      background-color: ${props => props.iconBg || 'var(--primary-light)'};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .metric-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--gray-600);
    }
  }
  
  .metric-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--gray-800);
    margin-bottom: 8px;
  }
  
  .metric-change {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    
    &.positive {
      color: var(--success-color);
    }
    
    &.negative {
      color: var(--danger-color);
    }
    
    &.neutral {
      color: var(--gray-500);
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${props => props.bgColor || 'rgba(0, 0, 0, 0.1)'};
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
  
  .progress {
    height: 100%;
    background-color: ${props => props.progressColor || '#6c5ce7'};
    width: ${props => props.progress || '0%'};
    transition: width 1s ease-in-out;
  }
`;

const EnrollmentMetrics = ({ metrics }) => {
  return (
    <MetricsContainer>
      <MetricCard iconBg="#6c5ce7">
        <div className="metric-header">
          <div className="icon-wrapper">
            <Users size={24} />
          </div>
          <div className="metric-title">Total Students</div>
        </div>
        <div className="metric-value">{metrics.totalStudents}</div>
        <div className="metric-change positive">
          <ArrowUp size={16} />
          <span>5.2% from last month</span>
        </div>
      </MetricCard>
      
      <MetricCard iconBg="#4299e1">
        <div className="metric-header">
          <div className="icon-wrapper">
            <UserCheck size={24} />
          </div>
          <div className="metric-title">Active Enrollments</div>
        </div>
        <div className="metric-value">{metrics.activeEnrollments}</div>
        <div className="metric-change positive">
          <ArrowUp size={16} />
          <span>3.8% from last month</span>
        </div>
      </MetricCard>
      
      <MetricCard iconBg="#38b2ac">
        <div className="metric-header">
          <div className="icon-wrapper">
            <UserPlus size={24} />
          </div>
          <div className="metric-title">New Enrollments</div>
        </div>
        <div className="metric-value">{metrics.newEnrollments}</div>
        <div className="metric-change positive">
          <ArrowUp size={16} />
          <span>12.5% from last month</span>
        </div>
      </MetricCard>
      
      <MetricCard iconBg="#ed8936">
        <div className="metric-header">
          <div className="icon-wrapper">
            <Award size={24} />
          </div>
          <div className="metric-title">Completion Rate</div>
        </div>
        <div className="metric-value">{metrics.completionRate}%</div>
        <div className="metric-change positive">
          <ArrowUp size={16} />
          <span>2.1% from last month</span>
        </div>
      </MetricCard>
    </MetricsContainer>
  );
};

export default EnrollmentMetrics; 