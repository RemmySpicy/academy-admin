import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Calendar, 
  UserCog,
  Building2, 
  CreditCard, 
  MessageSquare, 
  Shield, 
  Settings,
  LogOut
} from 'lucide-react';

const NavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 20px 0;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  
  svg {
    margin-right: 12px;
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
    font-weight: 500;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: auto;
  text-align: left;
  width: 100%;
  
  svg {
    margin-right: 12px;
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Navigation = ({ currentAcademy, setCurrentAcademy }) => {
  return (
    <NavContainer>
      <NavSection>
        <NavItem to="/" end>
          <LayoutDashboard /> Overview
        </NavItem>
        <NavItem to="/courses">
          <GraduationCap /> Courses
        </NavItem>
        <NavItem to="/students">
          <Users /> Students
        </NavItem>
        <NavItem to="/scheduling">
          <Calendar /> Schedules
        </NavItem>
        <NavItem to="/employees">
          <UserCog /> Employees
        </NavItem>
        <NavItem to="/facilities">
          <Building2 /> Facilities
        </NavItem>
        <NavItem to="/payments">
          <CreditCard /> Payments
        </NavItem>
        <NavItem to="/communications">
          <MessageSquare /> Communications
        </NavItem>
        <NavItem to="/safety">
          <Shield /> Safety
        </NavItem>
        <NavItem to="/settings">
          <Settings /> Settings
        </NavItem>
      </NavSection>
      
      <LogoutButton onClick={() => console.log("Logout clicked")}>
        <LogOut /> Log out
      </LogoutButton>
    </NavContainer>
  );
};

export default Navigation; 