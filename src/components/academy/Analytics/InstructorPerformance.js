import React from 'react';
import styled from 'styled-components';
import { Star, Users, TrendingUp } from 'lucide-react';

const PerformanceContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InstructorTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #718096;
    border-bottom: 1px solid #e2e8f0;
  }
  
  td {
    padding: 16px;
    border-bottom: 1px solid #f7fafc;
    
    &:last-child {
      text-align: right;
    }
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const InstructorInfo = styled.div`
  display: flex;
  align-items: center;
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #6c5ce7;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 12px;
  }
  
  .details {
    .name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .position {
      font-size: 12px;
      color: #718096;
    }
  }
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  
  .rating-value {
    font-weight: 600;
    margin-right: 4px;
  }
  
  .star-icon {
    color: #f6ad55;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
  
  .progress {
    height: 100%;
    width: ${props => props.value || 0}%;
    background-color: ${props => props.color || '#6c5ce7'};
    border-radius: 3px;
  }
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  
  .label {
    font-size: 12px;
    color: #718096;
    margin-bottom: 4px;
  }
  
  .value {
    display: flex;
    align-items: center;
    font-weight: 600;
    
    svg {
      margin-right: 4px;
      color: ${props => props.iconColor || '#6c5ce7'};
    }
  }
`;

const InstructorPerformance = ({ data }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };
  
  const getProgressColor = (rate) => {
    if (rate >= 90) return '#38b2ac';
    if (rate >= 80) return '#6c5ce7';
    if (rate >= 70) return '#4299e1';
    return '#ed8936';
  };
  
  return (
    <PerformanceContainer>
      <InstructorTable>
        <thead>
          <tr>
            <th>Instructor</th>
            <th>Rating</th>
            <th>Students</th>
            <th>Completion Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((instructor) => (
            <tr key={instructor.id}>
              <td>
                <InstructorInfo>
                  <div className="avatar">{getInitials(instructor.name)}</div>
                  <div className="details">
                    <div className="name">{instructor.name}</div>
                    <div className="position">Swimming Instructor</div>
                  </div>
                </InstructorInfo>
              </td>
              <td>
                <Rating>
                  <span className="rating-value">{instructor.rating}</span>
                  <Star size={16} className="star-icon" />
                </Rating>
              </td>
              <td>
                <MetricItem iconColor="#4299e1">
                  <div className="label">Active Students</div>
                  <div className="value">
                    <Users size={14} />
                    {instructor.studentsCount}
                  </div>
                </MetricItem>
              </td>
              <td>
                <MetricItem iconColor={getProgressColor(instructor.completionRate)}>
                  <div className="label">Course Completion</div>
                  <div className="value">
                    <TrendingUp size={14} />
                    {instructor.completionRate}%
                  </div>
                  <ProgressBar 
                    value={instructor.completionRate} 
                    color={getProgressColor(instructor.completionRate)}
                  >
                    <div className="progress" />
                  </ProgressBar>
                </MetricItem>
              </td>
            </tr>
          ))}
        </tbody>
      </InstructorTable>
    </PerformanceContainer>
  );
};

export default InstructorPerformance; 