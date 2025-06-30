import React, { useState } from 'react';
import styled from 'styled-components';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  MoreHorizontal,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

import StudentManagement from '../components/students/Management';
import StudentProfiles from '../components/students/Profiles';
import StudentProgress from '../components/students/Progress';

const PageContainer = styled.div`
  padding: 20px 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #6c5ce7;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #5a4acf;
  }
`;

const TabNav = styled.nav`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const Tab = styled(NavLink)`
  padding: 12px 16px;
  font-weight: 500;
  color: #718096;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  text-decoration: none;
  
  &:hover {
    color: #6c5ce7;
  }
  
  &.active {
    color: #6c5ce7;
    border-bottom-color: #6c5ce7;
  }
`;

const SearchFilterContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    transition: border-color 0.2s;
    
    &:focus {
      outline: none;
      border-color: #6c5ce7;
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #cbd5e0;
  }
`;

const StudentTable = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr 1fr 1fr 140px 100px;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f7fafc;
  
  .header-cell {
    font-size: 14px;
    font-weight: 600;
    color: #4a5568;
    
    &.checkbox {
      display: flex;
      align-items: center;
    }
    
    input[type="checkbox"] {
      width: 16px;
      height: 16px;
    }
    
    &.actions {
      text-align: right;
    }
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr 1fr 1fr 140px 100px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f9fafb;
  }
  
  .cell {
    &.checkbox {
      display: flex;
      align-items: center;
    }
    
    input[type="checkbox"] {
      width: 16px;
      height: 16px;
    }
    
    &.student {
      display: flex;
      align-items: center;
      
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #6c5ce7;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
        margin-right: 12px;
      }
      
      .details {
        .name {
          font-weight: 500;
          margin-bottom: 2px;
        }
        
        .email {
          font-size: 13px;
          color: #718096;
        }
      }
    }
    
    &.facility {
      color: #4a5568;
    }
    
    &.progress {
      display: flex;
      align-items: center;
      
      .progress-label {
        margin-right: 8px;
        font-weight: 500;
        color: #4a5568;
      }
      
      .progress-bar {
        flex: 1;
        height: 8px;
        background-color: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
        
        .progress-value {
          height: 100%;
          background-color: #6c5ce7;
          border-radius: 4px;
        }
      }
    }
    
    &.status {
      display: flex;
      align-items: center;
      
      .status-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        
        &.completed {
          background-color: #38b2ac20;
          color: #38b2ac;
        }
        
        &.partial {
          background-color: #6c5ce720;
          color: #6c5ce7;
        }
        
        &.unbooked {
          background-color: #a0aec020;
          color: #718096;
        }
      }
    }
    
    &.actions {
      display: flex;
      justify-content: flex-end;
      
      .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: none;
        background-color: transparent;
        color: #718096;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background-color: #f0f0f0;
          color: #4a5568;
        }
      }
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  
  .pagination-info {
    font-size: 14px;
    color: #718096;
  }
  
  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .pagination-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background-color: white;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover:not(:disabled) {
        border-color: #6c5ce7;
        color: #6c5ce7;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &.next {
        padding-left: 2px;
      }
      
      &.prev {
        padding-right: 2px;
      }
    }
  }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 10;
  margin-top: 8px;
  border: 1px solid #e2e8f0;
`;

const FilterSection = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .filter-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #2d3748;
  }
`;

const SelectDropdown = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #4a5568;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  
  button {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &.reset {
      border: 1px solid #e2e8f0;
      background-color: white;
      color: #718096;
      
      &:hover {
        border-color: #cbd5e0;
      }
    }
    
    &.apply {
      border: none;
      background-color: #6c5ce7;
      color: white;
      
      &:hover {
        background-color: #5a4acf;
      }
    }
  }
