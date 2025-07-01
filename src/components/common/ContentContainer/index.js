import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Search, Filter, Plus } from 'lucide-react';

// ======================
// Styled Components
// ======================

const Container = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  
  .title-container {
    display: flex;
    align-items: center;
    gap: 12px;
    
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      color: var(--gray-900);
    }
    
    .badge {
      background-color: var(--gray-100);
      color: var(--gray-600);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
  }
  
  .actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

const FilterBar = styled.div`
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
    min-width: 250px;
    
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
      transition: all 0.2s;
      
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
  
  .filter-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const FilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  background-color: white;
  border: 1px solid var(--gray-300);
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--gray-100);
    border-color: var(--gray-400);
  }
  
  &.active {
    background-color: var(--primary-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${({ $noPadding }) => ($noPadding ? '0' : '24px')};
  ${({ $customPadding }) => $customPadding && `padding: ${$customPadding};`}
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background-color: var(--gray-50);
`;

// ======================
// Main Component
// ======================

const ContentContainer = ({
  // Header props
  title,
  badge,
  icon: Icon,
  
  // Action buttons
  primaryAction,
  secondaryActions = [],
  
  // Search and filters
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  
  // Filter buttons
  filters = [],
  activeFilter,
  onFilterChange,
  
  // Content
  children,
  noPadding = false,
  customPadding,
  
  // Footer content
  footerContent,
  
  // Other
  className,
}) => {
  return (
    <Container className={className}>
      {/* Header Section */}
      <Header>
        <div className="title-container">
          {Icon && <Icon size={24} />}
          <h1>{title}</h1>
          {badge && <span className="badge">{badge}</span>}
        </div>
        
        <div className="actions">
          {secondaryActions.map((action, index) => (
            <FilterButton
              key={`action-${index}`}
              onClick={action.onClick}
              className={action.active ? 'active' : ''}
            >
              {action.icon && <action.icon size={16} />}
              {action.label}
            </FilterButton>
          ))}
          
          {primaryAction && (
            <FilterButton
              onClick={primaryAction.onClick}
              className="primary"
              style={{ 
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
              }}
            >
              {primaryAction.icon && <primaryAction.icon size={16} />}
              {primaryAction.label}
            </FilterButton>
          )}
        </div>
      </Header>
      
      {/* Filter Bar */}
      {(showSearch || filters.length > 0) && (
        <FilterBar>
          {showSearch && (
            <div className="search-container">
              <Search size={16} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}
          
          {filters.length > 0 && (
            <div className="filter-actions">
              {filters.map((filter) => (
                <FilterButton
                  key={filter.id}
                  className={activeFilter === filter.id ? 'active' : ''}
                  onClick={() => onFilterChange?.(filter.id)}
                >
                  {filter.icon && <filter.icon size={16} />}
                  {filter.label}
                </FilterButton>
              ))}
            </div>
          )}
        </FilterBar>
      )}
      
      {/* Main Content */}
      <Content $noPadding={noPadding} $customPadding={customPadding}>
        {children}
      </Content>
      
      {/* Footer */}
      {footerContent && <Footer>{footerContent}</Footer>}
    </Container>
  );
};

// ======================
// Prop Types
// ======================

ContentContainer.propTypes = {
  // Header props
  title: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.elementType,
  
  // Action buttons
  primaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.elementType,
  }),
  secondaryActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.elementType,
      active: PropTypes.bool,
    })
  ),
  
  // Search and filters
  showSearch: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  
  // Filter buttons
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    })
  ),
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func,
  
  // Content
  children: PropTypes.node.isRequired,
  noPadding: PropTypes.bool,
  customPadding: PropTypes.string,
  
  // Footer content
  footerContent: PropTypes.node,
  
  // Other
  className: PropTypes.string,
};

export default ContentContainer;
