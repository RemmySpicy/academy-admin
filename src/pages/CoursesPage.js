import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { BookOpen, Layers, BookOpenCheck } from 'lucide-react';
import CourseManagement from '../components/courses/Management';
import CourseCreate2 from '../components/courses/Create2';
import CourseDetails from '../components/courses/Details';
import CurriculumBuilder from '../components/courses/Curriculum';
import LessonsManagement from '../components/courses/Lessons';

const Container = styled.div`
  padding: 20px 0;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--gray-200);
`;

const Tab = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: ${props => props.active === 'true' ? 'var(--primary-color)' : 'var(--gray-600)'};
  font-weight: ${props => props.active === 'true' ? '600' : '500'};
  border-bottom: 2px solid ${props => props.active === 'true' ? 'var(--primary-color)' : 'transparent'};
  transition: all 0.2s;
  text-decoration: none;
  
  &:hover {
    color: ${props => props.active === 'true' ? 'var(--primary-color)' : 'var(--gray-800)'};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const CoursesPage = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <Container>
      <TabsContainer>
        <Tab to="/courses" active={isActive('/courses') && !isActive('/courses/curriculum') && !isActive('/courses/lessons') ? 'true' : 'false'}>
          <BookOpen />
          Courses
        </Tab>
        <Tab to="/courses/curriculum" active={isActive('/courses/curriculum') ? 'true' : 'false'}>
          <Layers />
          Curricula
        </Tab>
        <Tab to="/courses/lessons" active={isActive('/courses/lessons') ? 'true' : 'false'}>
          <BookOpenCheck />
          Lessons
        </Tab>
      </TabsContainer>
      
      <Routes>
        <Route path="/" element={<CourseManagement />} />
        <Route path="/create" element={<CourseCreate2 />} />
        <Route path="/edit/:courseId" element={<CourseCreate2 />} />
        <Route path="/details/:courseId" element={<CourseDetails />} />
        <Route path="/curriculum/*" element={<CurriculumBuilder />} />
        <Route path="/lessons" element={<LessonsManagement />} />
      </Routes>
    </Container>
  );
};

export default CoursesPage; 