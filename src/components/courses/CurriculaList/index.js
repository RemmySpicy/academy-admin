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
  BookOpen,
  Layers,
  Filter
} from 'lucide-react';
import FeatureContainer from '../../common/FeatureContainer';
import { createFilterDropdowns } from '../../common/FeatureContainer/utils';

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
      
      .stat {
        font-size: 13px;
        color: var(--gray-600);
        display: flex;
        align-items: center;
        gap: 6px;
        
        .value {
          font-weight: 500;
          color: var(--gray-700);
        }
      }
    }
  }
  
  .card-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .levels {
      display: flex;
      gap: 8px;
      
      .level {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--gray-300);
        
        &.active {
          background-color: var(--primary-color);
        }
      }
    }
    
    .updated {
      font-size: 12px;
      color: var(--gray-500);
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

// Sample data
const courses = [
  {
    id: 1,
    name: 'Learn to Swim',
    totalCurricula: 3,
    color: '#4299e1',
    curricula: [
      {
        id: 101,
        title: 'Learn to Swim: 3-5 Years',
        description: 'Basic swimming curriculum for young children focusing on water confidence and safety.',
        ageRange: '3 - 5 years',
        lessons: 8,
        duration: '45 mins',
        level: 'beginner',
        levels: 1,
        lastUpdated: '2 weeks ago'
      },
      {
        id: 102,
        title: 'Learn to Swim: 6-17 Years',
        description: 'Comprehensive swimming program for school-age children covering basic strokes.',
        ageRange: '6 - 17 years',
        lessons: 10,
        duration: '45 mins',
        level: 'beginner',
        levels: 1,
        lastUpdated: '3 weeks ago'
      },
      {
        id: 103,
        title: 'Learn to Swim: 18-29 Years',
        description: 'Swimming program for young adults focusing on technique and confidence.',
        ageRange: '18 - 29 years',
        lessons: 12,
        duration: '45 mins',
        level: 'beginner',
        levels: 2,
        lastUpdated: '1 month ago'
      }
    ]
  },
  {
    id: 2,
    name: 'Swimming Club',
    totalCurricula: 3,
    color: '#6c5ce7',
    curricula: [
      {
        id: 201,
        title: 'Swimming Club: 3-5 Years',
        description: 'Introductory competitive swimming program for young children.',
        ageRange: '3 - 5 years',
        lessons: 12,
        duration: '45 mins',
        level: 'intermediate',
        levels: 2,
        lastUpdated: '1 week ago'
      },
      {
        id: 202,
        title: 'Swimming Club: 6-17 Years',
        description: 'Competitive swimming program focusing on technique and racing skills.',
        ageRange: '6 - 17 years',
        lessons: 15,
        duration: '60 mins',
        level: 'intermediate',
        levels: 3,
        lastUpdated: '4 days ago'
      },
      {
        id: 203,
        title: 'Swimming Club: 18-29 Years',
        description: 'Advanced swimming techniques and race preparation for adults.',
        ageRange: '18 - 29 years',
        lessons: 15,
        duration: '60 mins',
        level: 'advanced',
        levels: 3,
        lastUpdated: '2 weeks ago'
      }
    ]
  },
  {
    id: 3,
    name: 'Adult Swimming',
    totalCurricula: 1,
    color: '#ed8936',
    curricula: [
      {
        id: 301,
        title: 'Adult Swimming: 30+ Years',
        description: 'Swimming program designed for adults focusing on technique and fitness.',
        ageRange: '30+ years',
        lessons: 12,
        duration: '60 mins',
        level: 'intermediate',
        levels: 3,
        lastUpdated: '2 months ago'
      }
    ]
  },
  {
    id: 4,
    name: 'Fitness Swimming',
    totalCurricula: 1,
    color: '#38b2ac',
    curricula: [
      {
        id: 401,
        title: 'Fitness Swimming: 20+ Years',
        description: 'Swimming for fitness and endurance training for adults.',
        ageRange: '20+ years',
        lessons: 12,
        duration: '60 mins',
        level: 'intermediate',
        levels: 2,
        lastUpdated: '3 weeks ago'
      }
    ]
  },
  {
    id: 5,
    name: 'Aqua Babies',
    totalCurricula: 1,
    color: '#9f7aea',
    curricula: [
      {
        id: 501,
        title: 'Aqua Babies: 12-36 Months',
        description: 'Parent and baby swimming sessions focusing on water familiarity.',
        ageRange: '12 - 36 months',
        lessons: 8,
        duration: '30 mins',
        level: 'beginner',
        levels: 1,
        lastUpdated: '1 month ago'
      }
    ]
  },
  {
    id: 6,
    name: 'Aqua Aerobics',
    totalCurricula: 1,
    color: '#48bb78',
    curricula: [
      {
        id: 601,
        title: 'Aqua Aerobics: 45+ Years',
        description: 'Water-based fitness program focusing on flexibility and cardiovascular health.',
        ageRange: '45+ years',
        lessons: 10,
        duration: '45 mins',
        level: 'beginner',
        levels: 1,
        lastUpdated: '2 weeks ago'
      }
    ]
  },
  {
    id: 7,
    name: 'Survival Swimming',
    totalCurricula: 2,
    color: '#e53e3e',
    curricula: [
      {
        id: 701,
        title: 'Survival Swimming: 6-11 Years',
        description: 'Essential water safety and survival techniques for children.',
        ageRange: '6 - 11 years',
        lessons: 6,
        duration: '45 mins',
        level: 'beginner',
        levels: 2,
        lastUpdated: '1 month ago'
      },
      {
        id: 702,
        title: 'Survival Swimming: 12+ Years',
        description: 'Advanced water safety and survival techniques for older children and adults.',
        ageRange: '12+ years',
        lessons: 8,
        duration: '60 mins',
        level: 'intermediate',
        levels: 2,
        lastUpdated: '2 months ago'
      }
    ]
  },
  {
    id: 8,
    name: 'Parent-Child Aquatics',
    totalCurricula: 1,
    color: '#f6ad55',
    curricula: [
      {
        id: 801,
        title: 'Parent-Child Aquatics: 1-3 Years',
        description: 'Swimming lessons for parents and young children to learn together.',
        ageRange: '1 - 3 years',
        lessons: 8,
        duration: '30 mins',
        level: 'beginner',
        levels: 1,
        lastUpdated: '3 weeks ago'
      }
    ]
  }
];

const CurriculaList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourses, setExpandedCourses] = useState([1]); // Start with the first course expanded
  const [openMenu, setOpenMenu] = useState(null);
  const [courseFilter, setCourseFilter] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleCourseExpand = (courseId) => {
    setExpandedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
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

  // Filter courses based on course filter
  let displayCourses = courses;
  if (courseFilter) {
    displayCourses = courses.filter(course => course.id === parseInt(courseFilter));
  }
  
  // Filter curricula based on search query
  const filteredCourses = displayCourses.map(course => ({
    ...course,
    curricula: course.curricula.filter(
      curriculum => curriculum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   curriculum.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(course => course.curricula.length > 0);
  
  // Create the course filter options
  const courseOptions = [
    { value: '', label: 'All Courses' },
    ...courses.map(course => ({
      value: course.id.toString(),
      label: course.name
    }))
  ];

  // Create filter component
  const filterComponent = (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {createFilterDropdowns([
        {
          value: courseFilter,
          onChange: setCourseFilter,
          options: courseOptions
        }
      ])}
    </div>
  );
  
  const totalCurricula = filteredCourses.reduce((total, course) => total + course.curricula.length, 0);
  
  return (
    <FeatureContainer
      title="Curricula Management"
      icon={Layers}
      badge={`${totalCurricula} curricula`}
      showSearch={true}
      searchPlaceholder="Search curricula..."
      searchValue={searchQuery}
      onSearchChange={handleSearch}
      customFilterComponent={filterComponent}
      primaryAction={{
        label: 'Create Curriculum',
        icon: Plus,
        onClick: handleCreateCurriculum
      }}
      secondaryActions={[
        { label: 'Import Templates', onClick: () => console.log('Import templates') }
      ]}
    >
      {filteredCourses.map(course => (
        <CourseSection key={course.id}>
          <div 
            className="course-header"
            onClick={() => toggleCourseExpand(course.id)}
          >
            {expandedCourses.includes(course.id) ? (
              <ChevronDown size={20} className="toggle-icon" />
            ) : (
              <ChevronRight size={20} className="toggle-icon" />
            )}
            <h2>
              <BookOpen size={18} />
              {course.name}
            </h2>
            <span className="course-meta">
              {course.curricula.length} of {course.totalCurricula} curricula
            </span>
          </div>
          
          {expandedCourses.includes(course.id) && (
            <div className="course-content">
              <CurriculaGrid>
                {course.curricula.map(curriculum => (
                  <CurriculumCard key={curriculum.id} color={course.color}>
                    <div className="card-header">
                      <h3 className="title">{curriculum.title}</h3>
                      <div className="age-range">{curriculum.ageRange}</div>
                      <div className="menu">
                        <button onClick={(e) => toggleMenu(curriculum.id, e)}>
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === curriculum.id && (
                          <div className="dropdown">
                            <div className="dropdown-item" onClick={() => console.log('View curriculum', curriculum.id)}>
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
                      <p className="description">{curriculum.description}</p>
                      <div className="stats">
                        <div className="stat">
                          Lessons: <span className="value">{curriculum.lessons}</span>
                        </div>
                        <div className="stat">
                          Duration: <span className="value">{curriculum.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="levels">
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`level ${i < curriculum.levels ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                      <div className="updated">
                        Updated {curriculum.lastUpdated}
                      </div>
                    </div>
                  </CurriculumCard>
                ))}
              </CurriculaGrid>
            </div>
          )}
        </CourseSection>
      ))}
    </FeatureContainer>
  );
};

export default CurriculaList; 