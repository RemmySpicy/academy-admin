import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, Waves, Dumbbell, Music, Football } from 'lucide-react';

const SwitcherContainer = styled.div`
  position: relative;
`;

const SwitcherButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    border-color: #cbd5e0;
  }
  
  .academy-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    color: white;
    
    &.swimming {
      background-color: #4299e1;
    }
    
    &.fitness {
      background-color: #48bb78;
    }
    
    &.music {
      background-color: #ed8936;
    }
    
    &.sports {
      background-color: #9f7aea;
    }
  }
  
  .academy-name {
    font-weight: 500;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f7fafc;
  }
  
  .academy-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    color: white;
    
    &.swimming {
      background-color: #4299e1;
    }
    
    &.fitness {
      background-color: #48bb78;
    }
    
    &.music {
      background-color: #ed8936;
    }
    
    &.sports {
      background-color: #9f7aea;
    }
  }
  
  .academy-name {
    font-weight: 500;
  }
`;

const academies = [
  { id: 1, name: 'Swimming Academy', icon: 'swimming', iconComponent: Waves },
  { id: 2, name: 'Fitness Academy', icon: 'fitness', iconComponent: Dumbbell },
  { id: 3, name: 'Music Academy', icon: 'music', iconComponent: Music },
  { id: 4, name: 'Sports Academy', icon: 'sports', iconComponent: Football }
];

const AcademySwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState(academies[0]);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const selectAcademy = (academy) => {
    setSelectedAcademy(academy);
    setIsOpen(false);
  };
  
  const IconComponent = selectedAcademy.iconComponent;
  
  return (
    <SwitcherContainer>
      <SwitcherButton onClick={toggleDropdown}>
        <div className={`academy-icon ${selectedAcademy.icon}`}>
          <IconComponent size={18} />
        </div>
        <span className="academy-name">{selectedAcademy.name}</span>
        <ChevronDown size={16} />
      </SwitcherButton>
      
      {isOpen && (
        <Dropdown>
          {academies.map(academy => {
            const AcademyIcon = academy.iconComponent;
            return (
              <DropdownItem 
                key={academy.id} 
                onClick={() => selectAcademy(academy)}
              >
                <div className={`academy-icon ${academy.icon}`}>
                  <AcademyIcon size={18} />
                </div>
                <span className="academy-name">{academy.name}</span>
              </DropdownItem>
            );
          })}
        </Dropdown>
      )}
    </SwitcherContainer>
  );
};

export default AcademySwitcher; 