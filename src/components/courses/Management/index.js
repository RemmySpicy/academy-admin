import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  CheckCircle, 
  Users, 
  Calendar,
  Clock,
  DollarSign
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

const Filters = styled.div`
  padding: 16px 24px;
  background-color: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  
  .search-container {
    position: relative;
    flex: 1;
    min-width: 200px;
    
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
  
  .filter-group {
    display: flex;
    gap: 8px;
    
    select {
      padding: 10px 12px;
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      font-size: 14px;
      background-color: white;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }
  }
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
`;

const CourseCard = styled.div`
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  .card-header {
    height: 140px;
    background-color: ${props => props.color || 'var(--primary-color)'};
    position: relative;
    display: flex;
    align-items: flex-end;
    padding: 16px;
    color: white;
    
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
    }
    
    .title {
      position: relative;
      z-index: 2;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
    
    .menu {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 2;
      
      button {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
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
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: var(--border-radius);
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 12px;
      
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
  }
  
  .card-footer {
    padding: 16px;
    border-top: 1px solid var(--gray-200);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      
      svg {
        color: var(--gray-500);
      }
      
      .stat-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--gray-700);
      }
    }
  }
`;

const TableView = styled.div`
  padding: 0 24px 24px;
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th {
      text-align: left;
      padding: 12px 16px;
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
      
      &.title {
        font-weight: 500;
        color: var(--gray-800);
      }
    }
    
    tr:hover {
      background-color: var(--gray-50);
    }
  }
  
  .badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: var(--border-radius);
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
  
  .actions {
    display: flex;
    gap: 8px;
    
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
      
      &.danger:hover {
        color: var(--danger-color);
      }
    }
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  overflow: hidden;
  
  button {
    background: none;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-600);
    
    &.active {
      background-color: var(--primary-color);
      color: white;
    }
    
    &:hover:not(.active) {
      background-color: var(--gray-100);
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
      background: none;
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      &.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
      
      &:hover:not(.active) {
        background-color: var(--gray-100);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`;

// Sample data for demonstration
const courses = [
  {
    id: 1,
    title: 'Learn to Swim - Beginners',
    description: 'Introductory swimming course for beginners aged 3-5, focusing on water confidence and basic strokes.',
    status: 'active',
    color: '#4299e1',
    students: 15,
    capacity: 20,
    duration: '45 min',
    price: '$150',
    schedule: 'Mon, Wed, Fri',
    instructor: 'Sarah Johnson',
    level: 'Beginner',
    category: 'Learn to Swim'
  },
  {
    id: 2,
    title: 'Competitive Swimming',
    description: 'Advanced course for experienced swimmers looking to improve technique and speed for competitions.',
    status: 'active',
    color: '#6c5ce7',
    students: 12,
    capacity: 15,
    duration: '60 min',
    price: '$200',
    schedule: 'Tue, Thu, Sat',
    instructor: 'Michael Phelps',
    level: 'Advanced',
    category: 'Competitive'
  },
  {
    id: 3,
    title: 'Water Safety & Survival',
    description: 'Essential water safety skills and survival techniques for all ages.',
    status: 'upcoming',
    color: '#ed8936',
    students: 0,
    capacity: 25,
    duration: '45 min',
    price: '$120',
    schedule: 'Sat, Sun',
    instructor: 'David Miller',
    level: 'Intermediate',
    category: 'Safety'
  },
  {
    id: 4,
    title: 'Aqua Babies',
    description: 'Parent and baby swimming sessions for infants aged 6-24 months.',
    status: 'active',
    color: '#38b2ac',
    students: 8,
    capacity: 10,
    duration: '30 min',
    price: '$180',
    schedule: 'Tue, Thu',
    instructor: 'Emma Wilson',
    level: 'Beginner',
    category: 'Learn to Swim'
  },
  {
    id: 5,
    title: 'Adult Swimming Lessons',
    description: 'Swimming lessons designed specifically for adults who want to learn or improve their swimming skills.',
    status: 'draft',
    color: '#9f7aea',
    students: 0,
    capacity: 12,
    duration: '60 min',
    price: '$220',
    schedule: 'Mon, Wed',
    instructor: 'Robert Brown',
    level: 'Beginner',
    category: 'Learn to Swim'
  },
  {
    id: 6,
    title: 'Stroke Improvement',
    description: 'Focus on refining and perfecting all four competitive swimming strokes.',
    status: 'active',
    color: '#48bb78',
    students: 10,
    capacity: 15,
    duration: '45 min',
    price: '$175',
    schedule: 'Mon, Wed, Fri',
    instructor: 'Jessica Adams',
    level: 'Intermediate',
    category: 'Technique'
  },
  {
    id: 7,
    title: 'Swimming Club',
    description: 'Regular swimming sessions for children aged 7-14 who can already swim confidently.',
    status: 'active',
    color: '#e53e3e',
    students: 18,
    capacity: 25,
    duration: '90 min',
    price: '$250',
    schedule: 'Tue, Thu, Sat',
    instructor: 'Thomas Clark',
    level: 'Intermediate',
    category: 'Club'
  },
  {
    id: 8,
    title: 'Special Needs Swimming',
    description: 'Adaptive swimming lessons for children and adults with special needs.',
    status: 'active',
    color: '#f6ad55',
    students: 6,
    capacity: 8,
    duration: '45 min',
    price: '$160',
    schedule: 'Wed, Sat',
    instructor: 'Lisa Martinez',
    level: 'Beginner',
    category: 'Adaptive'
  }
];

