'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeamMembers, useTeamStats, useRemoveTeamMember, useUpdateTeamMember } from '@/features/teams/hooks';
import type { TeamMember, TeamStats } from '@/features/teams/api';
import { AddTeamMemberDialog } from './AddTeamMemberDialog';

/**
 * Team Management Component
 * 
 * Manage program team members, roles, and assignments
 */
export function TeamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Use team hooks with program context
  const { data: teamMembersResponse, isLoading: loading, error: queryError, refetch: refetchTeamMembers } = useTeamMembers();
  const { data: teamStatsResponse, isLoading: statsLoading, error: statsError } = useTeamStats();
  const removeTeamMember = useRemoveTeamMember();
  const updateTeamMember = useUpdateTeamMember();

  // Extract data from responses
  const teamMembers = teamMembersResponse?.items || [];
  const teamStats = teamStatsResponse || null;
  const error = queryError?.message || null;

  // No more manual loading - hooks handle everything automatically with program context!

  const handleRemoveTeamMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      await removeTeamMember.mutateAsync(userId);
      // No need to manually reload - hooks handle it automatically!
    } catch (err: any) {
      console.error('Error removing team member:', err);
      alert(`Failed to remove team member: ${err.message || 'Please try again.'}`);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'program_admin':
        return 'destructive';
      case 'program_coordinator':
        return 'default';
      case 'tutor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'program_admin':
        return 'Program Admin';
      case 'program_coordinator':
        return 'Coordinator';
      case 'tutor':
        return 'Tutor';
      case 'super_admin':
        return 'Super Admin';
      case 'parent':
        return 'Parent';
      case 'student':
        return 'Student';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Stats Overview */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Total Members</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{teamStats.total_members}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Active Members</h3>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{teamStats.active_members}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Program Admins</h3>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{teamStats.by_role.program_admin || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Tutors</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{teamStats.by_role.tutor || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Management Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Team Members</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Roles & Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center space-x-2">
            <UserX className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Program Team Members</CardTitle>
                  <CardDescription>
                    View and manage all team members in your program
                  </CardDescription>
                </div>
                <AddTeamMemberDialog onTeamMemberAdded={() => refetchTeamMembers()} />
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="program_admin">Program Admin</SelectItem>
                    <SelectItem value="program_coordinator">Coordinator</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading team members...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-8">
                  <div className="text-red-500">{error}</div>
                  <Button onClick={() => refetchTeamMembers()} className="mt-4">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Team Members List */}
              {!loading && !error && (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.first_name[0]}{member.last_name?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.first_name} {member.last_name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                            {member.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Joined: {new Date(member.assigned_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={member.is_active ? 'default' : 'secondary'}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={getRoleBadgeVariant(member.primary_role) as any}>
                          {getRoleDisplayName(member.primary_role)}
                        </Badge>
                        {member.is_default_program && (
                          <Badge variant="outline">Default</Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRemoveTeamMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  
                  {teamMembers.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No team members found</p>
                      <p className="text-sm mt-2">Add team members to start collaborating</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Overview of roles and their permissions within the program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Program Admin</CardTitle>
                        <Badge variant="destructive">Admin</Badge>
                      </div>
                      <CardDescription>Full program management access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        <li>• Manage students and parents</li>
                        <li>• Edit curriculum and courses</li>
                        <li>• Schedule classes and facilities</li>
                        <li>• Manage team members</li>
                        <li>• View payments and reports</li>
                        <li>• Full program administration</li>
                      </ul>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Count: {teamStats?.by_role.program_admin || 0} members
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Program Coordinator</CardTitle>
                        <Badge variant="default">Coordinator</Badge>
                      </div>
                      <CardDescription>Operational program support</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        <li>• View and manage students</li>
                        <li>• View curriculum content</li>
                        <li>• Manage schedules</li>
                        <li>• View team information</li>
                        <li>• Student progress tracking</li>
                        <li>• Limited administrative access</li>
                      </ul>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Count: {teamStats?.by_role.program_coordinator || 0} members
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Tutor</CardTitle>
                        <Badge variant="secondary">Tutor</Badge>
                      </div>
                      <CardDescription>Teaching and student interaction</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        <li>• View assigned students</li>
                        <li>• Access curriculum materials</li>
                        <li>• Update student progress</li>
                        <li>• View teaching schedule</li>
                        <li>• Submit attendance</li>
                        <li>• Read-only team access</li>
                      </ul>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Count: {teamStats?.by_role.tutor || 0} members
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Team Assignments</CardTitle>
              <CardDescription>
                Manage team member assignments to specific classes, students, or activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <UserX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Team assignments interface will be implemented here</p>
                <p className="text-sm mt-2">This will include class assignments, student groups, and schedule management</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}