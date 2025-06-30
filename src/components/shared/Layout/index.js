import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Shield, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Building, 
  User,
  Bell
} from 'lucide-react';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: ${props => props.collapsed ? '80px' : '260px'};
  background-color: #fff;
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 50;
  box-shadow: var(--shadow);
  
  @media (max-width: 768px) {
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    width: 260px;
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.collapsed ? '24px 0' : '24px'};
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'space-between'};
  border-bottom: 1px solid var(--gray-200);
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    
    img {
      width: 32px;
      height: 32px;
    }
    
    h1 {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-color);
      margin: 0;
      display: ${props => props.collapsed ? 'none' : 'block'};
    }
  }
  
  .toggle-btn {
    background: none;
    border: none;
    color: var(--gray-500);
    cursor: pointer;
    display: ${props => props.collapsed ? 'none' : 'block'};
    
    &:hover {
      color: var(--gray-700);
    }
  }
`;

const SidebarNav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
`;

const NavSection = styled.div`
  margin-bottom: 24px;
  
  .section-title {
    padding: ${props => props.collapsed ? '0 0 8px 0' : '0 24px 8px 24px'};
    font-size: 12px;
    font-weight: 500;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: ${props => props.collapsed ? 'none' : 'block'};
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

const NavItem = styled.li`
  margin: 2px 0;
  
  a {
    display: flex;
    align-items: center;
    padding: ${props => props.collapsed ? '12px 0' : '12px 24px'};
    color: ${props => props.isActive ? 'var(--primary-color)' : 'var(--gray-700)'};
    font-weight: ${props => props.isActive ? '500' : 'normal'};
    transition: all 0.2s;
    position: relative;
    justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
    
    &:hover {
      background-color: var(--gray-100);
      color: var(--primary-color);
    }
    
    ${props => props.isActive && `
      background-color: var(--gray-100);
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 3px;
        background-color: var(--primary-color);
      }
    `}
    
    svg {
      min-width: 20px;
    }
    
    span {
      margin-left: 12px;
      display: ${props => props.collapsed ? 'none' : 'inline'};
    }
  }
`;

const SidebarFooter = styled.div`
  padding: ${props => props.collapsed ? '16px 0' : '16px 24px'};
  border-top: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--primary-light);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    
    .user-details {
      display: ${props => props.collapsed ? 'none' : 'block'};
      
      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--gray-800);
      }
      
      .user-role {
        font-size: 12px;
        color: var(--gray-500);
      }
    }
  }
`;

const Content = styled.div`
  flex: 1;
  margin-left: ${props => props.sidebarWidth};
  transition: margin-left 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Header = styled.header`
  background-color: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: var(--shadow-sm);
  
  .left-section {
    display: flex;
    align-items: center;
    
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--gray-700);
      margin-right: 16px;
      cursor: pointer;
      
      @media (max-width: 768px) {
        display: block;
      }
    }
  }
  
  .right-section {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .notifications {
      position: relative;
      cursor: pointer;
      
      .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 18px;
        height: 18px;
        background-color: var(--danger-color);
        color: white;
        border-radius: 50%;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
    }
  }
`;

const Main = styled.main`
  padding: 24px;
  background-color: var(--gray-50);
  min-height: calc(100vh - 65px);
`;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const sidebarWidth = collapsed ? '80px' : '260px';
  
  const isActiveRoute = (path) => {
    return location.pathname.startsWith(path);
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Students', path: '/students', icon: <Users size={20} /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
    { name: 'Employees', path: '/employees', icon: <User size={20} /> },
    { name: 'Facilities', path: '/facilities', icon: <Building size={20} /> },
    { name: 'Scheduling', path: '/scheduling', icon: <Calendar size={20} /> },
    { name: 'Payments', path: '/payments', icon: <DollarSign size={20} /> },
    { name: 'Safety', path: '/safety', icon: <Shield size={20} /> },
    { name: 'Communications', path: '/communications', icon: <MessageSquare size={20} /> },
  ];
  
  return (
    <LayoutContainer>
      <Sidebar collapsed={collapsed} isOpen={mobileOpen}>
        <SidebarHeader collapsed={collapsed}>
          <div className="logo">
            <img src="/logo.png" alt="Logo" />
            <h1>AquaAdmin</h1>
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </SidebarHeader>
        
        <SidebarNav>
          <NavSection collapsed={collapsed}>
            <div className="section-title">Main Navigation</div>
            <ul>
              {navItems.map((item) => (
                <NavItem 
                  key={item.path} 
                  isActive={item.path === '/' ? location.pathname === '/' : isActiveRoute(item.path)}
                  collapsed={collapsed}
                >
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </NavItem>
              ))}
            </ul>
          </NavSection>
          
          <NavSection collapsed={collapsed}>
            <div className="section-title">System</div>
            <ul>
              <NavItem collapsed={collapsed}>
                <Link to="/settings">
                  <Settings size={20} />
                  <span>Settings</span>
                </Link>
              </NavItem>
              <NavItem collapsed={collapsed}>
                <Link to="/logout">
                  <LogOut size={20} />
                  <span>Log Out</span>
                </Link>
              </NavItem>
            </ul>
          </NavSection>
        </SidebarNav>
        
        <SidebarFooter collapsed={collapsed}>
          <div className="user-info">
            <div className="avatar">JD</div>
            <div className="user-details">
              <div className="user-name">John Doe</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <Content sidebarWidth={sidebarWidth}>
        <Header>
          <div className="left-section">
            <button className="menu-toggle" onClick={toggleMobileSidebar}>
              <Menu size={24} />
            </button>
          </div>
          
          <div className="right-section">
            <div className="notifications">
              <Bell size={20} />
              <div className="badge">3</div>
            </div>
          </div>
        </Header>
        
        <Main>
          {children}
        </Main>
      </Content>
    </LayoutContainer>
  );
};

export default Layout; 