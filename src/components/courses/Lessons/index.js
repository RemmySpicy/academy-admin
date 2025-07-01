import React, { useState, useCallback } from 'react';
import { Plus, Search, Filter, BookOpen } from 'lucide-react';
import ContentContainer from '../../common/ContentContainer';
import LessonsTable from './LessonsTable';

// Sample data for demonstration
const lessonsData = [
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
  const [activeFilter, setActiveFilter] = useState('all');
  const itemsPerPage = 5;

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const toggleMenu = useCallback((lessonId, e) => {
    e?.stopPropagation();
    setOpenMenu(prev => prev === lessonId ? null : lessonId);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(prev => prev === filter ? 'all' : filter);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const filteredLessons = lessonsData.filter(lesson => {
    const matchesSearch = 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      activeFilter === 'all' || 
      lesson.difficulty === activeFilter || 
      lesson.course.toLowerCase().includes(activeFilter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const paginatedLessons = filteredLessons.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleCreateLesson = () => {
    console.log('Create new lesson');
    // TODO: Implement create lesson logic
  };
  
  const handleEditLesson = (lesson) => {
    console.log('Edit lesson:', lesson.id);
    // TODO: Implement edit lesson logic
  };
  
  const handleDeleteLesson = (lesson) => {
    console.log('Delete lesson:', lesson.id);
    // TODO: Implement delete lesson logic
  };
  
  const handleDuplicateLesson = (lesson) => {
    console.log('Duplicate lesson:', lesson.id);
    // TODO: Implement duplicate lesson logic
  };
  
  const handleViewLesson = (lesson) => {
    console.log('View lesson:', lesson.id);
    // TODO: Implement view lesson logic
  };

  const filters = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <ContentContainer
      title="Lessons Management"
      icon={BookOpen}
      badge={`${filteredLessons.length} lessons`}
      showSearch={true}
      searchPlaceholder="Search lessons..."
      searchValue={searchQuery}
      onSearchChange={handleSearch}
      filters={filters}
      activeFilter={activeFilter}
      onFilterChange={handleFilterChange}
      primaryAction={{
        label: 'Create Lesson',
        onClick: handleCreateLesson,
        icon: Plus
      }}
      secondaryActions={[
        { label: 'Import', onClick: () => console.log('Import lessons') },
        { label: 'Export', onClick: () => console.log('Export lessons') }
      ]}
    >
      <LessonsTable
        lessons={paginatedLessons}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLessons.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        openMenu={openMenu}
        onToggleMenu={toggleMenu}
        onEdit={handleEditLesson}
        onDelete={handleDeleteLesson}
        onDuplicate={handleDuplicateLesson}
        onView={handleViewLesson}
      />
    </ContentContainer>
  );
};

export default LessonsManagement;
