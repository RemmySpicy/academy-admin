import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Copy, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  Shield, 
  CheckCircle2, 
  Award,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
`;

const HeaderContent = styled.div`
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  .left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .right {
    display: flex;
    gap: 12px;
  }
  
  h1 {
    font-size: 1.75rem;
    margin: 0;
  }
  
  .back-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--gray-600);
    font-size: 14px;
    margin-bottom: 4px;
    
    &:hover {
      color: var(--primary-color);
    }
  }
  
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: var(--border-radius-full);
    font-size: 12px;
    font-weight: 500;
    
    &.active {
      background-color: var(--success-color);
      color: white;
    }
    
    &.draft {
      background-color: var(--gray-300);
      color: var(--gray-700);
    }
    
    &.upcoming {
      background-color: var(--warning-color);
      color: white;
    }
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.2s;
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    
    &:hover {
      background-color: var(--primary-dark);
    }
  }
  
  &.secondary {
    background-color: white;
    color: var(--gray-700);
    border: 1px solid var(--gray-300);
    
    &:hover {
      background-color: var(--gray-100);
    }
  }
  
  &.danger {
    background-color: white;
    color: var(--danger-color);
    border: 1px solid var(--danger-color);
    
    &:hover {
      background-color: var(--danger-color);
      color: white;
    }
  }
`;

const HeaderTabs = styled.div`
  display: flex;
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);
  padding: 0 24px;
`;

const Tab = styled.button`
  padding: 16px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-600)'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-800)'};
  }
`;

const ContentSection = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid var(--gray-200);
  
  h2 {
    font-size: 1.25rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: var(--primary-color);
    }
  }
`;

const SectionContent = styled.div`
  padding: 24px;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
`;

const MetadataItem = styled.div`
  .label {
    font-size: 12px;
    color: var(--gray-500);
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 16px;
    font-weight: 500;
    color: var(--gray-800);
  }
`;

const Description = styled.div`
  color: var(--gray-700);
  line-height: 1.6;
  
  p:last-child {
    margin-bottom: 0;
  }
`;

