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
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Sample data
  const [curriculum, setCurriculum] = useState({
    id: id || 'new',
    title: id ? 'Learn to Swim: 6-17 Years' : '',
    courseId: id ? '2' : '',
    description: id ? 'Comprehensive swimming program for school-age children covering all major strokes and techniques.' : '',
    ageRange: id ? '6 - 17 years' : '',
    levels: [
      {
        id: 1,
        title: 'Level 1: Water Confidence',
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
      },
      {
        id: 2,
        title: 'Level 2: Basic Strokes',
        modules: []
      },
      {
        id: 3,
        title: 'Level 3: Advanced Techniques',
        modules: []
      }
    ]
  });
  
  const courses = [
    { id: 1, title: 'Learn to Swim' },
    { id: 2, title: 'Swimming Club' },
    { id: 3, title: 'Adult Swimming' },
    { id: 4, title: 'Survival Swimming' }
  ];

  // Sample lessons for selection
  const availableLessons = [
    { id: 1, title: 'Water Familiarization', difficulty: 'beginner' },
    { id: 2, title: 'Floating Practice', difficulty: 'beginner' },
    { id: 3, title: 'Kicking Technique', difficulty: 'intermediate' },
    { id: 4, title: 'Arm Stroke Development', difficulty: 'intermediate' },
    { id: 5, title: 'Breathing Technique', difficulty: 'intermediate' },
    { id: 6, title: 'Breaststroke Technique', difficulty: 'intermediate' },
    { id: 7, title: 'Butterfly Technique', difficulty: 'advanced' },
    { id: 8, title: 'Diving Fundamentals', difficulty: 'intermediate' },
    { id: 9, title: 'Water Safety Skills', difficulty: 'beginner' },
    { id: 10, title: 'Endurance Training', difficulty: 'advanced' }
  ];
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurriculum({
      ...curriculum,
      [name]: value
    });
  };
  
  // Add a new level
  const handleAddLevel = () => {
    const newLevel = {
      id: curriculum.levels.length + 1,
      title: `Level ${curriculum.levels.length + 1}`,
      modules: []
    };
    
    setCurriculum({
      ...curriculum,
      levels: [...curriculum.levels, newLevel]
    });
    
    setActiveLevel(newLevel.id);
  };
  
  // Add a new module to the active level
  const handleAddModule = () => {
    const updatedLevels = curriculum.levels.map(level => {
      if (level.id === activeLevel) {
        const newModuleId = level.modules.length > 0 
          ? Math.max(...level.modules.map(m => m.id)) + 1 
          : 1;
        
        return {
          ...level,
          modules: [
            ...level.modules, 
            {
              id: newModuleId,
              title: `Module ${newModuleId}: New Module`,
              sections: []
            }
          ]
        };
      }
      return level;
    });
    
    setCurriculum({
      ...curriculum,
      levels: updatedLevels
    });
  };
  
  // Add a new section to a module
  const handleAddSection = (moduleId) => {
    const updatedLevels = curriculum.levels.map(level => {
      if (level.id === activeLevel) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              const newSectionId = module.sections.length > 0 
                ? Math.max(...module.sections.map(s => s.id)) + 1 
                : 1;
              
              return {
                ...module,
                sections: [
                  ...module.sections,
                  {
                    id: newSectionId,
                    title: `Section ${newSectionId}`,
                    activities: {
                      warmup: '',
                      preset: '',
                      mainset: [],
                      postset: '',
                      cooldown: ''
                    }
                  }
                ]
              };
            }
            return module;
          })
        };
      }
      return level;
    });
    
    setCurriculum({
      ...curriculum,
      levels: updatedLevels
    });
  };
  
  // Update section title
  const handleSectionTitleChange = (moduleId, sectionId, newTitle) => {
    const updatedLevels = curriculum.levels.map(level => {
      if (level.id === activeLevel) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return {
                ...module,
                sections: module.sections.map(section => {
                  if (section.id === sectionId) {
                    return {
                      ...section,
                      title: newTitle
                    };
                  }
                  return section;
                })
              };
            }
            return module;
          })
        };
      }
      return level;
    });
    
    setCurriculum({
      ...curriculum,
      levels: updatedLevels
    });
  };
  
  // Update module title
  const handleModuleTitleChange = (moduleId, newTitle) => {
    const updatedLevels = curriculum.levels.map(level => {
      if (level.id === activeLevel) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return {
                ...module,
                title: newTitle
              };
            }
            return module;
          })
        };
      }
      return level;
    });
    
    setCurriculum({
      ...curriculum,
      levels: updatedLevels
    });
  };
  
  // Update activity content
  const handleActivityChange = (moduleId, sectionId, activityType, content) => {
    const updatedLevels = curriculum.levels.map(level => {
      if (level.id === activeLevel) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return {
                ...module,
                sections: module.sections.map(section => {
                  if (section.id === sectionId) {
                    return {
                      ...section,
                      activities: {
                        ...section.activities,
                        [activityType]: content
                      }
                    };
                  }
                  return section;
                })
              };
            }
            return module;
          })
        };
      }
      return level;
    });
    
    setCurriculum({
      ...curriculum,
      levels: updatedLevels
    });
  };
  
  // Add a lesson to the mainset
  const handleAddLesson = (moduleId, sectionId, lesson) => {
    const updatedLevels = curriculum.levels.map(level => {
      if (level.id === activeLevel) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return {
                ...module,
                sections: module.sections.map(section => {
                  if (section.id === sectionId) {
                    const newMainset = [...section.activities.mainset, lesson];
                    return {
                      ...section,
                      activities: {
                        ...section.activities,
                        mainset: newMainset
                      }
                    };
                  }
                  return section;
                })
              };
            }
            return module;
          })
        };
      }
      return level;
    });
    
    setCurriculum({
      ...curriculum,
      levels: updatedLevels
    });
    
    setShowLessonModal(false);
    setEditingLesson(null);
  };
  
  // Remove a lesson from the mainset
  const handleRemoveLesson = (moduleId, sectionId, lessonId) => {
    const updatedLevels = curriculum.levels.map(level => {
      if (level.id === activeLevel) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return {
                ...module,
                sections: module.sections.map(section => {
                  if (section.id === sectionId) {
                    const newMainset = section.activities.mainset.filter(
                      lesson => lesson.id !== lessonId
                    );
                    return {
                      ...section,
                      activities: {
                        ...section.activities,
                        mainset: newMainset
                      }
                    };
                  }
                  return section;
                })
              };
            }
            return module;
          })
        };
      }
      return level;
    });
    
    setCurriculum({
      ...curriculum,
      levels: updatedLevels
    });
  };
  
  // Remove a section
  const handleRemoveSection = (moduleId, sectionId) => {
    const updatedLevels = curriculum.levels.map(level => {
      if (level.id === activeLevel) {
        return {
          ...level,
          modules: level.modules.map(module => {
            if (module.id === moduleId) {
              return {
                ...module,
                sections: module.sections.filter(section => section.id !== sectionId)
              };
            }
            return module;
          })
        };
      }
      return level;
    });
    
    setCurriculum({
      ...curriculum,
      levels: updatedLevels
    });
  };
  
  // Remove a module
  const handleRemoveModule = (moduleId) => {
    const updatedLevels = curriculum.levels.map(level => {
      if (level.id === activeLevel) {
        return {
          ...level,
          modules: level.modules.filter(module => module.id !== moduleId)
        };
      }
      return level;
    });
    
    setCurriculum({
      ...curriculum,
      levels: updatedLevels
    });
  };
  
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
  
  // Open lesson modal for adding a new lesson
  const openAddLessonModal = (moduleId, sectionId) => {
    setEditingLesson({ moduleId, sectionId });
    setShowLessonModal(true);
  };
  
  // Get the active level data
  const getActiveLevelData = () => {
    return curriculum.levels.find(level => level.id === activeLevel) || curriculum.levels[0];
  };
  
  // Count total lessons in a module
  const countLessonsInModule = (module) => {
    return module.sections.reduce((total, section) => 
      total + (section.activities.mainset ? section.activities.mainset.length : 0), 0
    );
  };
  
  // Lesson Selection Modal
  const LessonSelectionModal = () => {
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredLessons = availableLessons.filter(lesson => 
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius)',
          width: '600px',
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto',
          padding: '24px'
        }}>
          <h2>Select a Lesson</h2>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--border-radius)'
              }}
            />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {filteredLessons.map(lesson => (
              <div
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                style={{
                  padding: '12px',
                  border: `1px solid ${selectedLesson?.id === lesson.id ? 'var(--primary-color)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  backgroundColor: selectedLesson?.id === lesson.id ? 'var(--primary-light)' : 'white'
                }}
              >
                <div style={{ fontWeight: 500 }}>{lesson.title}</div>
                <div style={{ 
                  fontSize: '12px',
                  color: 'var(--gray-600)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span className={`tag ${lesson.difficulty}`} style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '11px',
                    backgroundColor: 
                      lesson.difficulty === 'beginner' ? 'var(--success-light)' :
                      lesson.difficulty === 'intermediate' ? 'var(--warning-light)' : 'var(--danger-light)',
                    color:
                      lesson.difficulty === 'beginner' ? 'var(--success-color)' :
                      lesson.difficulty === 'intermediate' ? 'var(--warning-color)' : 'var(--danger-color)'
                  }}>
                    {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <Button 
              className="secondary"
              onClick={() => {
                setShowLessonModal(false);
                setEditingLesson(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="primary"
              onClick={() => {
                if (selectedLesson && editingLesson) {
                  handleAddLesson(
                    editingLesson.moduleId,
                    editingLesson.sectionId,
                    {
                      id: selectedLesson.id,
                      title: selectedLesson.title,
                      type: 'lesson'
                    }
                  );
                }
              }}
              disabled={!selectedLesson}
            >
              Add Lesson
            </Button>
          </div>
        </div>
      </div>
    );
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
          <Button className="secondary" onClick={handleGoBack}>
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
                name="title"
                value={curriculum.title} 
                onChange={handleInputChange}
                placeholder="Enter curriculum title"
              />
            </FormGroup>
            
            <FormGroup>
              <label>
                Course <span className="required">*</span>
              </label>
              <Select 
                name="courseId"
                value={curriculum.courseId}
                onChange={handleInputChange}
              >
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
                name="description"
                value={curriculum.description} 
                onChange={handleInputChange}
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
                name="ageRange" 
                value={curriculum.ageRange}
                onChange={handleInputChange} 
                placeholder="e.g. 6 - 17 years"
              />
            </FormGroup>
          </FormRow>
        </FormContainer>
      ) : (
        <FormContainer>
          <LevelPills>
            {curriculum.levels.map(level => (
              <LevelPill 
                key={level.id} 
                active={activeLevel === level.id}
                onClick={() => setActiveLevel(level.id)}
              >
                Level {level.id}
              </LevelPill>
            ))}
            <AddLevelButton onClick={handleAddLevel}>
              <Plus size={16} />
            </AddLevelButton>
          </LevelPills>
          
          {getActiveLevelData().modules.map((module) => (
            <ModuleContainer key={module.id}>
              <ModuleHeader>
                <div className="module-title">
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => handleModuleTitleChange(module.id, e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '16px',
                      fontWeight: '600',
                      width: '100%',
                      padding: '0',
                      outline: 'none'
                    }}
                  />
                </div>
                <div className="module-stats">
                  <div className="stat">
                    <span>{module.sections.length} Sections</span>
                  </div>
                  <div className="stat">
                    <span>
                      {countLessonsInModule(module)} Lessons
                    </span>
                  </div>
                </div>
                <div className="module-actions">
                  <ActionButton onClick={() => handleRemoveModule(module.id)} className="danger">
                    <Trash2 size={16} />
                  </ActionButton>
                </div>
              </ModuleHeader>
              <ModuleContent>
                {module.sections.map((section) => (
                  <SectionContainer key={section.id}>
                    <SectionHeader>
                      <div className="section-title">
                        <input 
                          type="text" 
                          value={section.title} 
                          onChange={(e) => handleSectionTitleChange(module.id, section.id, e.target.value)}
                          placeholder="Section Title"
                        />
                      </div>
                      <div className="section-actions">
                        <ActionButton 
                          className="danger"
                          onClick={() => handleRemoveSection(module.id, section.id)}
                        >
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
                              onChange={(e) => handleActivityChange(module.id, section.id, 'warmup', e.target.value)}
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
                              onChange={(e) => handleActivityChange(module.id, section.id, 'preset', e.target.value)}
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
                              {section.activities.mainset && section.activities.mainset.map((lesson, lessonIndex) => (
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
                                    <ActionButton onClick={() => handleRemoveLesson(module.id, section.id, lesson.id)}>
                                      <Trash2 size={16} />
                                    </ActionButton>
                                  </div>
                                </LessonItem>
                              ))}
                              <AddLessonButton onClick={() => openAddLessonModal(module.id, section.id)}>
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
                              onChange={(e) => handleActivityChange(module.id, section.id, 'postset', e.target.value)}
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
                              onChange={(e) => handleActivityChange(module.id, section.id, 'cooldown', e.target.value)}
                              placeholder="Enter cool down activities"
                            />
                          </ActivityContent>
                        )}
                      </ActivityContainer>
                    </SectionContent>
                  </SectionContainer>
                ))}
                
                <Button 
                  className="secondary" 
                  style={{ width: '100%' }}
                  onClick={() => handleAddSection(module.id)}
                >
                  <Plus size={16} />
                  Add Section
                </Button>
              </ModuleContent>
            </ModuleContainer>
          ))}
          
          <Button 
            className="secondary" 
            style={{ width: '100%' }}
            onClick={handleAddModule}
          >
            <Plus size={16} />
            Add Module
          </Button>
        </FormContainer>
      )}
      
      {/* Lesson Selection Modal */}
      {showLessonModal && <LessonSelectionModal />}
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