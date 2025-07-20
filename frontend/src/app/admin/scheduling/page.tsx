'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function SchedulingPage() {
  usePageTitle('Scheduling & Calendar', 'Manage schedules, events, and program timetables');
  
  const [activeView, setActiveView] = useState('calendar');

  return (
    <div className="space-y-6">
      {/* Main Action Button */}
      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>
      
      {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                3 classes, 2 meetings, 3 activities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                Scheduled events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Running this semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facility Usage</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                Average utilization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button 
              variant={activeView === 'calendar' ? 'default' : 'outline'}
              onClick={() => setActiveView('calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
            <Button 
              variant={activeView === 'list' ? 'default' : 'outline'}
              onClick={() => setActiveView('list')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Schedule List
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeView === 'calendar' ? 'Calendar View' : 'Schedule List'}
            </CardTitle>
            <CardDescription>
              {activeView === 'calendar' 
                ? 'Monthly calendar view of all scheduled events and activities'
                : 'Detailed list view of upcoming scheduled events'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Scheduling System Coming Soon
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                The scheduling and calendar management system is currently under development. 
                You'll be able to manage events, class schedules, facility bookings, and more.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <Badge variant="outline">Event Management</Badge>
                <Badge variant="outline">Class Scheduling</Badge>
                <Badge variant="outline">Facility Booking</Badge>
                <Badge variant="outline">Conflict Detection</Badge>
                <Badge variant="outline">Recurring Events</Badge>
                <Badge variant="outline">Staff Assignments</Badge>
              </div>

              <div className="flex justify-center space-x-3">
                <Button variant="outline">
                  View Roadmap
                </Button>
                <Button>
                  Request Feature
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Planned Features</CardTitle>
              <CardDescription>What's coming to the scheduling system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Drag & drop calendar interface</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Automated conflict detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Staff availability tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Facility capacity management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Email notifications & reminders</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integration Points</CardTitle>
              <CardDescription>How scheduling connects with other systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Student enrollment system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Facility management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Staff time tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Course curriculum</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}