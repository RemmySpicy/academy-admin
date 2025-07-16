'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, UserCheck, UserX, Mail, Phone } from 'lucide-react';

/**
 * Team Management Component
 * 
 * Manage program team members, roles, and assignments
 */
export function TeamManagement() {
  // Mock team data for demonstration
  const teamMembers = [
    {
      id: '1',
      name: 'Swimming Program Administrator',
      email: 'swim.admin@academy.com',
      role: 'program_admin',
      status: 'active',
      phone: '+1 (555) 123-4567',
      joinDate: '2025-01-01'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your program team members and their roles</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

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
              <CardTitle>Program Team Members</CardTitle>
              <CardDescription>
                View and manage all team members in your program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.name.split(' ')[0][0]}{member.name.split(' ')[1]?.[0] || ''}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                      <Badge variant="outline">
                        {member.role === 'program_admin' ? 'Program Admin' :
                         member.role === 'program_coordinator' ? 'Coordinator' :
                         member.role === 'tutor' ? 'Tutor' : member.role}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                
                {teamMembers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No team members found</p>
                    <p className="text-sm mt-2">Add team members to start collaborating</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage roles and their permissions within the program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Program Admin</CardTitle>
                      <CardDescription>Full program management access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        <li>• Manage students</li>
                        <li>• Edit curriculum</li>
                        <li>• Schedule classes</li>
                        <li>• Manage team</li>
                        <li>• View payments</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Program Coordinator</CardTitle>
                      <CardDescription>Operational program support</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        <li>• View students</li>
                        <li>• View curriculum</li>
                        <li>• Manage schedules</li>
                        <li>• View team</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Tutor</CardTitle>
                      <CardDescription>Teaching and student interaction</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        <li>• View assigned students</li>
                        <li>• View curriculum</li>
                        <li>• Update progress</li>
                        <li>• View schedule</li>
                      </ul>
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