import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ComplianceContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ComplianceRate = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px 0;
  margin-bottom: 16px;
  
  .rate-circle {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: conic-gradient(
      #38b2ac 0% ${props => props.rate || 0}%, 
      #e2e8f0 ${props => props.rate || 0}% 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    
    &::before {
      content: '';
      position: absolute;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: white;
    }
    
    .rate-value {
      position: relative;
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
    }
  }
  
  .rate-label {
    font-size: 14px;
    color: #718096;
  }
`;

const StatList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: ${props => props.bg || '#f7fafc'};
  
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${props => props.iconBg || '#e2e8f0'};
    color: ${props => props.iconColor || '#4a5568'};
    margin-right: 12px;
  }
  
  .details {
    flex: 1;
    
    .label {
      font-size: 12px;
      color: #718096;
      margin-bottom: 2px;
    }
    
    .value {
      font-weight: 600;
      color: #2d3748;
    }
  }
`;

const LastInspection = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 16px;
  background-color: #6c5ce705;
  border-radius: 8px;
  border: 1px dashed #6c5ce7;
  
  .icon {
    color: #6c5ce7;
    margin-right: 12px;
  }
  
  .details {
    .label {
      font-size: 12px;
      color: #718096;
      margin-bottom: 2px;
    }
    
    .value {
      font-weight: 500;
      color: #2d3748;
    }
  }
`;

const SafetyCompliance = ({ data }) => {
  return (
    <ComplianceContainer>
      <ComplianceRate rate={data.complianceRate}>
        <div className="rate-circle">
          <span className="rate-value">{data.complianceRate}%</span>
        </div>
        <div className="rate-label">Overall Safety Compliance</div>
      </ComplianceRate>
      
      <StatList>
        <StatItem 
          bg="#e53e3e10" 
          iconBg="#e53e3e20" 
          iconColor="#e53e3e"
        >
          <div className="icon">
            <AlertTriangle size={16} />
          </div>
          <div className="details">
            <div className="label">Safety Incidents</div>
            <div className="value">{data.incidentCount} incidents this month</div>
          </div>
        </StatItem>
        
        <StatItem 
          bg="#38b2ac10" 
          iconBg="#38b2ac20" 
          iconColor="#38b2ac"
        >
          <div className="icon">
            <CheckCircle size={16} />
          </div>
          <div className="details">
            <div className="label">Compliance Checks Passed</div>
            <div className="value">42 out of 43 checks</div>
          </div>
        </StatItem>
        
        <StatItem 
          bg="#ed893610" 
          iconBg="#ed893620" 
          iconColor="#ed8936"
        >
          <div className="icon">
            <AlertCircle size={16} />
          </div>
          <div className="details">
            <div className="label">Open Safety Issues</div>
            <div className="value">{data.openIssues} issues pending</div>
          </div>
        </StatItem>
      </StatList>
      
      <LastInspection>
        <div className="icon">
          <Clock size={18} />
        </div>
        <div className="details">
          <div className="label">Last Safety Inspection</div>
          <div className="value">
            {new Date(data.lastInspection).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </LastInspection>
    </ComplianceContainer>
  );
};

export default SafetyCompliance; 