import React, { useState } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Layers,
  GraduationCap
} from 'lucide-react';
import CurriculaList from '../CurriculaList';

const Container = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    font-size: 1.5rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--gray-600);
    font-size: 14px;
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .actions {
    display: flex;
    gap: 12px;
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
  cursor: pointer;
  
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
`;

const TabsContainer = styled.div`
  padding: 0 24px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  gap: 24px;
`;

const Tab = styled.div`
  padding: 16px 0;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-600)'};
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-800)'};
  }
`;

const FormContainer = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--gray-700);
  }
  
  .helper-text {
    margin-top: 4px;
    font-size: 13px;
    color: var(--gray-500);
  }
  
  .required {
    color: var(--danger-color);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 1}, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const LevelPills = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const LevelPill = styled.div`
  padding: 8px 16px;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-100)'};
  color: ${props => props.active ? 'white' : 'var(--gray-700)'};
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-200)'};
  }
`;

const AddLevelButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--gray-100);
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--gray-200);
  }
`;

const ModuleContainer = styled.div`
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  margin-bottom: 24px;
  overflow: hidden;
`;

const ModuleHeader = styled.div`
  padding: 16px;
  background-color: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .module-title {
    display: flex;
    align-items: center;
    gap: 8px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .module-stats {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--gray-600);
    
    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  
  .module-actions {
    display: flex;
    gap: 8px;
  }
`;

const ModuleContent = styled.div`
  padding: 16px;
`;

const SectionContainer = styled.div`
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  margin-bottom: 16px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 12px 16px;
  background-color: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    
    input {
      padding: 6px 10px;
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      font-size: 14px;
      font-weight: 500;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
      }
    }
  }
  
  .section-actions {
    display: flex;
    gap: 8px;
  }
`;

const SectionContent = styled.div`
  padding: 16px;
`;

const ActivityContainer = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActivityHeader = styled.div`
  padding: 12px 16px;
  background-color: ${props => props.expanded ? 'var(--primary-light)' : 'var(--gray-50)'};
  border: 1px solid ${props => props.expanded ? 'var(--primary-color)' : 'var(--gray-200)'};
  border-radius: ${props => props.expanded ? 'var(--border-radius) var(--border-radius) 0 0' : 'var(--border-radius)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  .activity-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: ${props => props.expanded ? 'var(--primary-color)' : 'var(--gray-700)'};
  }
`;

const ActivityContent = styled.div`
  padding: 16px;
  border: 1px solid var(--primary-color);
  border-top: none;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
`;

const LessonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LessonItem = styled.div`
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .lesson-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .lesson-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius);
      background-color: var(--primary-light);
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .lesson-title {
      font-weight: 500;
    }
  }
  
  .lesson-actions {
    display: flex;
    gap: 8px;
  }
`;

const AddLessonButton = styled.div`
  border: 2px dashed var(--gray-300);
  border-radius: var(--border-radius);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background-color: var(--gray-50);
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--gray-800);
  }
  
  &.danger:hover {
    background-color: var(--danger-light);
    color: var(--danger-color);
  }
`;

const CurriculumBuilderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [activeLevel, setActiveLevel] = useState(1);
  const [expandedActivities, setExpandedActivities] = useState(['warmup']);
  
  // Sample data
  const curriculum = {
    id: id || 'new',
    title: id ? 'Learn to Swim: 6-17 Years' : '',
    courseId: id ? '2' : '',
    description: id ? 'Comprehensive swimming program for school-age children covering all major strokes and techniques.' : '',
    ageRange: id ? '6 - 17 years' : '',
    levels: 4,
    modules: [
      {
        id: 1,
        title: 'Module 1: Water Confidence',
        sections: [
          {
            id: 1,
            title: 'Introduction to Water',
            activities: {
              warmup: 'Simple water entry and exit practice',
              preset: 'Breathing exercises at the pool edge',
              mainset: [
                {
                  id: 1,
                  title: 'Water Familiarization',
                  type: 'lesson'
                },
                {
                  id: 2,
                  title: 'Floating Practice',
                  type: 'lesson'
                }
              ],
              postset: 'Group water confidence games',
              cooldown: 'Gentle water walking and relaxation'
            }
          }
        ]
      }
    ]
  };
  
  const courses = [
    { id: 1, title: 'Learn to Swim' },
    { id: 2, title: 'Swimming Club' },
    { id: 3, title: 'Adult Swimming' },
    { id: 4, title: 'Survival Swimming' }
  ];
  
  const toggleActivity = (activityId) => {
    if (expandedActivities.includes(activityId)) {
      setExpandedActivities(expandedActivities.filter(id => id !== activityId));
    } else {
      setExpandedActivities([...expandedActivities, activityId]);
    }
  };
  
  const handleGoBack = () => {
    navigate('/courses/curriculum');
  };
  
  return (
    <Container>
      <Header>
        <div>
          <div className="breadcrumb">
            <button onClick={handleGoBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={16} />
            </button>
            <a onClick={handleGoBack} style={{ cursor: 'pointer' }}>Curricula</a>
            <span>/</span>
            <span>{id ? 'Edit' : 'Create'} Curriculum</span>
          </div>
          <h1>
            <BookOpen size={24} />
            {id ? curriculum.title : 'Create New Curriculum'}
          </h1>
        </div>
        <div className="actions">
          <Button className="secondary">
            Cancel
          </Button>
          <Button className="primary">
            <Save size={18} />
            Save Curriculum
          </Button>
        </div>
      </Header>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'details'} 
          onClick={() => setActiveTab('details')}
        >
          Details
        </Tab>
        <Tab 
          active={activeTab === 'lessons'} 
          onClick={() => setActiveTab('lessons')}
        >
          Lesson Plan
        </Tab>
      </TabsContainer>
      
      {activeTab === 'details' ? (
        <FormContainer>
          <FormRow columns={2}>
            <FormGroup>
              <label>
                Curriculum Title <span className="required">*</span>
              </label>
              <Input 
                type="text" 
                value={curriculum.title} 
                placeholder="Enter curriculum title"
              />
            </FormGroup>
            
            <FormGroup>
              <label>
                Course <span className="required">*</span>
              </label>
              <Select value={curriculum.courseId}>
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <label>
                Description
              </label>
              <Textarea 
                value={curriculum.description} 
                placeholder="Enter curriculum description"
              />
            </FormGroup>
          </FormRow>
          
          <FormRow columns={2}>
            <FormGroup>
              <label>
                Curriculum ID
              </label>
              <Input 
                type="text" 
                value={curriculum.id !== 'new' ? curriculum.id : ''} 
                placeholder="Auto-generated if left empty"
                disabled={curriculum.id !== 'new'}
              />
              <p className="helper-text">Unique identifier for this curriculum</p>
            </FormGroup>
            
            <FormGroup>
              <label>
                Age Range <span className="required">*</span>
              </label>
              <Input 
                type="text" 
                value={curriculum.ageRange} 
                placeholder="e.g. 6 - 17 years"
              />
            </FormGroup>
          </FormRow>
        </FormContainer>
      ) : (
        <FormContainer>
          <LevelPills>
            {[1, 2, 3, 4].map(level => (
              <LevelPill 
                key={level} 
                active={activeLevel === level}
                onClick={() => setActiveLevel(level)}
              >
                Level {level}
              </LevelPill>
            ))}
            <AddLevelButton>
              <Plus size={16} />
            </AddLevelButton>
          </LevelPills>
          
          {curriculum.modules.map((module, moduleIndex) => (
            <ModuleContainer key={moduleIndex}>
              <ModuleHeader>
                <div className="module-title">
                  <h3>{module.title}</h3>
                </div>
                <div className="module-stats">
                  <div className="stat">
                    <span>{module.sections.length} Sections</span>
                  </div>
                  <div className="stat">
                    <span>
                      {module.sections.reduce((total, section) => 
                        total + (section.activities.mainset ? section.activities.mainset.length : 0), 0)
                      } Lessons
                    </span>
                  </div>
                </div>
                <div className="module-actions">
                  <ActionButton>
                    <Trash2 size={16} />
                  </ActionButton>
                </div>
              </ModuleHeader>
              <ModuleContent>
                {module.sections.map((section, sectionIndex) => (
                  <SectionContainer key={sectionIndex}>
                    <SectionHeader>
                      <div className="section-title">
                        <input 
                          type="text" 
                          value={section.title} 
                          placeholder="Section Title"
                        />
                      </div>
                      <div className="section-actions">
                        <ActionButton className="danger">
                          <Trash2 size={16} />
                        </ActionButton>
                      </div>
                    </SectionHeader>
                    <SectionContent>
                      <ActivityContainer>
                        <ActivityHeader 
                          expanded={expandedActivities.includes('warmup')}
                          onClick={() => toggleActivity('warmup')}
                        >
                          <div className="activity-title">
                            {expandedActivities.includes('warmup') ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            Warm Up
                          </div>
                        </ActivityHeader>
                        {expandedActivities.includes('warmup') && (
                          <ActivityContent>
                            <Textarea 
                              value={section.activities.warmup} 
                              placeholder="Enter warm up activities"
                            />
                          </ActivityContent>
                        )}
                      </ActivityContainer>
                      
                      <ActivityContainer>
                        <ActivityHeader 
                          expanded={expandedActivities.includes('preset')}
                          onClick={() => toggleActivity('preset')}
                        >
                          <div className="activity-title">
                            {expandedActivities.includes('preset') ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            Pre Set
                          </div>
                        </ActivityHeader>
                        {expandedActivities.includes('preset') && (
                          <ActivityContent>
                            <Textarea 
                              value={section.activities.preset} 
                              placeholder="Enter pre set activities"
                            />
                          </ActivityContent>
                        )}
                      </ActivityContainer>
                      
                      <ActivityContainer>
                        <ActivityHeader 
                          expanded={expandedActivities.includes('mainset')}
                          onClick={() => toggleActivity('mainset')}
                        >
                          <div className="activity-title">
                            {expandedActivities.includes('mainset') ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            Main Set
                          </div>
                        </ActivityHeader>
                        {expandedActivities.includes('mainset') && (
                          <ActivityContent>
                            <LessonList>
                              {section.activities.mainset.map((lesson, lessonIndex) => (
                                <LessonItem key={lessonIndex}>
                                  <div className="lesson-info">
                                    <div className="lesson-icon">
                                      <GraduationCap size={20} />
                                    </div>
                                    <div className="lesson-title">
                                      {lesson.title}
                                    </div>
                                  </div>
                                  <div className="lesson-actions">
                                    <ActionButton>
                                      <Trash2 size={16} />
                                    </ActionButton>
                                  </div>
                                </LessonItem>
                              ))}
                              <AddLessonButton>
                                <Plus size={16} />
                                <span>Add Lesson</span>
                              </AddLessonButton>
                            </LessonList>
                          </ActivityContent>
                        )}
                      </ActivityContainer>
                      
                      <ActivityContainer>
                        <ActivityHeader 
                          expanded={expandedActivities.includes('postset')}
                          onClick={() => toggleActivity('postset')}
                        >
                          <div className="activity-title">
                            {expandedActivities.includes('postset') ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            Post Set
                          </div>
                        </ActivityHeader>
                        {expandedActivities.includes('postset') && (
                          <ActivityContent>
                            <Textarea 
                              value={section.activities.postset} 
                              placeholder="Enter post set activities"
                            />
                          </ActivityContent>
                        )}
                      </ActivityContainer>
                      
                      <ActivityContainer>
                        <ActivityHeader 
                          expanded={expandedActivities.includes('cooldown')}
                          onClick={() => toggleActivity('cooldown')}
                        >
                          <div className="activity-title">
                            {expandedActivities.includes('cooldown') ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            Cool Down
                          </div>
                        </ActivityHeader>
                        {expandedActivities.includes('cooldown') && (
                          <ActivityContent>
                            <Textarea 
                              value={section.activities.cooldown} 
                              placeholder="Enter cool down activities"
                            />
                          </ActivityContent>
                        )}
                      </ActivityContainer>
                    </SectionContent>
                  </SectionContainer>
                ))}
                
                <Button className="secondary" style={{ width: '100%' }}>
                  <Plus size={16} />
                  Add Section
                </Button>
              </ModuleContent>
            </ModuleContainer>
          ))}
          
          <Button className="secondary" style={{ width: '100%' }}>
            <Plus size={16} />
            Add Module
          </Button>
        </FormContainer>
      )}
    </Container>
  );
};

export { CurriculumBuilderForm };

const CurriculumBuilder = () => {
  return (
    <Routes>
      <Route path="/" element={<CurriculaList />} />
      <Route path="/create" element={<CurriculumBuilderForm />} />
      <Route path="/edit/:id" element={<CurriculumBuilderForm />} />
    </Routes>
  );
};

export default CurriculumBuilder; 