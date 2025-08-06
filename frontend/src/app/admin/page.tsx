'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  Calendar,
  MapPin,
  Settings,
  GraduationCap,
  TrendingUp,
  Activity,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/components/providers/AppStateProvider';
import { usePageTitle } from '@/hooks/usePageTitle';

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  roles?: ('admin' | 'manager')[];
}

const mockStats: StatCard[] = [
  {
    title: 'Total Students',
    value: '1,247',
    description: '+12% from last month',
    icon: GraduationCap,
    trend: 'up'
  },
  {
    title: 'Active Sessions',
    value: '84',
    description: 'This week',
    icon: Activity
  },
  {
    title: 'Attendance Rate',
    value: '92.5%',
    description: '+2.1% from last week',
    icon: UserCheck,
    trend: 'up'
  },
  {
    title: 'Revenue',
    value: '$45,231',
    description: '+19% from last month',
    icon: TrendingUp,
    trend: 'up'
  }
];

const quickActions: QuickAction[] = [
  {
    title: 'Manage Students',
    description: 'View and manage student profiles, enrollment, and progress',
    href: '/admin/students',
    icon: GraduationCap,
    color: 'bg-blue-500'
  },
  {
    title: 'Courses Management',
    description: 'Build and organize courses, curricula, and content',
    href: '/admin/courses',
    icon: BookOpen,
    color: 'bg-green-500'
  },
  {
    title: 'Schedule Sessions',
    description: 'Create and manage class schedules and bookings',
    href: '/admin/scheduling',
    icon: Calendar,
    color: 'bg-purple-500'
  },
  {
    title: 'Facility Management',
    description: 'Manage academy facilities and equipment operations',
    href: '/admin/facilities',
    icon: MapPin,
    color: 'bg-orange-500'
  },
  {
    title: 'Settings',
    description: 'Configure system settings and preferences',
    href: '/admin/settings',
    icon: Settings,
    color: 'bg-gray-500'
  }
];

export default function AdminDashboard() {
  usePageTitle('Dashboard', 'Academy management overview and quick actions');
  const { user } = useAuth();

  // Filter quick actions based on user role
  const filteredActions = quickActions.filter(action => {
    if (!action.roles) return true;
    return action.roles.includes(user?.role as any);
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening at your academy today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={action.href}>
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and actions in your academy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-muted-foreground">
                New student enrolled in Swimming Program - <span className="font-medium">Sarah Johnson</span>
              </p>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-muted-foreground">
                Schedule updated for Basketball Program - <span className="font-medium">Monday sessions</span>
              </p>
              <span className="text-xs text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-muted-foreground">
                New curriculum level added - <span className="font-medium">Swimming Level 3</span>
              </p>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}