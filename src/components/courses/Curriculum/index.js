import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Plus, 
  Save, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  Edit, 
  Copy,
  BookOpen,
  Layers,
  FileText,
  Video,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';

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

const Content = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 600px;
`;

const Sidebar = styled.div`
  border-right: 1px solid var(--gray-200);
  overflow-y: auto;
  padding: 16px;
`;

const MainContent = styled.div`
  padding: 24px;
  overflow-y: auto;
`;

const TreeContainer = styled.div`
  font-size: 14px;
`;

const TreeItem = styled.div`
  margin-bottom: 4px;
  
  .item-header {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: var(--border-radius);
    cursor: pointer;
    user-select: none;
    color: var(--gray-700);
    background-color: ${props => props.active ? 'var(--gray-100)' : 'transparent'};
    border-left: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
    
    &:hover {
      background-color: var(--gray-100);
    }
    
    .expand-icon {
      margin-right: 8px;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-500);
    }
    
    .type-icon {
      margin-right: 8px;
      color: ${props => {
        switch (props.itemType) {
          case 'level': return 'var(--primary-color)';
          case 'module': return 'var(--secondary-color)';
          case 'section': return 'var(--warning-color)';
          case 'lesson': return 'var(--success-color)';
          default: return 'var(--gray-500)';
        }
      }};
    }
    
    .item-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .actions {
      display: none;
      
      button {
        background: none;
        border: none;
        color: var(--gray-500);
        cursor: pointer;
        padding: 4px;
        border-radius: var(--border-radius);
        
        &:hover {
          background-color: var(--gray-200);
          color: var(--gray-700);
        }
      }
    }
    
    &:hover .actions {
      display: flex;
    }
  }
  
  .children {
    padding-left: 24px;
  }
`;

const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  margin-top: 8px;
  background-color: var(--gray-50);
  border: 1px dashed var(--gray-300);
  border-radius: var(--border-radius);
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--gray-800);
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: var(--primary-color);
    }
  }
  
  .section-description {
    font-size: 14px;
    color: var(--gray-600);
    margin-bottom: 20px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--gray-700);
    display: flex;
    align-items: center;
    gap: 4px;
    
    .required {
      color: var(--danger-color);
    }
  }
  
  .helper-text {
    font-size: 12px;
    color: var(--gray-500);
    margin-top: 4px;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  transition: all 0.2s;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  transition: all 0.2s;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  
  svg {
    color: var(--gray-300);
    margin-bottom: 16px;
  }
  
  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: var(--gray-700);
  }
  
  p {
    color: var(--gray-500);
    margin-bottom: 24px;
    max-width: 400px;
  }
`;

