'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building, Users, Settings } from 'lucide-react';
import { AcademyPrograms, AcademyUsers } from '@/features/academy';

/**
 * Academy Administration - Programs Management Page
 * 
 * Super admin-only page for managing all programs across the academy
 */
export default function AcademyProgramsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academy Administration</h1>
          <p className="text-gray-600">Manage academy-wide programs, users, and settings</p>
        </div>
      </div>

      {/* Academy Administration Tabs */}
      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="programs" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Programs</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>System Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Programs Tab */}
        <TabsContent value="programs">
          <AcademyPrograms />
        </TabsContent>


        {/* Users Tab */}
        <TabsContent value="users">
          <AcademyUsers />
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure academy-wide system settings, integrations, and global preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>System settings interface will be implemented here</p>
                <p className="text-sm mt-2">This will include global settings, API configurations, and system preferences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}