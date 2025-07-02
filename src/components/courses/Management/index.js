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
  DollarSign,
  BookOpen
} from 'lucide-react';
import FeatureContainer from '../../common/FeatureContainer';
import { createFilterDropdowns, createViewToggle } from '../../common/FeatureContainer/utils';

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
    background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
    background-size: cover;
    background-position: center;
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
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.7) 100%);
    }
    
    .title {
      position: relative;
      z-index: 2;
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
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
        transition: all 0.2s;
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
      
      .dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        min-width: 180px;
        z-index: 10;
        overflow: hidden;
        margin-top: 4px;
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          color: var(--gray-700);
          text-decoration: none;
          transition: all 0.2s;
          
          &:hover {
            background-color: var(--gray-100);
          }
          
          &.danger {
            color: var(--danger-color);
            
            &:hover {
              background-color: var(--danger-50);
            }
          }
        }
      }
    }
  }
  
  .card-body {
    padding: 16px;
    
    .age-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
      
      .age-tag {
        padding: 2px 8px;
        border-radius: 12px;
        background-color: var(--primary-50, rgba(108, 92, 231, 0.1));
        color: var(--primary-color);
        font-size: 12px;
        font-weight: 500;
      }
    }
    
    .description {
      color: var(--gray-600);
      font-size: 14px;
      margin-bottom: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  
  .card-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--gray-100);
    display: flex;
    justify-content: space-between;
    
    .stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--gray-600);
      
      svg {
        color: var(--gray-500);
      }
    }
  }
`;

const TableView = styled.div`
  overflow-x: auto;
  
  table {
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
      
      &.title {
        font-weight: 500;
      }
    }
    
    tr:hover td {
      background-color: var(--gray-50);
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
        
        &.danger:hover {
          background-color: var(--danger-50);
          color: var(--danger-color);
        }
      }
      
      .dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        min-width: 180px;
        z-index: 10;
        overflow: hidden;
        margin-top: 4px;
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.2s;
          
          &:hover {
            background-color: var(--gray-100);
          }
          
          &.danger {
            color: var(--danger-color);
            
            &:hover {
              background-color: var(--danger-50);
            }
          }
        }
      }
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: var(--border-radius);
      font-size: 12px;
      font-weight: 500;
      
      &.active {
        background-color: var(--success-light, rgba(72, 187, 120, 0.1));
        color: var(--success-color);
      }
      
      &.draft {
        background-color: var(--gray-100);
        color: var(--gray-600);
      }
      
      &.upcoming {
        background-color: var(--warning-light, rgba(237, 137, 54, 0.1));
        color: var(--warning-color);
      }
    }
  }