const RequirementsList = styled.ul`
  padding-left: 20px;
  margin: 0;
  
  li {
    margin-bottom: 8px;
    color: var(--gray-700);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ScheduleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 12px 16px;
    background-color: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
    color: var(--gray-600);
    font-weight: 500;
    font-size: 14px;
  }
  
  td {
    padding: 16px;
    border-bottom: 1px solid var(--gray-200);
    font-size: 14px;
    color: var(--gray-700);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const ObjectivesList = styled.ol`
  padding-left: 20px;
  margin: 0;
  
  li {
    margin-bottom: 12px;
    color: var(--gray-700);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const EnrollmentStats = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  flex: 1;
  background-color: var(--gray-50);
  border-radius: var(--border-radius);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  
  .icon {
    width: 48px;
    height: 48px;
    border-radius: var(--border-radius);
    background-color: ${props => props.iconBg || 'var(--primary-color)'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .content {
    display: flex;
    flex-direction: column;
    
    .value {
      font-size: 24px;
      font-weight: 600;
      color: var(--gray-800);
    }
    
    .label {
      font-size: 14px;
      color: var(--gray-600);
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--gray-200);
  border-radius: var(--border-radius-full);
  margin-top: 8px;
  overflow: hidden;
  
  .progress {
    height: 100%;
    background-color: ${props => props.color || 'var(--primary-color)'};
    width: ${props => props.progress || '0%'};
    transition: width 1s ease-in-out;
  }
`;

// Sample course data for demonstration
const courseData = {
  id: 1,
  title: 'Learn to Swim - Beginners',
  status: 'active',
  description: 'This introductory swimming course is designed for beginners aged 3-5 who have little to no experience in water. The course focuses on building water confidence, basic water safety skills, and introducing fundamental swimming techniques in a fun and supportive environment.',
  category: 'Learn to Swim',
  level: 'Beginner',
  ageGroup: 'Preschool (3-5)',
  startDate: '2023-09-01',
  endDate: '2023-11-30',
  duration: '12 weeks',
  sessions: 24,
  sessionLength: '45 minutes',
  price: '$150',
  schedule: [
    { day: 'Monday', time: '4:00 PM - 4:45 PM', location: 'Main Pool' },
    { day: 'Wednesday', time: '4:00 PM - 4:45 PM', location: 'Main Pool' },
  ],
  instructor: 'Sarah Johnson',
  minStudents: 5,
  maxStudents: 10,
  currentEnrollment: 8,
  waitlistCount: 3,
  ratio: '5:1',
  prerequisites: [
    'No previous swimming experience required',
    'Child must be comfortable being separated from parent during class',
    'Must be toilet trained or wear appropriate swim diapers'
  ],
  safetyRequirements: [
    'Parent/guardian must sign safety waiver',
    'Children must wear appropriate swim attire',
    'Swim caps required for children with long hair'
  ],
  learningObjectives: [
    'Develop water confidence and comfort in aquatic environments',
    'Learn basic water safety skills and awareness',
    'Master fundamental floating techniques on back and front',
    'Introduce basic arm and leg movements',
    'Achieve independent movement in water with support',
    'Learn safe entry and exit from pool'
  ],
  assessmentCriteria: 'Students will be assessed continuously throughout the course with a final skills evaluation in the last session. Progress reports will be provided at the midpoint and end of the course.',
  completionRequirements: 'Minimum 80% attendance and demonstration of basic water confidence and skills',
  certificateAwarded: true,
  color: '#4299e1'
};

const CourseDetails = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { courseId } = useParams();
  
  return (
    <Container>
      <Header>
        <HeaderContent>
          <div className="left">
            <Link to="/courses" className="back-link">
              <ArrowLeft size={16} />
              Back to Courses
            </Link>
            <h1>{courseData.title}</h1>
            <span className="badge active">Active</span>
          </div>
          <div className="right">
            <Button className="secondary">
              <Copy size={18} />
              Duplicate
            </Button>
            <Button className="primary">
              <Edit size={18} />
              Edit Course
            </Button>
            <Button className="danger">
              <Trash2 size={18} />
              Delete
            </Button>
          </div>
        </HeaderContent>
        
        <HeaderTabs>
          <Tab 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Tab>
          <Tab 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </Tab>
          <Tab 
            active={activeTab === 'curriculum'} 
            onClick={() => setActiveTab('curriculum')}
          >
            Curriculum
          </Tab>
          <Tab 
            active={activeTab === 'students'} 
            onClick={() => setActiveTab('students')}
          >
            Students
          </Tab>
        </HeaderTabs>
      </Header>
      
      {activeTab === 'overview' && (
        <>
          <ContentSection>
            <SectionHeader>
              <h2><BookOpen size={20} /> Course Information</h2>
            </SectionHeader>
            <SectionContent>
              <MetadataGrid>
                <MetadataItem>
                  <div className="label">Category</div>
                  <div className="value">{courseData.category}</div>
                </MetadataItem>
                <MetadataItem>
                  <div className="label">Level</div>
                  <div className="value">{courseData.level}</div>
                </MetadataItem>
                <MetadataItem>
                  <div className="label">Age Group</div>
                  <div className="value">{courseData.ageGroup}</div>
                </MetadataItem>
                <MetadataItem>
                  <div className="label">Duration</div>
                  <div className="value">{courseData.duration}</div>
                </MetadataItem>
                <MetadataItem>
                  <div className="label">Sessions</div>
                  <div className="value">{courseData.sessions}</div>
                </MetadataItem>
                <MetadataItem>
                  <div className="label">Session Length</div>
                  <div className="value">{courseData.sessionLength}</div>
                </MetadataItem>
                <MetadataItem>
                  <div className="label">Price</div>
                  <div className="value">{courseData.price}</div>
                </MetadataItem>
                <MetadataItem>
                  <div className="label">Instructor</div>
                  <div className="value">{courseData.instructor}</div>
                </MetadataItem>
              </MetadataGrid>
              
              <Description style={{ marginTop: '24px' }}>
                <h3>Description</h3>
                <p>{courseData.description}</p>
              </Description>
            </SectionContent>
          </ContentSection>
          
          <ContentSection>
            <SectionHeader>
              <h2><Users size={20} /> Enrollment</h2>
            </SectionHeader>
            <SectionContent>
              <EnrollmentStats>
                <StatCard iconBg="#4299e1">
                  <div className="icon">
                    <Users size={24} />
                  </div>
                  <div className="content">
                    <div className="value">{courseData.currentEnrollment}/{courseData.maxStudents}</div>
                    <div className="label">Current Enrollment</div>
                  </div>
                </StatCard>
                
                <StatCard iconBg="#48bb78">
                  <div className="icon">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="content">
                    <div className="value">{courseData.ratio}</div>
                    <div className="label">Student-Instructor Ratio</div>
                  </div>
                </StatCard>
                
                <StatCard iconBg="#ed8936">
                  <div className="icon">
                    <Clock size={24} />
                  </div>
                  <div className="content">
                    <div className="value">{courseData.waitlistCount}</div>
                    <div className="label">Waitlist Count</div>
                  </div>
                </StatCard>
              </EnrollmentStats>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--gray-700)' }}>
                    Enrollment Progress: {courseData.currentEnrollment}/{courseData.maxStudents} ({Math.round((courseData.currentEnrollment / courseData.maxStudents) * 100)}%)
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--gray-700)' }}>
                    Min: {courseData.minStudents} | Max: {courseData.maxStudents}
                  </div>
                </div>
                <ProgressBar progress={`${(courseData.currentEnrollment / courseData.maxStudents) * 100}%`} color="#4299e1">
                  <div className="progress"></div>
                </ProgressBar>
              </div>
            </SectionContent>
          </ContentSection>
          
          <ContentSection>
            <SectionHeader>
              <h2><Shield size={20} /> Requirements & Safety</h2>
            </SectionHeader>
            <SectionContent>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h3>Prerequisites</h3>
                  <RequirementsList>
                    {courseData.prerequisites.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </RequirementsList>
                </div>
                
                <div>
                  <h3>Safety Requirements</h3>
                  <RequirementsList>
                    {courseData.safetyRequirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </RequirementsList>
                </div>
              </div>
            </SectionContent>
          </ContentSection>
          
          <ContentSection>
            <SectionHeader>
              <h2><Award size={20} /> Learning Objectives</h2>
            </SectionHeader>
            <SectionContent>
              <ObjectivesList>
                {courseData.learningObjectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ObjectivesList>
              
              <div style={{ marginTop: '24px' }}>
                <h3>Assessment Criteria</h3>
                <p style={{ color: 'var(--gray-700)' }}>{courseData.assessmentCriteria}</p>
              </div>
              
              <div style={{ marginTop: '24px' }}>
                <h3>Completion Requirements</h3>
                <p style={{ color: 'var(--gray-700)' }}>{courseData.completionRequirements}</p>
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3>Certificate Awarded:</h3>
                {courseData.certificateAwarded ? (
                  <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={18} />
                    Yes
                  </span>
                ) : (
                  <span style={{ color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={18} />
                    No
                  </span>
                )}
              </div>
            </SectionContent>
          </ContentSection>
        </>
      )}
      
      {activeTab === 'schedule' && (
        <ContentSection>
          <SectionHeader>
            <h2><Calendar size={20} /> Course Schedule</h2>
          </SectionHeader>
          <SectionContent>
            <MetadataGrid style={{ marginBottom: '24px' }}>
              <MetadataItem>
                <div className="label">Start Date</div>
                <div className="value">{courseData.startDate}</div>
              </MetadataItem>
              <MetadataItem>
                <div className="label">End Date</div>
                <div className="value">{courseData.endDate}</div>
              </MetadataItem>
              <MetadataItem>
                <div className="label">Duration</div>
                <div className="value">{courseData.duration}</div>
              </MetadataItem>
              <MetadataItem>
                <div className="label">Total Sessions</div>
                <div className="value">{courseData.sessions}</div>
              </MetadataItem>
            </MetadataGrid>
            
            <h3>Weekly Schedule</h3>
            <ScheduleTable>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {courseData.schedule.map((item, index) => (
                  <tr key={index}>
                    <td>{item.day}</td>
                    <td>{item.time}</td>
                    <td>{item.location}</td>
                  </tr>
                ))}
              </tbody>
            </ScheduleTable>
          </SectionContent>
        </ContentSection>
      )}
      
      {activeTab === 'curriculum' && (
        <ContentSection>
          <SectionHeader>
            <h2><BookOpen size={20} /> Curriculum</h2>
          </SectionHeader>
          <SectionContent>
            <p>Curriculum content for this course will be displayed here.</p>
          </SectionContent>
        </ContentSection>
      )}
      
      {activeTab === 'students' && (
        <ContentSection>
          <SectionHeader>
            <h2><Users size={20} /> Students</h2>
          </SectionHeader>
          <SectionContent>
            <p>Student enrollment information will be displayed here.</p>
          </SectionContent>
        </ContentSection>
      )}
    </Container>
  );
};

export default CourseDetails; 