`;

// Mock data
const mockStudents = [
  {
    id: 1,
    name: 'Adebesi Oluchi',
    email: 'adebisi123@gmail.com',
    facility: 'Downtown pool',
    progress: {
      level: 3,
      module: 2,
      completion: 75
    },
    status: 'partial'
  },
  {
    id: 2,
    name: 'Adebesi Oluchi',
    email: 'adebisi123@gmail.com',
    facility: 'Downtown pool',
    progress: {
      level: 3,
      module: 2,
      completion: 75
    },
    status: 'partial'
  },
  {
    id: 3,
    name: 'Adebesi Oluchi',
    email: 'adebisi123@gmail.com',
    facility: 'Downtown pool',
    progress: {
      level: 3,
      module: 2,
      completion: 75
    },
    status: 'unbooked'
  },
  {
    id: 4,
    name: 'Adebesi Oluchi',
    email: 'adebisi123@gmail.com',
    facility: 'Downtown pool',
    progress: {
      level: 3,
      module: 2,
      completion: 75
    },
    status: 'unbooked'
  },
  {
    id: 5,
    name: 'Adebesi Oluchi',
    email: 'adebisi123@gmail.com',
    facility: 'Downtown pool',
    progress: {
      level: 3,
      module: 2,
      completion: 75
    },
    status: 'completed'
  },
  {
    id: 6,
    name: 'Adebesi Oluchi',
    email: 'adebisi123@gmail.com',
    facility: 'Downtown pool',
    progress: {
      level: 3,
      module: 2,
      completion: 75
    },
    status: 'completed'
  },
  {
    id: 7,
    name: 'Adebesi Oluchi',
    email: 'adebisi123@gmail.com',
    facility: 'Downtown pool',
    progress: {
      level: 3,
      module: 2,
      completion: 75
    },
    status: 'completed'
  },
  {
    id: 8,
    name: 'Adebesi Oluchi',
    email: 'adebisi123@gmail.com',
    facility: 'Downtown pool',
    progress: {
      level: 3,
      module: 2,
      completion: 75
    },
    status: 'completed'
  }
];

const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();
  
  const handleStudentClick = (studentId) => {
    navigate(`/students/profile/${studentId}`);
  };
  
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(mockStudents.map(student => student.id));
    }
    setSelectAll(!selectAll);
  };
  
  const toggleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
      setSelectAll(false);
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
      if (selectedStudents.length + 1 === mockStudents.length) {
        setSelectAll(true);
      }
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} />;
      case 'partial':
        return <AlertCircle size={14} />;
      case 'unbooked':
        return <Clock size={14} />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'partial':
        return 'Partial';
      case 'unbooked':
        return 'Unbooked';
      default:
        return '';
    }
  };
  
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <Title>Student Management</Title>
        <ActionButton>
          <Plus size={18} />
          Add Student
        </ActionButton>
      </PageHeader>
      
      <TabNav>
        <Tab to="/students" end>Students</Tab>
        <Tab to="/students/users">Users</Tab>
      </TabNav>
      
      <Routes>
        <Route index element={
          <>
            <SearchFilterContainer>
              <SearchInput>
                <input 
                  type="text" 
                  placeholder="Search students" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={18} />
              </SearchInput>
              <div style={{ position: 'relative' }}>
                <FilterButton onClick={() => setShowFilter(!showFilter)}>
                  <Filter size={18} />
                  Filters
                  <ChevronDown size={14} />
                </FilterButton>
                
                {showFilter && (
                  <FilterDropdown>
                    <FilterSection>
                      <div className="filter-title">Activity</div>
                      <SelectDropdown>
                        <option value="">All activities</option>
                        <option value="swimming">Swimming</option>
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                      </SelectDropdown>
                    </FilterSection>
                    
                    <FilterSection>
                      <div className="filter-title">Facility</div>
                      <SelectDropdown>
                        <option value="">All locations</option>
                        <option value="downtown">Downtown pool</option>
                        <option value="greenspring">Greenspring School</option>
                        <option value="ziggies">Ziggies Lifestyle Arena</option>
                      </SelectDropdown>
                    </FilterSection>
                    
                    <FilterSection>
                      <div className="filter-title">Level</div>
                      <SelectDropdown>
                        <option value="">All levels</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                      </SelectDropdown>
                    </FilterSection>
                    
                    <FilterActions>
                      <button className="reset" onClick={() => setShowFilter(false)}>
                        Reset filter
                      </button>
                      <button className="apply" onClick={() => setShowFilter(false)}>
                        Apply
                      </button>
                    </FilterActions>
                  </FilterDropdown>
                )}
              </div>
            </SearchFilterContainer>
            
            <StudentTable>
              <TableHeader>
                <div className="header-cell checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </div>
                <div className="header-cell">Student</div>
                <div className="header-cell">Facility</div>
                <div className="header-cell">Progress</div>
                <div className="header-cell">Status</div>
                <div className="header-cell actions"></div>
              </TableHeader>
              
              {mockStudents.map(student => (
                <TableRow key={student.id}>
                  <div className="cell checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleSelectStudent(student.id)}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  <div 
                    className="cell student" 
                    onClick={() => handleStudentClick(student.id)}
                  >
                    <div className="avatar">
                      {getInitials(student.name)}
                    </div>
                    <div className="details">
                      <div className="name">{student.name}</div>
                      <div className="email">{student.email}</div>
                    </div>
                  </div>
                  <div className="cell facility">{student.facility}</div>
                  <div className="cell progress">
                    <div className="progress-label">
                      Level {student.progress.level}, Module {student.progress.module}
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-value" 
                        style={{ width: `${student.progress.completion}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="cell status">
                    <div className={`status-badge ${student.status}`}>
                      {getStatusIcon(student.status)}
                      {getStatusText(student.status)}
                    </div>
                  </div>
                  <div className="cell actions">
                    <button className="action-button">
                      <Edit3 size={16} />
                    </button>
                    <button className="action-button">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </TableRow>
              ))}
              
              <Pagination>
                <div className="pagination-info">
                  Page 1 of 20
                </div>
                <div className="pagination-controls">
                  <button className="pagination-button prev" disabled>
                    <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <button className="pagination-button next">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </Pagination>
            </StudentTable>
          </>
        } />
        <Route path="users" element={<StudentManagement />} />
        <Route path="profile/:studentId" element={<StudentProfiles />} />
        <Route path="progress/:studentId" element={<StudentProgress />} />
      </Routes>
    </PageContainer>
  );
};

export default StudentsPage; 