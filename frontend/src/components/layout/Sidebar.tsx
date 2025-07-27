'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  Settings,
  GraduationCap,
  UserCheck,
  CreditCard,
  Building,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  TestTube
} from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks';
import { useProgramContextHooks } from '@/store';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('super_admin' | 'program_admin' | 'program_coordinator' | 'instructor')[];
  children?: NavItem[];
  onClick?: () => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles?: ('super_admin' | 'program_admin' | 'program_coordinator' | 'instructor')[];
  collapsible?: boolean;
}

const navigationSections: NavSection[] = [
  // Main Navigation - Available to all roles
  {
    title: '',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard
      },
      {
        title: 'Students',
        href: '/admin/students',
        icon: GraduationCap
      },
      {
        title: 'Courses',
        href: '/admin/courses',
        icon: BookOpen
      },
      {
        title: 'Facilities',
        href: '/admin/facilities',
        icon: MapPin
      },
      {
        title: 'Scheduling',
        href: '/admin/scheduling',
        icon: Calendar
      },
      {
        title: 'Team',
        href: '/admin/team',
        icon: UserCheck
      },
      {
        title: 'Partners',
        href: '/admin/partners',
        icon: Building2,
        roles: ['super_admin', 'program_admin']
      },
      {
        title: 'Payments',
        href: '/admin/payments',
        icon: CreditCard
      }
    ]
  },
  
  // Academy Administration - Super Admin Only
  {
    title: '',
    roles: ['super_admin'],
    items: [
      {
        title: 'Academy Admin',
        href: '/admin/academy/programs',
        icon: Building
      }
    ]
  },
  
  // Settings and Test - Available to all roles
  {
    title: '',
    items: [
      {
        title: 'Test Page',
        href: '/admin/test',
        icon: TestTube
      },
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings
      }
    ]
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { currentProgram } = useProgramContextHooks();

  // Filter sections and items based on user role
  const filteredSections = navigationSections.map(section => {
    // Filter section level
    if (section.roles && !section.roles.includes(user?.role as any)) {
      return null;
    }
    
    // Filter items within section
    const filteredItems = section.items.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(user?.role as any);
    });
    
    return {
      ...section,
      items: filteredItems
    };
  }).filter(Boolean) as NavSection[];

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = item.href && (pathname === item.href || 
      (item.href !== '/admin' && pathname.startsWith(item.href)));

    if (item.onClick) {
      return (
        <button
          key={item.title}
          onClick={item.onClick}
          className={cn(
            "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left",
            "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
          title={isCollapsed ? item.title : undefined}
        >
          <Icon
            className={cn(
              "h-5 w-5 flex-shrink-0",
              "text-gray-400 group-hover:text-gray-600"
            )}
          />
          {!isCollapsed && (
            <span className="ml-3 truncate">{item.title}</span>
          )}
        </button>
      );
    }

    if (!item.href) return null;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        )}
        title={isCollapsed ? item.title : undefined}
      >
        <Icon
          className={cn(
            "h-5 w-5 flex-shrink-0",
            isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"
          )}
        />
        {!isCollapsed && (
          <span className="ml-3 truncate">{item.title}</span>
        )}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900">Academy Admin</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Program Context Display */}
      {currentProgram && !isCollapsed && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">
              {currentProgram.name}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {filteredSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="space-y-1">
              {section.items.map((item) => renderNavItem(item))}
            </div>
            {/* Add separator between sections when collapsed */}
            {isCollapsed && sectionIndex < filteredSections.length - 1 && (
              <div className="border-t border-gray-200 my-4"></div>
            )}
          </div>
        ))}
        
        {/* Logout button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
            {!isCollapsed && (
              <span className="ml-3 truncate">Logout</span>
            )}
          </button>
        </div>
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user.first_name[0]}{user.last_name[0] || ''}
              </span>
            </div>
            {!isCollapsed && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role === 'super_admin' ? 'Super Admin' : 
                   user.role === 'program_admin' ? 'Program Admin' :
                   user.role === 'program_coordinator' ? 'Program Coordinator' :
                   user.role === 'instructor' ? 'Tutor' : 'User'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}