const CourseManagement = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleMenu = (courseId) => {
    if (openMenu === courseId) {
      setOpenMenu(null);
    } else {
      setOpenMenu(courseId);
    }
  };
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === '' || course.category === categoryFilter;
    const matchesStatus = statusFilter === '' || course.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge active">Active</span>;
      case 'draft':
        return <span className="badge draft">Draft</span>;
      case 'upcoming':
        return <span className="badge upcoming">Upcoming</span>;
      default:
        return null;
    }
  };
  
  return (
    <Container>
      <Header>
        <h1>Course Management</h1>
        <div className="actions">
          <Button className="secondary">
            Import Courses
          </Button>
          <Button className="primary" as={Link} to="/courses/create">
            <Plus size={18} />
            Create Course
          </Button>
        </div>
      </Header>
      
      <Filters>
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Learn to Swim">Learn to Swim</option>
            <option value="Competitive">Competitive</option>
            <option value="Safety">Safety</option>
            <option value="Club">Club</option>
            <option value="Technique">Technique</option>
            <option value="Adaptive">Adaptive</option>
          </select>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
        
        <ViewToggle>
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button 
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
        </ViewToggle>
      </Filters>
      
      {viewMode === 'grid' ? (
        <CourseGrid>
          {filteredCourses.map(course => (
            <CourseCard key={course.id} color={course.color}>
              <div className="card-header">
                <div className="overlay"></div>
                <h3 className="title">{course.title}</h3>
                <div className="menu">
                  <button onClick={() => toggleMenu(course.id)}>
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === course.id && (
                    <div className="dropdown">
                      <div className="dropdown-item">
                        <Eye size={16} />
                        <span>View Details</span>
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
              </div>
              <div className="card-body">
                {getStatusBadge(course.status)}
                <p className="description">{course.description}</p>
              </div>
              <div className="card-footer">
                <div className="stat">
                  <Users size={16} />
                  <span className="stat-value">{course.students}/{course.capacity}</span>
                </div>
                <div className="stat">
                  <Clock size={16} />
                  <span className="stat-value">{course.duration}</span>
                </div>
                <div className="stat">
                  <Calendar size={16} />
                  <span className="stat-value">{course.schedule}</span>
                </div>
                <div className="stat">
                  <DollarSign size={16} />
                  <span className="stat-value">{course.price}</span>
                </div>
              </div>
            </CourseCard>
          ))}
        </CourseGrid>
      ) : (
        <TableView>
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Category</th>
                <th>Level</th>
                <th>Instructor</th>
                <th>Enrollment</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id}>
                  <td className="title">{course.title}</td>
                  <td>{course.category}</td>
                  <td>{course.level}</td>
                  <td>{course.instructor}</td>
                  <td>{course.students}/{course.capacity}</td>
                  <td>{course.price}</td>
                  <td>{getStatusBadge(course.status)}</td>
                  <td>
                    <div className="actions">
                      <button>
                        <Eye size={16} />
                      </button>
                      <button>
                        <Edit size={16} />
                      </button>
                      <button>
                        <Copy size={16} />
                      </button>
                      <button className="danger">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableView>
      )}
      
      <Pagination>
        <div className="pagination-info">
          Showing 1-8 of 8 courses
        </div>
        <div className="pagination-controls">
          <button disabled>&lt;</button>
          <button className="active">1</button>
          <button disabled>&gt;</button>
        </div>
      </Pagination>
    </Container>
  );
};

export default CourseManagement; 