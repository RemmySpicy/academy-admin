'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus, 
  Filter, 
  Search,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { useFacilities } from '@/features/facilities/hooks';
import { useFacilitySessions, useCancelSession } from '../hooks';
import type { 
  Session, 
  SessionStatus, 
  SessionType, 
  SessionSearchParams,
  SessionListResponse 
} from '../types';
import type { Facility } from '@/features/facilities/types';

interface FacilityScheduleManagerProps {
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
}

export function FacilityScheduleManager({ 
  selectedFacilityId, 
  onSelectFacility 
}: FacilityScheduleManagerProps) {
  const [activeView, setActiveView] = useState('list');
  const [searchParams, setSearchParams] = useState<SessionSearchParams>({});
  const [pagination, setPagination] = useState({ skip: 0, limit: 20 });

  // Use program context hooks for facilities and sessions
  const { data: facilitiesResponse, isLoading: facilitiesLoading, error: facilitiesError } = useFacilities(1, 100);
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useFacilitySessions(
    selectedFacilityId, 
    { ...searchParams, ...pagination }
  );
  const cancelSession = useCancelSession();

  const facilities = facilitiesResponse?.items || [];
  const sessions = sessionsData?.items || [];
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId);

  const handleFacilitySelect = (facilityId: string) => {
    onSelectFacility?.(facilityId);
    // Reset pagination when changing facility
    setPagination({ skip: 0, limit: 20 });
  };

  const handleSearchChange = (updates: Partial<SessionSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...updates }));
    setPagination({ skip: 0, limit: 20 }); // Reset pagination on search
  };

  const getStatusBadgeVariant = (status: SessionStatus) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getSessionTypeColor = (type: SessionType) => {
    switch (type) {
      case 'group_lesson': return 'bg-blue-100 text-blue-800';
      case 'private_lesson': return 'bg-green-100 text-green-800';
      case 'assessment': return 'bg-orange-100 text-orange-800';
      case 'practice': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSessionType = (type: SessionType) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!selectedFacilityId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Select a Facility</span>
          </CardTitle>
          <CardDescription>
            Choose a facility to view and manage its schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((facility) => (
              <Card 
                key={facility.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleFacilitySelect(facility.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                  <CardDescription>{facility.facility_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{facility.address}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline">{facility.status}</Badge>
                    <Button variant="ghost" size="sm">
                      View Schedule →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Facility Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{selectedFacility?.name}</span>
              </CardTitle>
              <CardDescription>
                Schedule management for {selectedFacility?.facility_type} facility
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onSelectFacility?.('')}>
                <MapPin className="h-4 w-4 mr-2" />
                Change Facility
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => {
                const sessionDate = parseISO(s.start_time);
                const today = new Date();
                return sessionDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'scheduled' || s.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled & in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((total, session) => total + session.enrolled_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'scheduled' || s.status === 'in_progress').length / sessions.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Facility usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search sessions..."
                value={searchParams.search || ''}
                onChange={(e) => handleSearchChange({ search: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <Select value={searchParams.session_type || 'all'} onValueChange={(value) => handleSearchChange({ session_type: value === 'all' ? undefined : value as SessionType })}>
                <SelectTrigger>
                  <SelectValue placeholder="Session Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="group_lesson">Group Lesson</SelectItem>
                  <SelectItem value="private_lesson">Private Lesson</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={searchParams.status || 'all'} onValueChange={(value) => handleSearchChange({ status: value === 'all' ? undefined : value as SessionStatus })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchParams({});
                  setPagination({ skip: 0, limit: 20 });
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="list">
            <Clock className="h-4 w-4 mr-2" />
            Schedule List
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {sessionsLoading ? (
            <div className="text-center py-12">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No sessions found
                </h3>
                <p className="text-gray-600 mb-6">
                  {Object.keys(searchParams).length > 0 
                    ? "No sessions match your current filters." 
                    : "This facility doesn't have any scheduled sessions yet."
                  }
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3 flex-1">
                        {/* Session Header */}
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{session.title}</h3>
                          <Badge variant={getStatusBadgeVariant(session.status)}>
                            {session.status.replace('_', ' ')}
                          </Badge>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.session_type)}`}>
                            {formatSessionType(session.session_type)}
                          </span>
                          {session.is_recurring && (
                            <Badge variant="outline">Recurring</Badge>
                          )}
                        </div>

                        {/* Session Details */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(parseISO(session.start_time), 'MMM d, h:mm a')} - {format(parseISO(session.end_time), 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {session.enrolled_count} enrolled
                              {session.max_participants && ` / ${session.max_participants} max`}
                              {session.waitlist_count > 0 && ` (+${session.waitlist_count} waitlist)`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{session.instructor_names.join(', ') || 'No instructor assigned'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {session.student_type && (
                              <Badge variant="outline">{session.student_type}</Badge>
                            )}
                            {session.skill_level && (
                              <Badge variant="outline">{session.skill_level}</Badge>
                            )}
                          </div>
                        </div>

                        {/* Session Status Indicators */}
                        <div className="flex items-center space-x-4 text-xs">
                          {session.is_full && (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Full</span>
                            </div>
                          )}
                          {session.notification_sent && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Notifications sent</span>
                            </div>
                          )}
                          {session.cancellation_reason && (
                            <div className="text-red-600">
                              Cancelled: {session.cancellation_reason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4" />
                        </Button>
                        {session.status !== 'cancelled' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const reason = prompt('Reason for cancellation:');
                              if (reason) {
                                cancelSession.mutate({
                                  sessionId: session.id,
                                  reason,
                                  cancelAllRecurring: false
                                });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {sessionsData && sessionsData.pages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={pagination.skip === 0}
                    onClick={() => setPagination(prev => ({ 
                      ...prev, 
                      skip: Math.max(0, prev.skip - prev.limit) 
                    }))}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {Math.floor(pagination.skip / pagination.limit) + 1} of {sessionsData.pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.skip + pagination.limit >= sessionsData.total}
                    onClick={() => setPagination(prev => ({ 
                      ...prev, 
                      skip: prev.skip + prev.limit 
                    }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Calendar View Coming Soon
              </h3>
              <p className="text-gray-600">
                Interactive calendar with drag-and-drop session management will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}