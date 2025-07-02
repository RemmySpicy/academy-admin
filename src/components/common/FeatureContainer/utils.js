import React from 'react';
import styled from 'styled-components';

// Styled components for building custom filters
export const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

export const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const FilterButton = styled.button`
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
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Helper functions to create common filter components
export const createViewToggle = (viewMode, setViewMode, options) => {
  return (
    <div style={{ marginLeft: 'auto', display: 'flex' }}>
      <div
        style={{
          display: 'flex',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--border-radius)',
          overflow: 'hidden',
        }}
      >
        {options.map(option => (
          <button
            key={option.value}
            className={viewMode === option.value ? 'active' : ''}
            onClick={() => setViewMode(option.value)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: viewMode === option.value ? 'var(--primary-color)' : 'white',
              color: viewMode === option.value ? 'white' : 'var(--gray-600)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRight: option !== options[options.length - 1] ? '1px solid var(--gray-200)' : 'none',
            }}
          >
            {option.icon && React.createElement(option.icon, { size: 16 })}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const createFilterDropdowns = (filters) => {
  return (
    <FilterGroup>
      {filters.map((filter, index) => (
        <FilterSelect
          key={`filter-${index}`}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
        >
          {filter.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>
      ))}
    </FilterGroup>
  );
};

export const createFilterButtons = (filterState, toggleFilter, filters) => {
  return (
    <FilterGroup>
      {filters.map((filter, index) => (
        <FilterButton
          key={`filter-button-${index}`}
          className={filterState.includes(filter.value) ? 'active' : ''}
          onClick={() => toggleFilter(filter.value)}
        >
          {filter.icon && React.createElement(filter.icon, { size: 16 })}
          {filter.label}
        </FilterButton>
      ))}
    </FilterGroup>
  );
};

// Utility function for pagination
export const createPaginationInfo = (currentPage, pageSize, totalItems) => {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  
  return `Showing ${start}-${end} of ${totalItems} items`;
}; 