// Sample curriculum data for demonstration
const initialCurriculum = {
  id: 1,
  name: 'Learn to Swim Curriculum',
  description: 'A comprehensive swimming curriculum for beginners to advanced swimmers',
  levels: [
    {
      id: 1,
      name: 'Level 1: Water Confidence',
      description: 'Introduction to water and basic water confidence skills',
      modules: [
        {
          id: 1,
          name: 'Water Familiarization',
          description: 'Getting comfortable in water environments',
          sections: [
            {
              id: 1,
              name: 'Entry and Exit',
              description: 'Safe ways to enter and exit the pool',
              lessons: [
                {
                  id: 1,
                  name: 'Sitting Entry',
                  type: 'practical',
                  duration: 15,
                  content: 'Practice sitting on the edge and sliding into the water safely'
                },
                {
                  id: 2,
                  name: 'Step Entry',
                  type: 'practical',
                  duration: 15,
                  content: 'Using steps to enter the pool safely'
                }
              ]
            },
            {
              id: 2,
              name: 'Water Play',
              description: 'Fun activities to build comfort in water',
              lessons: [
                {
                  id: 3,
                  name: 'Splashing Games',
                  type: 'practical',
                  duration: 20,
                  content: 'Games that involve controlled splashing to build comfort with water on face'
                }
              ]
            }
          ]
        },
        {
          id: 2,
          name: 'Submersion',
          description: 'Learning to submerge face and body in water',
          sections: [
            {
              id: 3,
              name: 'Face Submersion',
              description: 'Getting comfortable with water on face',
              lessons: [
                {
                  id: 4,
                  name: 'Blowing Bubbles',
                  type: 'practical',
                  duration: 15,
                  content: 'Practice exhaling into the water'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Level 2: Floating and Gliding',
      description: 'Developing floating skills and basic gliding',
      modules: [
        {
          id: 3,
          name: 'Floating',
          description: 'Learning to float on back and front',
          sections: []
        }
      ]
    }
  ]
};

const CurriculumBuilder = () => {
  const [curriculum, setCurriculum] = useState(initialCurriculum);
  const [expandedItems, setExpandedItems] = useState({
    level_1: true,
    module_1: true,
    section_1: true
  });
  const [selectedItem, setSelectedItem] = useState({
    type: 'curriculum',
    id: 1
  });
  
  const toggleExpand = (type, id) => {
    const key = `${type}_${id}`;
    setExpandedItems({
      ...expandedItems,
      [key]: !expandedItems[key]
    });
  };
  
  const selectItem = (type, id) => {
    setSelectedItem({ type, id });
  };
  
  const getSelectedItemDetails = () => {
    if (selectedItem.type === 'curriculum') {
      return curriculum;
    } else if (selectedItem.type === 'level') {
      return curriculum.levels.find(level => level.id === selectedItem.id);
    } else if (selectedItem.type === 'module') {
      let foundModule = null;
      curriculum.levels.forEach(level => {
        const module = level.modules.find(m => m.id === selectedItem.id);
        if (module) foundModule = module;
      });
      return foundModule;
    } else if (selectedItem.type === 'section') {
      let foundSection = null;
      curriculum.levels.forEach(level => {
        level.modules.forEach(module => {
          const section = module.sections.find(s => s.id === selectedItem.id);
          if (section) foundSection = section;
        });
      });
      return foundSection;
    } else if (selectedItem.type === 'lesson') {
      let foundLesson = null;
      curriculum.levels.forEach(level => {
        level.modules.forEach(module => {
          module.sections.forEach(section => {
            const lesson = section.lessons.find(l => l.id === selectedItem.id);
            if (lesson) foundLesson = lesson;
          });
        });
      });
      return foundLesson;
    }
    return null;
  };
  
  const getIconForType = (type) => {
    switch (type) {
      case 'curriculum':
        return <BookOpen size={16} />;
      case 'level':
        return <Layers size={16} />;
      case 'module':
        return <FileText size={16} />;
      case 'section':
        return <CheckSquare size={16} />;
      case 'lesson':
        return <Video size={16} />;
      default:
        return <FileText size={16} />;
    }
  };
  
  const renderTree = () => {
    return (
      <TreeContainer>
        <TreeItem 
          active={selectedItem.type === 'curriculum' && selectedItem.id === curriculum.id}
          itemType="curriculum"
        >
          <div 
            className="item-header" 
            onClick={() => selectItem('curriculum', curriculum.id)}
          >
            <div className="type-icon">
              <BookOpen size={16} />
            </div>
            <div className="item-title">{curriculum.name}</div>
            <div className="actions">
              <button>
                <Edit size={14} />
              </button>
            </div>
          </div>
        </TreeItem>
        
        {curriculum.levels.map(level => (
          <TreeItem 
            key={level.id} 
            active={selectedItem.type === 'level' && selectedItem.id === level.id}
            itemType="level"
          >
            <div className="item-header">
              <div 
                className="expand-icon" 
                onClick={() => toggleExpand('level', level.id)}
              >
                {expandedItems[`level_${level.id}`] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>
              <div className="type-icon">
                <Layers size={16} />
              </div>
              <div 
                className="item-title"
                onClick={() => selectItem('level', level.id)}
              >
                {level.name}
              </div>
              <div className="actions">
                <button>
                  <Edit size={14} />
                </button>
                <button>
                  <Copy size={14} />
                </button>
                <button>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            {expandedItems[`level_${level.id}`] && (
              <div className="children">
                {level.modules.map(module => (
                  <TreeItem 
                    key={module.id} 
                    active={selectedItem.type === 'module' && selectedItem.id === module.id}
                    itemType="module"
                  >
                    <div className="item-header">
                      <div 
                        className="expand-icon" 
                        onClick={() => toggleExpand('module', module.id)}
                      >
                        {expandedItems[`module_${module.id}`] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>
                      <div className="type-icon">
                        <FileText size={16} />
                      </div>
                      <div 
                        className="item-title"
                        onClick={() => selectItem('module', module.id)}
                      >
                        {module.name}
                      </div>
                      <div className="actions">
                        <button>
                          <Edit size={14} />
                        </button>
                        <button>
                          <Copy size={14} />
                        </button>
                        <button>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {expandedItems[`module_${module.id}`] && (
                      <div className="children">
                        {module.sections.map(section => (
                          <TreeItem 
                            key={section.id} 
                            active={selectedItem.type === 'section' && selectedItem.id === section.id}
                            itemType="section"
                          >
                            <div className="item-header">
                              <div 
                                className="expand-icon" 
                                onClick={() => toggleExpand('section', section.id)}
                              >
                                {expandedItems[`section_${section.id}`] ? (
                                  <ChevronDown size={16} />
                                ) : (
                                  <ChevronRight size={16} />
                                )}
                              </div>
                              <div className="type-icon">
                                <CheckSquare size={16} />
                              </div>
                              <div 
                                className="item-title"
                                onClick={() => selectItem('section', section.id)}
                              >
                                {section.name}
                              </div>
                              <div className="actions">
                                <button>
                                  <Edit size={14} />
                                </button>
                                <button>
                                  <Copy size={14} />
                                </button>
                                <button>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            
                            {expandedItems[`section_${section.id}`] && section.lessons && (
                              <div className="children">
                                {section.lessons.map(lesson => (
                                  <TreeItem 
                                    key={lesson.id} 
                                    active={selectedItem.type === 'lesson' && selectedItem.id === lesson.id}
                                    itemType="lesson"
                                  >
                                    <div className="item-header">
                                      <div className="expand-icon">
                                        {/* No expand icon for lessons */}
                                      </div>
                                      <div className="type-icon">
                                        <Video size={16} />
                                      </div>
                                      <div 
                                        className="item-title"
                                        onClick={() => selectItem('lesson', lesson.id)}
                                      >
                                        {lesson.name}
                                      </div>
                                      <div className="actions">
                                        <button>
                                          <Edit size={14} />
                                        </button>
                                        <button>
                                          <Copy size={14} />
                                        </button>
                                        <button>
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </TreeItem>
                                ))}
                                <AddItemButton>
                                  <Plus size={14} />
                                  Add Lesson
                                </AddItemButton>
                              </div>
                            )}
                          </TreeItem>
                        ))}
                        <AddItemButton>
                          <Plus size={14} />
                          Add Section
                        </AddItemButton>
                      </div>
                    )}
                  </TreeItem>
                ))}
                <AddItemButton>
                  <Plus size={14} />
                  Add Module
                </AddItemButton>
              </div>
            )}
          </TreeItem>
        ))}
        <AddItemButton>
          <Plus size={14} />
          Add Level
        </AddItemButton>
      </TreeContainer>
    );
  };
  
  const renderDetails = () => {
    const item = getSelectedItemDetails();
    
    if (!item) {
      return (
        <EmptyState>
          <AlertTriangle size={48} />
          <h3>No Item Selected</h3>
          <p>Select an item from the curriculum tree to view and edit its details.</p>
        </EmptyState>
      );
    }
    
    if (selectedItem.type === 'curriculum') {
      return (
        <>
          <FormSection>
            <h2><BookOpen size={20} /> Curriculum Information</h2>
            <FormRow>
              <FormGroup>
                <label>Curriculum Name <span className="required">*</span></label>
                <Input type="text" value={item.name} />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <label>Description</label>
                <Textarea value={item.description} />
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <h2><Layers size={20} /> Levels Overview</h2>
            <p>This curriculum has {item.levels.length} levels.</p>
          </FormSection>
        </>
      );
    } else if (selectedItem.type === 'level') {
      return (
        <>
          <FormSection>
            <h2><Layers size={20} /> Level Information</h2>
            <FormRow>
              <FormGroup>
                <label>Level Name <span className="required">*</span></label>
                <Input type="text" value={item.name} />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <label>Description</label>
                <Textarea value={item.description} />
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <h2><FileText size={20} /> Modules Overview</h2>
            <p>This level has {item.modules.length} modules.</p>
          </FormSection>
        </>
      );
    } else if (selectedItem.type === 'module') {
      return (
        <>
          <FormSection>
            <h2><FileText size={20} /> Module Information</h2>
            <FormRow>
              <FormGroup>
                <label>Module Name <span className="required">*</span></label>
                <Input type="text" value={item.name} />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <label>Description</label>
                <Textarea value={item.description} />
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <h2><CheckSquare size={20} /> Sections Overview</h2>
            <p>This module has {item.sections.length} sections.</p>
          </FormSection>
        </>
      );
    } else if (selectedItem.type === 'section') {
      return (
        <>
          <FormSection>
            <h2><CheckSquare size={20} /> Section Information</h2>
            <FormRow>
              <FormGroup>
                <label>Section Name <span className="required">*</span></label>
                <Input type="text" value={item.name} />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <label>Description</label>
                <Textarea value={item.description} />
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <h2><Video size={20} /> Lessons Overview</h2>
            <p>This section has {item.lessons ? item.lessons.length : 0} lessons.</p>
          </FormSection>
        </>
      );
    } else if (selectedItem.type === 'lesson') {
      return (
        <>
          <FormSection>
            <h2><Video size={20} /> Lesson Information</h2>
            <FormRow>
              <FormGroup>
                <label>Lesson Name <span className="required">*</span></label>
                <Input type="text" value={item.name} />
              </FormGroup>
            </FormRow>
            <FormRow columns="1fr 1fr">
              <FormGroup>
                <label>Lesson Type</label>
                <Select value={item.type}>
                  <option value="practical">Practical</option>
                  <option value="theory">Theory</option>
                  <option value="assessment">Assessment</option>
                  <option value="video">Video</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <label>Duration (minutes)</label>
                <Input type="number" value={item.duration} />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <label>Content</label>
                <Textarea value={item.content} />
              </FormGroup>
            </FormRow>
          </FormSection>
        </>
      );
    }
  };
  
  return (
    <Container>
      <Header>
        <h1>Curriculum Builder</h1>
        <div className="actions">
          <Button className="secondary">
            Import Template
          </Button>
          <Button className="primary">
            <Save size={18} />
            Save Curriculum
          </Button>
        </div>
      </Header>
      
      <Content>
        <Sidebar>
          {renderTree()}
        </Sidebar>
        <MainContent>
          {renderDetails()}
        </MainContent>
      </Content>
    </Container>
  );
};

export default CurriculumBuilder; 