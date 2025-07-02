import React from 'react';
import styled from 'styled-components';
import { Search, Filter } from 'lucide-react';

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
    display: flex;
    align-items: center;
    gap: 12px;
    
    svg {
      color: var(--primary-color);
    }
    
    .badge {
      font-size: 0.9rem;
      font-weight: 500;
      background-color: var(--gray-100);
      color: var(--gray-600);
      padding: 4px 8px;
      border-radius: var(--border-radius);
      margin-left: 8px;
    }
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
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
  
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
  
  &.danger {
    background-color: white;
    color: var(--danger-color);
    border: 1px solid var(--danger-color);
    
    &:hover {
      background-color: var(--danger-color);
      color: white;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
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
`;

const Content = styled.div`
  padding: ${props => props.noPadding ? '0' : '24px'};
  ${props => props.customPadding && `padding: ${props.customPadding};`}
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid var(--gray-200);
  
  .pagination-info {
    color: var(--gray-600);
    font-size: 0.9rem;
  }
  
  .pagination-controls {
    display: flex;
    gap: 8px;
    
    button {
      width: 36px;
      height: 36px;
      border: 1px solid var(--gray-200);
      border-radius: var(--border-radius);
      background: white;
      color: var(--gray-700);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover:not(:disabled) {
        background: var(--gray-50);
        border-color: var(--gray-300);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
      }
    }
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
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--gray-100);
  }
  
  &.active {
    background-color: var(--primary-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  overflow: hidden;
  
  button {
    padding: 8px 16px;
    border: none;
    background: white;
    color: var(--gray-600);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: var(--gray-50);
    }
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
    
    &:not(:last-child) {
      border-right: 1px solid var(--gray-200);
    }
  }
`;

const FeatureContainer = ({
  // Header props
  title,
  icon: Icon,
  badge,
  
  // Action buttons
  primaryAction,
  secondaryActions = [],
  
  // Search and filtering
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  
  // Custom filter components
  customFilterComponent,
  
  // Content
  children,
  noPadding = false,
  customPadding = null,
  
  // Pagination
  showPagination = false,
  paginationInfo,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  
  // View toggle
  viewToggle = null
}) => {
  return (
    <Container>
      {/* Header */}
      <Header>
        <h1>
          {Icon && <Icon size={24} />}
          {title}
          {badge && <span className="badge">{badge}</span>}
        </h1>
        <div className="actions">
          {secondaryActions.map((action, index) => (
            <Button 
              key={`secondary-action-${index}`}
              className="secondary"
              onClick={action.onClick}
              disabled={action.disabled}
              as={action.as}
              to={action.to}
            >
              {action.icon && React.createElement(action.icon, { size: 16 })}
              {action.label}
            </Button>
          ))}
          
          {primaryAction && (
            <Button 
              className="primary"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              as={primaryAction.as}
              to={primaryAction.to}
            >
              {primaryAction.icon && React.createElement(primaryAction.icon, { size: 16 })}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </Header>
      
      {/* Filters */}
      {(showSearch || customFilterComponent || viewToggle) && (
        <Filters>
          {showSearch && (
            <div className="search-container">
              <Search size={16} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearchChange}
              />
            </div>
          )}
          
          {customFilterComponent}
          
          {viewToggle}
        </Filters>
      )}
      
      {/* Main content */}
      <Content noPadding={noPadding} customPadding={customPadding}>
        {children}
      </Content>
      
      {/* Pagination */}
      {showPagination && (
        <Pagination>
          <div className="pagination-info">
            {paginationInfo}
          </div>
          <div className="pagination-controls">
            <button 
              disabled={currentPage === 1} 
              onClick={() => onPageChange(currentPage - 1)}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={`page-${page}`}
                className={currentPage === page ? 'active' : ''}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </Pagination>
      )}
    </Container>
  );
};

export default FeatureContainer; 