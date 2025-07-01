import React from 'react';
import styled from 'styled-components';
import { BookOpen, Clock, Tag, MoreVertical, Edit, Trash2, Copy, Eye } from 'lucide-react';

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

const LessonsTable = ({ 
  lessons, 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  openMenu, 
  onToggleMenu,
  onEdit,
  onDelete,
  onDuplicate,
  onView
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  
  return (
    <>
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
            {lessons.map(lesson => (
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
                    <button onClick={(e) => onToggleMenu(lesson.id, e)}>
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === lesson.id && (
                      <div className="dropdown">
                        <div className="dropdown-item" onClick={() => onView(lesson)}>
                          <Eye size={16} />
                          <span>View</span>
                        </div>
                        <div className="dropdown-item" onClick={() => onEdit(lesson)}>
                          <Edit size={16} />
                          <span>Edit</span>
                        </div>
                        <div className="dropdown-item" onClick={() => onDuplicate(lesson)}>
                          <Copy size={16} />
                          <span>Duplicate</span>
                        </div>
                        <div className="dropdown-item danger" onClick={() => onDelete(lesson)}>
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
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} lessons
        </div>
        <div className="pagination-controls">
          <button 
            onClick={() => onPageChange(1)} 
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          <button 
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))} 
            disabled={currentPage === 1}
          >
            &lsaquo;
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            if (
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button 
                  key={pageNumber}
                  className={currentPage === pageNumber ? 'active' : ''}
                  onClick={() => onPageChange(pageNumber)}
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
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} 
            disabled={currentPage === totalPages}
          >
            &rsaquo;
          </button>
          <button 
            onClick={() => onPageChange(totalPages)} 
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </div>
      </Pagination>
    </>
  );
};

export default LessonsTable;
