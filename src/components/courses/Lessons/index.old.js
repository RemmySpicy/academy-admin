import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  BookOpen,
  Clock,
  Tag,
  Filter
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

const SearchFilterContainer = styled.div`
  padding: 16px 24px;
  background-color: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .search-input {
    position: relative;
    width: 300px;
    
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
  
  .filters {
    display: flex;
    gap: 12px;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  color: var(--gray-700);
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background-color: var(--gray-100);
  }
  
  &.active {
    background-color: var(--primary-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 16px 24px;
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
  }
  
  th {
    font-weight: 600;
    color: var(--gray-700);
    background-color: var(--gray-50);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  td {
    color: var(--gray-800);
    font-size: 14px;
  }
  
  tr:hover td {
    background-color: var(--gray-50);
  }
  
  .lesson-title {
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
    
    .title-text {
      font-weight: 500;
    }
  }
  
  .tag {
    display: inline-block;
    padding: 4px 8px;
    border-radius: var(--border-radius);
    font-size: 12px;
    font-weight: 500;
    background-color: var(--gray-100);
    color: var(--gray-700);
    
    &.beginner {
      background-color: var(--success-light);
      color: var(--success-color);
    }
    
    &.intermediate {
      background-color: var(--warning-light);
      color: var(--warning-color);
    }
    
    &.advanced {
      background-color: var(--danger-light);
      color: var(--danger-color);
    }
  }
  
  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    position: relative;
    
    button {
      background: none;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-600);
      cursor: pointer;
      
      &:hover {
        background-color: var(--gray-100);
        color: var(--gray-800);
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
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid var(--gray-200);
  
  .pagination-info {
    font-size: 14px;
    color: var(--gray-600);
  }
  
  .pagination-controls {
    display: flex;
    gap: 8px;
    
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--border-radius);
      border: 1px solid var(--gray-300);
      background-color: white;
      color: var(--gray-700);
      font-weight: 500;
      cursor: pointer;
      
      &:hover {
        background-color: var(--gray-100);
      }
      
      &.active {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`;

// Sample data for demonstration
const lessons = [
  {
    id: 1,
    title: 'Water Familiarization',
    description: 'Introduction to water environment and basic water confidence',
    difficulty: 'beginner',
    duration: 15,
    tags: ['water confidence', 'basics'],
    course: 'Learn to Swim'
  },
  {
    id: 2,
    title: 'Floating Practice',
    description: 'Learning to float on back and front with support',
    difficulty: 'beginner',
    duration: 20,
    tags: ['floating', 'basics'],
    course: 'Learn to Swim'
  },
  {
    id: 3,
    title: 'Kicking Technique',
    description: 'Proper kicking technique for freestyle and backstroke',
    difficulty: 'intermediate',
    duration: 25,
    tags: ['kicking', 'technique'],
    course: 'Swimming Club'
  },
  {
    id: 4,
    title: 'Arm Stroke Development',
    description: 'Developing proper arm stroke technique for freestyle',
    difficulty: 'intermediate',
    duration: 30,
    tags: ['arm stroke', 'technique'],
    course: 'Swimming Club'
  },
  {
    id: 5,
    title: 'Breathing Technique',
    description: 'Proper breathing technique for freestyle swimming',
    difficulty: 'intermediate',
    duration: 25,
    tags: ['breathing', 'technique'],
    course: 'Learn to Swim'
  },
  {
    id: 6,
    title: 'Breaststroke Technique',
    description: 'Introduction to breaststroke arm and leg movements',
    difficulty: 'intermediate',
    duration: 35,
    tags: ['breaststroke', 'technique'],
    course: 'Swimming Club'
  },
  {
    id: 7,
    title: 'Butterfly Technique',
    description: 'Advanced butterfly stroke technique and drills',
    difficulty: 'advanced',
    duration: 40,
    tags: ['butterfly', 'advanced technique'],
    course: 'Swimming Club'
  },
  {
    id: 8,
    title: 'Diving Fundamentals',
    description: 'Basic diving techniques from the pool edge',
    difficulty: 'intermediate',
    duration: 30,
    tags: ['diving', 'technique'],
    course: 'Swimming Club'
  },
  {
    id: 9,
    title: 'Water Safety Skills',
    description: 'Essential water safety and survival skills',
    difficulty: 'beginner',
    duration: 25,
    tags: ['safety', 'survival'],
    course: 'Survival Swimming'
  },
  {
    id: 10,
    title: 'Endurance Training',
    description: 'Building swimming endurance through interval training',
    difficulty: 'advanced',
    duration: 45,
    tags: ['endurance', 'training'],
    course: 'Swimming Club'
  }
];

const LessonsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(null);
  
  const itemsPerPage = 5;
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  
  const toggleMenu = (lessonId, e) => {
    e.stopPropagation();
    if (openMenu === lessonId) {
      setOpenMenu(null);
    } else {
      setOpenMenu(lessonId);
    }
  };
  
  const toggleFilter = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
    setCurrentPage(1);
  };
  
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      !activeFilter || 
      lesson.difficulty === activeFilter || 
      lesson.course.toLowerCase().includes(activeFilter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });
  
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLessons = filteredLessons.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <Container>
      <Header>
        <h1>Lessons Management</h1>
        <div className="actions">
          <Button className="primary">
            <Plus size={18} />
            Create Lesson
          </Button>
        </div>
      </Header>
      
      <SearchFilterContainer>
        <div className="search-input">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search lessons..." 
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="filters">
          <FilterButton 
            className={activeFilter === 'beginner' ? 'active' : ''}
            onClick={() => toggleFilter('beginner')}
          >
            <Filter size={16} />
            Beginner
          </FilterButton>
          <FilterButton 
            className={activeFilter === 'intermediate' ? 'active' : ''}
            onClick={() => toggleFilter('intermediate')}
          >
            <Filter size={16} />
            Intermediate
          </FilterButton>
          <FilterButton 
            className={activeFilter === 'advanced' ? 'active' : ''}
            onClick={() => toggleFilter('advanced')}
          >
            <Filter size={16} />
            Advanced
          </FilterButton>
        </div>
      </SearchFilterContainer>
      
      <div style={{ overflowX: 'auto' }}>
        <Table>
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Course</th>
              <th>Duration</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLessons.map(lesson => (
              <tr key={lesson.id}>
                <td>
                  <div className="lesson-title">
                    <div className="lesson-icon">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="title-text">{lesson.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '2px' }}>
                        {lesson.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{lesson.course}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} />
                    {lesson.duration} min
                  </div>
                </td>
                <td>
                  <span className={`tag ${lesson.difficulty}`}>
                    {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {lesson.tags.map((tag, index) => (
                      <span key={index} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="actions">
                    <button onClick={(e) => toggleMenu(lesson.id, e)}>
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === lesson.id && (
                      <div className="dropdown">
                        <div className="dropdown-item">
                          <Eye size={16} />
                          <span>View</span>
                        </div>
                        <div className="dropdown-item">
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
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      <Pagination>
        <div className="pagination-info">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLessons.length)} of {filteredLessons.length} lessons
        </div>
        <div className="pagination-controls">
          <button 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
          >
            &lsaquo;
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            // Show current page, and 1 page before and after
            if (
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button 
                  key={pageNumber}
                  className={currentPage === pageNumber ? 'active' : ''}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            } else if (
              (pageNumber === currentPage - 2 && currentPage > 3) || 
              (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return <span key={pageNumber} style={{ alignSelf: 'center' }}>...</span>;
            }
            return null;
          })}
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
          >
            &rsaquo;
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </div>
      </Pagination>
    </Container>
  );
};

export default LessonsManagement; 