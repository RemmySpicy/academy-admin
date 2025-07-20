'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Users, 
  UserCheck, 
  User as UserIcon, 
  UserPlus,
  Calendar,
  Mail,
  Globe,
  Settings
} from 'lucide-react';
import { User } from '@/lib/api/types';

interface UserViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onEdit?: () => void;
  onManagePrograms?: () => void;
}

export function UserViewDialog({ 
  open, 
  onOpenChange, 
  user, 
  onEdit, 
  onManagePrograms 
}: UserViewDialogProps) {
  
  const getUserRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'program_admin':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'program_coordinator':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'instructor':
        return <UserCheck className="h-5 w-5 text-orange-600" />;
      case 'student':
        return <UserIcon className="h-5 w-5 text-purple-600" />;
      case 'parent':
        return <UserPlus className="h-5 w-5 text-indigo-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      super_admin: 'Super Admin',
      program_admin: 'Program Admin',
      program_coordinator: 'Program Coordinator',
      instructor: 'Instructor',
      student: 'Student',
      parent: 'Parent'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'program_admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'program_coordinator':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'instructor':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'student':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'parent':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-600">
                {user.full_name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="text-xl font-semibold">{user.full_name}</div>
              <div className="text-sm text-gray-500">@{user.username}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detailed user information and system access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <div className="text-sm font-medium">{user.full_name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Username</Label>
                  <div className="text-sm font-medium">@{user.username}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">User ID</Label>
                  <div className="text-sm font-mono text-gray-600">{user.id}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role and Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Role & Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Current Role</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getUserRoleIcon(user.role)}
                    <Badge variant="outline" className={getRoleColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                  <div className="mt-1">
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Program Assignments</span>
              </CardTitle>
              <CardDescription>
                Programs this user has access to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.program_assignments && user.program_assignments.length > 0 ? (
                <div className="space-y-2">
                  {user.program_assignments.map((assignment, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{assignment.program_name}</div>
                        {assignment.role && (
                          <div className="text-sm text-gray-500">
                            Role: {getRoleDisplayName(assignment.role)}
                          </div>
                        )}
                      </div>
                      {assignment.is_active !== undefined && (
                        <Badge variant={assignment.is_active ? "default" : "secondary"}>
                          {assignment.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {onManagePrograms && (
                    <Button
                      variant="outline" 
                      size="sm" 
                      onClick={onManagePrograms}
                      className="w-full mt-2"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Program Assignments
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <div>No program assignments</div>
                  {onManagePrograms && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onManagePrograms}
                      className="mt-2"
                    >
                      Assign to Programs
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Account Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Account Created</Label>
                  <div className="text-sm">{new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                  <div className="text-sm">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Never'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              <Settings className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for labels
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium ${className || ''}`} {...props}>
      {children}
    </label>
  );
}