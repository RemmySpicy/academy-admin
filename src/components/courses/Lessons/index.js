import React, { useState } from 'react';
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
  ChevronRight,
  ChevronDown,
  AlignLeft,
  Video,
  FileText,
  Users,
  Clock
} from 'lucide-react';
import FeatureContainer from '../../common/FeatureContainer';
import { createFilterDropdowns } from '../../common/FeatureContainer/utils';

const LessonGroup = styled.div`
  margin-bottom: 16px;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  overflow: hidden;
`;

const LessonHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--gray-50);
  cursor: pointer;
  
  .chevron {
    color: var(--gray-500);
    margin-right: 12px;
  }
  
  .title {
    font-weight: 600;
    font-size: 15px;
    color: var(--gray-800);
    flex: 1;
  }
  
  .meta {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: var(--gray-600);
    
    .item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const LessonItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-top: 1px solid var(--gray-200);
  
  &:hover {
    background-color: var(--gray-50);
  }
  
  .lesson-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--primary-light);
    color: var(--primary-color);
    border-radius: var(--border-radius);
    margin-right: 16px;
  }
  
  .lesson-content {
    flex: 1;
    
    .lesson-title {
      font-weight: 500;
      color: var(--gray-800);
      margin-bottom: 4px;
      font-size: 14px;
    }
    
    .lesson-description {
      font-size: 13px;
      color: var(--gray-600);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  
  .lesson-meta {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-right: 12px;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--gray-600);
    }
  }
  
  .actions {
    position: relative;
    
    button {
      background: none;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-600);
      cursor: pointer;
      
      &:hover {
        background-color: var(--gray-100);
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
`;

const FilterPopover = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  width: 320px;
  z-index: 100;
  padding: 16px;
  margin-top: 8px;
  
  .filter-section {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .filter-title {
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--gray-800);
      font-size: 14px;
    }
    
    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  
  .filter-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--gray-200);
    
    button {
      padding: 8px 12px;
      border-radius: var(--border-radius);
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      
      &.reset {
        background: none;
        border: none;
        color: var(--gray-600);
        
        &:hover {
          color: var(--gray-800);
        }
      }
      
      &.apply {
        background-color: var(--primary-color);
        color: white;
        border: none;
        
        &:hover {
          background-color: var(--primary-dark);
        }
      }
    }
  }
`;

const FilterOption = styled.button`
  padding: 6px 12px;
  background-color: ${props => props.active ? 'var(--primary-light)' : 'white'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-600)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--gray-200)'};
  border-radius: var(--border-radius);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-light)' : 'var(--gray-50)'};
    border-color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-300)'};
  }
`;

const FilterButtonWrapper = styled.div`
  position: relative;
`;

// Sample data
const lessons = [
  {
    id: 1,
    title: 'Week 1: Water Orientation',
    description: 'Introduction to water safety, floating, and basic water confidence skills.',
    lessons: [
      {
        id: 101,
        title: 'Lesson 1: Water Entry and Exit',
        description: 'Safely entering and exiting the swimming pool using ladders, steps, and pool edge.',
        type: 'practical',
        duration: '45 min',
        participants: '5-10'
      },
      {
        id: 102,
        title: 'Lesson 2: Floating and Breath Control',
        description: 'Learning to float on back and front, breath holding, and basic submersion.',
        type: 'practical',
        duration: '45 min',
        participants: '5-10'
      },
      {
        id: 103,
        title: 'Lesson 3: Water Movement',
        description: 'Basic arm and leg movements, water displacement, and confidence building.',
        type: 'practical',
        duration: '45 min',
        participants: '5-10'
      }
    ]
  },
  {
    id: 2,
    title: 'Week 2: Fundamental Skills',
    description: 'Building water confidence, submersion, and basic arm and leg movements.',
    lessons: [
      {
        id: 201,
        title: 'Lesson 4: Kicking Techniques',
        description: 'Front and back kick development with and without flotation aids.',
        type: 'practical',
        duration: '45 min',
        participants: '5-10'
      },
      {
        id: 202,
        title: 'Lesson 5: Arm Actions',
        description: 'Introduction to arm strokes for front crawl and backstroke.',
        type: 'practical',
        duration: '45 min',
        participants: '5-10'
      },
      {
        id: 203,
        title: 'Lesson 6: Safety Rules',
        description: 'Understanding pool rules, water safety signs, and emergency procedures.',
        type: 'theory',
        duration: '30 min',
        participants: '10-15'
      }
    ]
  },
  {
    id: 3,
    title: 'Week 3: Stroke Introduction',
    description: 'Introduction to front crawl, backstroke, and rhythmic breathing.',
    lessons: [
      {
        id: 301,
        title: 'Lesson 7: Front Crawl Basics',
        description: 'Arm and leg coordination for front crawl, with flotation support.',
        type: 'practical',
        duration: '45 min',
        participants: '5-10'
      },
      {
        id: 302,
        title: 'Lesson 8: Backstroke Basics',
        description: 'Back floating progression to backstroke with support.',
        type: 'practical',
        duration: '45 min',
        participants: '5-10'
      },
      {
        id: 303,
        title: 'Lesson 9: Breathing Techniques',
        description: 'Rhythmic breathing practice and coordination with arm strokes.',
        type: 'practical',
        duration: '45 min',
        participants: '5-10'
      },
      {
        id: 304,
        title: 'Lesson 10: Video Analysis',
        description: 'Viewing and analyzing swimming techniques with instructor feedback.',
        type: 'video',
        duration: '30 min',
        participants: '10-15'
      }
    ]
  }
];

const LessonsManagement = () => {
  const [expandedGroups, setExpandedGroups] = useState([1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [participantsFilter, setParticipantsFilter] = useState('');
  
  // Temp filters (only applied when "Apply" is clicked)
  const [tempTypeFilter, setTempTypeFilter] = useState('');
  const [tempDurationFilter, setTempDurationFilter] = useState('');
  const [tempParticipantsFilter, setTempParticipantsFilter] = useState('');
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };
  
  const toggleMenu = (lessonId) => {
    if (openMenu === lessonId) {
      setOpenMenu(null);
    } else {
      setOpenMenu(lessonId);
    }
  };

  const toggleFilterPopover = () => {
    setShowFilterPopover(prev => !prev);
    
    // Initialize temp filters with current filters when opening
    if (!showFilterPopover) {
      setTempTypeFilter(typeFilter);
      setTempDurationFilter(durationFilter);
      setTempParticipantsFilter(participantsFilter);
    }
  };
  
  const applyFilters = () => {
    setTypeFilter(tempTypeFilter);
    setDurationFilter(tempDurationFilter);
    setParticipantsFilter(tempParticipantsFilter);
    setShowFilterPopover(false);
  };
  
  const resetFilters = () => {
    setTempTypeFilter('');
    setTempDurationFilter('');
    setTempParticipantsFilter('');
  };

  const clearAllFilters = () => {
    setTypeFilter('');
    setDurationFilter('');
    setParticipantsFilter('');
    setTempTypeFilter('');
    setTempDurationFilter('');
    setTempParticipantsFilter('');
    setShowFilterPopover(false);
  };
  
  const getLessonIcon = (type) => {
    switch (type) {
      case 'theory':
        return <FileText size={20} />;
      case 'video':
        return <Video size={20} />;
      case 'practical':
      default:
        return <AlignLeft size={20} />;
    }
  };
  
  // Filter lessons
  const filteredLessons = lessons.map(group => {
    const filteredItems = group.lessons.filter(lesson => {
      const matchesSearch = 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === '' || lesson.type === typeFilter;
      const matchesDuration = durationFilter === '' || lesson.duration === durationFilter;
      const matchesParticipants = participantsFilter === '' || lesson.participants === participantsFilter;
      
      return matchesSearch && matchesType && matchesDuration && matchesParticipants;
    });
    
    return {
      ...group,
      lessons: filteredItems
    };
  }).filter(group => group.lessons.length > 0);
  
  // Count active filters
  const activeFiltersCount = [typeFilter, durationFilter, participantsFilter].filter(Boolean).length;
  
  // Create the filter options
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'practical', label: 'Practical' },
    { value: 'theory', label: 'Theory' },
    { value: 'video', label: 'Video' }
  ];
  
  const durationOptions = [
    { value: '', label: 'All Durations' },
    { value: '30 min', label: '30 minutes' },
    { value: '45 min', label: '45 minutes' },
    { value: '60 min', label: '60 minutes' }
  ];
  
  const participantsOptions = [
    { value: '', label: 'All Group Sizes' },
    { value: '5-10', label: '5-10 students' },
    { value: '10-15', label: '10-15 students' },
    { value: '15+', label: '15+ students' }
  ];
  
  // Calculate total lessons
  const totalLessons = filteredLessons.reduce((total, group) => total + group.lessons.length, 0);
  
  // Filter Button Component
  const filterButton = (
    <FilterButtonWrapper>
      <button 
        onClick={toggleFilterPopover}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          border: '1px solid var(--gray-300)',
          borderRadius: 'var(--border-radius)',
          backgroundColor: activeFiltersCount > 0 ? 'var(--primary-light)' : 'white',
          color: activeFiltersCount > 0 ? 'var(--primary-color)' : 'var(--gray-600)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        <Filter size={16} />
        Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </button>
      
      {showFilterPopover && (
        <FilterPopover>
          <div className="filter-section">
            <div className="filter-title">Lesson Type</div>
            <div className="filter-options">
              {typeOptions.map(option => (
                <FilterOption 
                  key={`type-${option.value || 'all'}`}
                  active={tempTypeFilter === option.value}
                  onClick={() => setTempTypeFilter(option.value)}
                >
                  {option.label}
                </FilterOption>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <div className="filter-title">Lesson Duration</div>
            <div className="filter-options">
              {durationOptions.map(option => (
                <FilterOption 
                  key={`duration-${option.value || 'all'}`}
                  active={tempDurationFilter === option.value}
                  onClick={() => setTempDurationFilter(option.value)}
                >
                  {option.label}
                </FilterOption>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <div className="filter-title">Group Size</div>
            <div className="filter-options">
              {participantsOptions.map(option => (
                <FilterOption 
                  key={`participants-${option.value || 'all'}`}
                  active={tempParticipantsFilter === option.value}
                  onClick={() => setTempParticipantsFilter(option.value)}
                >
                  {option.label}
                </FilterOption>
              ))}
            </div>
          </div>
          
          <div className="filter-footer">
            <button className="reset" onClick={resetFilters}>Reset</button>
            <button className="apply" onClick={applyFilters}>Apply Filters</button>
          </div>
        </FilterPopover>
      )}
    </FilterButtonWrapper>
  );

  return (
    <FeatureContainer
      title="Lessons Management"
      icon={AlignLeft}
      badge={`${totalLessons} lessons`}
      showSearch={true}
      searchPlaceholder="Search lessons..."
      searchValue={searchQuery}
      onSearchChange={handleSearch}
      customFilterComponent={filterButton}
      primaryAction={{
        label: 'Create Lesson',
        icon: Plus,
        onClick: () => console.log('Create lesson')
      }}
      secondaryActions={[
        { label: 'Import Lessons', onClick: () => console.log('Import lessons') }
      ]}
      showPagination={true}
      paginationInfo={`Showing ${totalLessons} lessons`}
      currentPage={1}
      totalPages={1}
      onPageChange={() => {}}
    >
      {filteredLessons.length > 0 ? (
        filteredLessons.map(group => (
          <LessonGroup key={group.id}>
            <LessonHeader onClick={() => toggleGroup(group.id)}>
              {expandedGroups.includes(group.id) ? (
                <ChevronDown className="chevron" size={18} />
              ) : (
                <ChevronRight className="chevron" size={18} />
              )}
              <div className="title">{group.title}</div>
              <div className="meta">
                <div className="item">{group.lessons.length} lessons</div>
              </div>
            </LessonHeader>
            
            {expandedGroups.includes(group.id) && group.lessons.map(lesson => (
              <LessonItem key={lesson.id}>
                <div className="lesson-icon">
                  {getLessonIcon(lesson.type)}
                </div>
                <div className="lesson-content">
                  <div className="lesson-title">{lesson.title}</div>
                  <div className="lesson-description">{lesson.description}</div>
                </div>
                <div className="lesson-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    {lesson.duration}
                  </div>
                  <div className="meta-item">
                    <Users size={14} />
                    {lesson.participants}
                  </div>
                </div>
                <div className="actions">
                  <button onClick={() => toggleMenu(lesson.id)}>
                    <MoreVertical size={16} />
                  </button>
                  {openMenu === lesson.id && (
                    <div className="dropdown">
                      <div className="dropdown-item" onClick={() => console.log('View lesson', lesson.id)}>
                        <Eye size={16} />
                        <span>View</span>
                      </div>
                      <div className="dropdown-item" onClick={() => console.log('Edit lesson', lesson.id)}>
                        <Edit size={16} />
                        <span>Edit</span>
                      </div>
                      <div className="dropdown-item" onClick={() => console.log('Duplicate lesson', lesson.id)}>
                        <Copy size={16} />
                        <span>Duplicate</span>
                      </div>
                      <div className="dropdown-item danger" onClick={() => console.log('Delete lesson', lesson.id)}>
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </div>
                    </div>
                  )}
                </div>
              </LessonItem>
            ))}
          </LessonGroup>
        ))
      ) : (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--gray-500)' }}>
          No lessons found matching your filters.
          {activeFiltersCount > 0 && (
            <div style={{ marginTop: '12px' }}>
              <button 
                onClick={clearAllFilters}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--gray-100)',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--gray-700)',
                  cursor: 'pointer'
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </FeatureContainer>
  );
};

export default LessonsManagement; 