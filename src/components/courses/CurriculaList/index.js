import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  ChevronRight,
  ChevronDown,
  BookOpen
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

const SearchContainer = styled.div`
  padding: 16px 24px;
  background-color: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  
  .search-input {
    position: relative;
    max-width: 400px;
    
    svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-500);
    }
    
    input {
      width: 100%;
      padding: 10px 12px 10px 40px;
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
      }
      
      &::placeholder {
        color: var(--gray-400);
      }
    }
  }
`;

const CourseSection = styled.div`
  margin-bottom: 24px;
  
  .course-header {
    padding: 16px 24px;
    background-color: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    align-items: center;
    cursor: pointer;
    
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .toggle-icon {
      margin-right: 8px;
      color: var(--gray-600);
    }
    
    .course-meta {
      margin-left: auto;
      font-size: 14px;
      color: var(--gray-600);
    }
  }
  
  .course-content {
    padding: 0 24px;
  }
`;

const CurriculaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
`;

const CurriculumCard = styled.div`
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  .card-header {
    padding: 16px;
    background-color: ${props => props.color || 'var(--primary-light)'};
    position: relative;
    
    .title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: ${props => props.color ? 'white' : 'var(--primary-color)'};
    }
    
    .age-range {
      font-size: 13px;
      margin-top: 4px;
      color: ${props => props.color ? 'rgba(255, 255, 255, 0.8)' : 'var(--gray-600)'};
    }
    
    .menu {
      position: absolute;
      top: 12px;
      right: 12px;
      
      button {
        background: ${props => props.color ? 'rgba(255, 255, 255, 0.2)' : 'var(--gray-100)'};
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${props => props.color ? 'white' : 'var(--gray-600)'};
        cursor: pointer;
        
        &:hover {
          background: ${props => props.color ? 'rgba(255, 255, 255, 0.3)' : 'var(--gray-200)'};
        }
      }
    }
    
    .dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background-color: white;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      width: 180px;
      z-index: 10;
      overflow: hidden;
      
      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        color: var(--gray-700);
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:hover {
          background-color: var(--gray-100);
        }
        
        &.danger {
          color: var(--danger-color);
        }
      }
    }
  }
  
  .card-body {
    padding: 16px;
    
    .description {
      font-size: 14px;
      color: var(--gray-600);
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .stats {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--gray-600);
      
      .stat {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
  
  .card-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--gray-200);
    display: flex;
    justify-content: center;
    
    a {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const AddCurriculumCard = styled.div`
  border: 2px dashed var(--gray-300);
  border-radius: var(--border-radius);
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
    background-color: var(--gray-50);
  }
  
  .add-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    
    svg {
      color: var(--gray-600);
    }
  }
  
  .add-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--gray-600);
  }
`;

// Sample data for demonstration
const courses = [
  {
    id: 1,
    title: 'Learn to Swim',
    curricula: [
      {
        id: 1,
        title: 'Learn to Swim: 3-5 Years',
        ageRange: '3 - 5 years',
        description: 'Basic swimming curriculum for young children focusing on water confidence and basic strokes.',
        levels: 3,
        modules: 8,
        color: '#4299e1'
      },
      {
        id: 2,
        title: 'Learn to Swim: 6-17 Years',
        ageRange: '6 - 17 years',
        description: 'Comprehensive swimming program for school-age children covering all major strokes and techniques.',
        levels: 4,
        modules: 12,
        color: '#4299e1'
      },
      {
        id: 3,
        title: 'Learn to Swim: 18-29 Years',
        ageRange: '18 - 29 years',
        description: 'Swimming program for young adults focusing on stroke refinement and endurance building.',
        levels: 3,
        modules: 9,
        color: '#4299e1'
      }
    ]
  },
  {
    id: 2,
    title: 'Swimming Club',
    curricula: [
      {
        id: 4,
        title: 'Swimming Club: 3-5 Years',
        ageRange: '3 - 5 years',
        description: 'Introductory competitive swimming program for young children.',
        levels: 2,
        modules: 6,
        color: '#6c5ce7'
      },
      {
        id: 5,
        title: 'Swimming Club: 6-17 Years',
        ageRange: '6 - 17 years',
        description: 'Competitive swimming program for school-age children with focus on technique and speed.',
        levels: 4,
        modules: 16,
        color: '#6c5ce7'
      },
      {
        id: 6,
        title: 'Swimming Club: 18-29 Years',
        ageRange: '18 - 29 years',
        description: 'Advanced competitive swimming program for young adults.',
        levels: 3,
        modules: 12,
        color: '#6c5ce7'
      }
    ]
  },
  {
    id: 3,
    title: 'Adult Swimming',
    curricula: [
      {
        id: 7,
        title: 'Adult Swimming: 30+',
        ageRange: '30+ years',
        description: 'Swimming program designed for adults focusing on technique and fitness.',
        levels: 3,
        modules: 9,
        color: '#ed8936'
      }
    ]
  },
  {
    id: 4,
    title: 'Survival Swimming',
    curricula: [
      {
        id: 8,
        title: 'Survival Swimming: 6-11 Years',
        ageRange: '6 - 11 years',
        description: 'Water safety and survival techniques for children.',
        levels: 2,
        modules: 6,
        color: '#e53e3e'
      },
      {
        id: 9,
        title: 'Survival Swimming: 12+',
        ageRange: '12+ years',
        description: 'Advanced water safety and survival techniques for older children and adults.',
        levels: 2,
        modules: 8,
        color: '#e53e3e'
      }
    ]
  }
];

const CurriculaList = () => {
  const navigate = useNavigate();
  const [expandedCourses, setExpandedCourses] = useState(courses.map(course => course.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleCourseExpand = (courseId) => {
    if (expandedCourses.includes(courseId)) {
      setExpandedCourses(expandedCourses.filter(id => id !== courseId));
    } else {
      setExpandedCourses([...expandedCourses, courseId]);
    }
  };
  
  const toggleMenu = (curriculumId, e) => {
    e.stopPropagation();
    if (openMenu === curriculumId) {
      setOpenMenu(null);
    } else {
      setOpenMenu(curriculumId);
    }
  };

  const handleCreateCurriculum = () => {
    navigate('/courses/curriculum/create');
  };

  const handleEditCurriculum = (id) => {
    navigate(`/courses/curriculum/edit/${id}`);
  };
  
  const filteredCourses = courses.map(course => ({
    ...course,
    curricula: course.curricula.filter(curriculum => 
      curriculum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curriculum.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curriculum.ageRange.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(course => course.curricula.length > 0);
  
  return (
    <Container>
      <Header>
        <h1>Curricula Management</h1>
        <div className="actions">
          <Button className="primary" onClick={handleCreateCurriculum}>
            <Plus size={18} />
            Create Curriculum
          </Button>
        </div>
      </Header>
      
      <SearchContainer>
        <div className="search-input">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search curricula..." 
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </SearchContainer>
      
      {filteredCourses.map(course => (
        <CourseSection key={course.id}>
          <div 
            className="course-header"
            onClick={() => toggleCourseExpand(course.id)}
          >
            {expandedCourses.includes(course.id) ? (
              <ChevronDown size={18} className="toggle-icon" />
            ) : (
              <ChevronRight size={18} className="toggle-icon" />
            )}
            <h2>
              <BookOpen size={18} />
              {course.title}
            </h2>
            <div className="course-meta">
              {course.curricula.length} {course.curricula.length === 1 ? 'curriculum' : 'curricula'}
            </div>
          </div>
          
          {expandedCourses.includes(course.id) && (
            <div className="course-content">
              <CurriculaGrid>
                {course.curricula.map(curriculum => (
                  <CurriculumCard key={curriculum.id} color={curriculum.color}>
                    <div className="card-header">
                      <h3 className="title">{curriculum.title}</h3>
                      <div className="menu">
                        <button onClick={(e) => toggleMenu(curriculum.id, e)}>
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === curriculum.id && (
                          <div className="dropdown">
                            <div className="dropdown-item">
                              <Eye size={16} />
                              <span>View</span>
                            </div>
                            <div className="dropdown-item" onClick={() => handleEditCurriculum(curriculum.id)}>
                              <Edit size={16} />
                              <span>Edit</span>
                            </div>
                            <div className="dropdown-item">
                              <Copy size={16} />
                              <span>Duplicate</span>
                            </div>
                            <div className="dropdown-item danger">
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="age-range" style={{ marginBottom: '8px', fontSize: '13px', color: 'var(--gray-600)' }}>
                        {curriculum.ageRange}
                      </div>
                      <p className="description">{curriculum.description}</p>
                      <div className="stats">
                        <div className="stat">
                          <span>{curriculum.levels} Levels</span>
                        </div>
                        <div className="stat">
                          <span>{curriculum.modules} Modules</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <Link to={`/courses/curriculum/edit/${curriculum.id}`}>
                        <span>Customize Curriculum</span>
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </CurriculumCard>
                ))}
                <AddCurriculumCard onClick={handleCreateCurriculum}>
                  <div className="add-icon">
                    <Plus size={24} />
                  </div>
                  <div className="add-text">Add New Curriculum</div>
                </AddCurriculumCard>
              </CurriculaGrid>
            </div>
          )}
        </CourseSection>
      ))}
    </Container>
  );
};

export default CurriculaList; 