`;

// Sample data for demonstration
const courses = [
  {
    id: 1,
    title: 'Learn to Swim',
    description: 'Comprehensive swimming program for beginners to intermediate swimmers.',
    status: 'active',
    color: '#4299e1',
    students: 45,
    price: '₦15,000',
    schedule: 'Mon, Wed, Fri',
    instructor: 'Sarah Johnson',
    level: 'Beginner',
    category: 'Learn to Swim',
    ageRanges: ['3 - 5 years', '6 - 17 years', '18 - 29 years'],
    imageUrl: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?ixlib=rb-4.0.3',
    capacity: 50
  },
  {
    id: 2,
    title: 'Swimming Club',
    description: 'Regular swimming sessions for children and young adults who can already swim confidently.',
    status: 'active',
    color: '#6c5ce7',
    students: 38,
    price: '₦20,000',
    schedule: 'Tue, Thu, Sat',
    instructor: 'Michael Phelps',
    level: 'Intermediate',
    category: 'Club',
    ageRanges: ['3 - 5 years', '6 - 17 years', '18 - 29 years'],
    imageUrl: 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?ixlib=rb-4.0.3',
    capacity: 40
  },
  {
    id: 3,
    title: 'Adult Swimming',
    description: 'Swimming lessons designed specifically for adults who want to learn or improve their swimming skills.',
    status: 'active',
    color: '#ed8936',
    students: 22,
    price: '₦22,000',
    schedule: 'Sat, Sun',
    instructor: 'David Miller',
    level: 'Beginner',
    category: 'Adult',
    ageRanges: ['30+ years'],
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3',
    capacity: 25
  },
  {
    id: 4,
    title: 'Fitness Swimming',
    description: 'Swimming for fitness and endurance training for adults.',
    status: 'active',
    color: '#38b2ac',
    students: 18,
    price: '₦18,000',
    schedule: 'Tue, Thu',
    instructor: 'Emma Wilson',
    level: 'Intermediate',
    category: 'Fitness',
    ageRanges: ['20+ years'],
    imageUrl: 'https://images.unsplash.com/photo-1626201850133-172a69ccde3d?ixlib=rb-4.0.3',
    capacity: 20
  },
  {
    id: 5,
    title: 'Aqua Babies',
    description: 'Parent and baby swimming sessions for infants aged 12-36 months.',
    status: 'active',
    color: '#9f7aea',
    students: 15,
    price: '₦18,000',
    schedule: 'Mon, Wed',
    instructor: 'Robert Brown',
    level: 'Beginner',
    category: 'Infants',
    ageRanges: ['12 - 36 months'],
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3',
    capacity: 15
  },
  {
    id: 6,
    title: 'Aqua Aerobics',
    description: 'Water-based exercise program for older adults focusing on flexibility and cardiovascular health.',
    status: 'active',
    color: '#48bb78',
    students: 20,
    price: '₦17,500',
    schedule: 'Mon, Wed, Fri',
    instructor: 'Jessica Adams',
    level: 'Beginner',
    category: 'Aerobics',
    ageRanges: ['45 years +'],
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0fd24e0fb55d?ixlib=rb-4.0.3',
    capacity: 25
  },
  {
    id: 7,
    title: 'Survival Swimming',
    description: 'Essential water safety skills and survival techniques for children and adults.',
    status: 'active',
    color: '#e53e3e',
    students: 28,
    price: '₦25,000',
    schedule: 'Tue, Thu, Sat',
    instructor: 'Thomas Clark',
    level: 'Intermediate',
    category: 'Safety',
    ageRanges: ['6 - 11 years', '12+ years'],
    imageUrl: 'https://images.unsplash.com/photo-1551649446-7a3b6d50f320?ixlib=rb-4.0.3',
    capacity: 30
  },
  {
    id: 8,
    title: 'Parent-Child Aquatics',
    description: 'Swimming lessons for parents and young children to learn together.',
    status: 'active',
    color: '#f6ad55',
    students: 16,
    price: '₦16,000',
    schedule: 'Wed, Sat',
    instructor: 'Lisa Martinez',
    level: 'Beginner',
    category: 'Family',
    ageRanges: ['1 - 3 years'],
    imageUrl: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?ixlib=rb-4.0.3',
    capacity: 20
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

  // Filter options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Learn to Swim', label: 'Learn to Swim' },
    { value: 'Competitive', label: 'Competitive' },
    { value: 'Safety', label: 'Safety' },
    { value: 'Club', label: 'Club' },
    { value: 'Technique', label: 'Technique' },
    { value: 'Adaptive', label: 'Adaptive' },
    { value: 'Family', label: 'Family' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'upcoming', label: 'Upcoming' }
  ];

  // Custom filter component
  const filterComponent = (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      {createFilterDropdowns([
        {
          value: categoryFilter,
          onChange: setCategoryFilter,
          options: categoryOptions
        },
        {
          value: statusFilter,
          onChange: setStatusFilter,
          options: statusOptions
        }
      ])}
    </div>
  );

  // View toggle component
  const viewToggleComponent = createViewToggle(
    viewMode,
    setViewMode,
    [
      { value: 'grid', label: 'Grid' },
      { value: 'table', label: 'Table' }
    ]
  );

  return (
    <FeatureContainer
      title="Course Management"
      icon={BookOpen}
      badge={`${filteredCourses.length} courses`}
      showSearch={true}
      searchPlaceholder="Search courses..."
      searchValue={searchQuery}
      onSearchChange={handleSearch}
      customFilterComponent={filterComponent}
      viewToggle={viewToggleComponent}
      primaryAction={{
        label: 'Create Course',
        icon: Plus,
        as: Link,
        to: '/courses/create'
      }}
      secondaryActions={[
        { label: 'Import Courses', onClick: () => console.log('Import courses') }
      ]}
      showPagination={true}
      paginationInfo={`Showing 1-${filteredCourses.length} of ${filteredCourses.length} courses`}
      currentPage={1}
      totalPages={1}
      onPageChange={() => {}}
    >
      {viewMode === 'grid' ? (
        <CourseGrid>
          {filteredCourses.map(course => (
            <CourseCard 
              key={course.id} 
              color={course.color} 
              imageUrl={course.imageUrl}
            >
              <div className="card-header">
                <div className="overlay"></div>
                <h3 className="title">{course.title}</h3>
                <div className="menu">
                  <button onClick={() => toggleMenu(course.id)}>
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === course.id && (
                    <div className="dropdown">
                      <Link to={`/courses/details/${course.id}`} className="dropdown-item">
                        <Eye size={16} />
                        <span>View Details</span>
                      </Link>
                      <Link to={`/courses/edit/${course.id}`} className="dropdown-item">
                        <Edit size={16} />
                        <span>Edit</span>
                      </Link>
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
                <div className="age-tags">
                  {course.ageRanges.map((age, index) => (
                    <span key={index} className="age-tag">{age}</span>
                  ))}
                </div>
                <p className="description">{course.description}</p>
              </div>
              <div className="card-footer">
                <div className="stat">
                  <Users size={16} />
                  <span className="stat-value">{course.students}</span>
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
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id}>
                  <td className="title">{course.title}</td>
                  <td>{course.category}</td>
                  <td>{course.level}</td>
                  <td>{course.instructor}</td>
                  <td>{course.students}/{course.capacity || '∞'}</td>
                  <td>{course.price}</td>
                  <td>{getStatusBadge(course.status)}</td>
                  <td>
                    <div className="actions">
                      <button onClick={(e) => toggleMenu(course.id, e)}>
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === course.id && (
                        <div className="dropdown">
                          <div className="dropdown-item" onClick={() => console.log(`View ${course.id}`)}>
                            <Eye size={16} />
                            <span>View Details</span>
                          </div>
                          <div className="dropdown-item" onClick={() => console.log(`Edit ${course.id}`)}>
                            <Edit size={16} />
                            <span>Edit</span>
                          </div>
                          <div className="dropdown-item" onClick={() => console.log(`Duplicate ${course.id}`)}>
                            <Copy size={16} />
                            <span>Duplicate</span>
                          </div>
                          <div className="dropdown-item danger" onClick={() => console.log(`Delete ${course.id}`)}>
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
          </table>
        </TableView>
      )}
    </FeatureContainer>
  );
};

export default CourseManagement; 