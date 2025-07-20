'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, BookOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { schedulingApi } from '../api';
import type { Session, SessionParticipant } from '../types';

interface StudentScheduleManagerProps {
  studentId: string;
  enrollments?: any[];
  isLoading?: boolean;
}

export function StudentScheduleManager({ 
  studentId, 
  enrollments = [], 
  isLoading = false 
}: StudentScheduleManagerProps) {
  
  // Get student's session participations
  const { data: studentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['student-sessions', studentId],
    queryFn: async () => {
      // For now, we'll need to implement a student-specific endpoint
      // This is a placeholder implementation
      return [];
    },
    enabled: !!studentId,
  });

  const sessions = studentSessions || [];
  const upcomingSessions = sessions.filter((session: Session) => 
    new Date(session.start_time) > new Date() && 
    (session.status === 'scheduled' || session.status === 'in_progress')
  );
  const completedSessions = sessions.filter((session: Session) => 
    session.status === 'completed'
  );

  if (isLoading || sessionsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading schedule...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Student Schedule</span>
          </CardTitle>
          <CardDescription>
            View enrolled sessions, upcoming classes, and attendance history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</div>
              <p className="text-sm text-blue-800">Upcoming Sessions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedSessions.length}</div>
              <p className="text-sm text-green-800">Completed Sessions</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{enrollments.length}</div>
              <p className="text-sm text-purple-800">Course Enrollments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
            <CardDescription>Next scheduled classes and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.slice(0, 5).map((session: Session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{session.title}</h3>
                      <Badge variant="outline">
                        {session.session_type.replace('_', ' ')}
                      </Badge>
                      <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(parseISO(session.start_time), 'MMM d, h:mm a')} - 
                          {format(parseISO(session.end_time), 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{session.facility_name || 'TBD'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{session.instructor_names.join(', ') || 'No instructor'}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Upcoming Sessions
            </h3>
            <p className="text-gray-600 mb-6">
              This student is not currently enrolled in any upcoming sessions.
            </p>
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              View Course Enrollments
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Course Enrollments */}
      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Enrollments</CardTitle>
            <CardDescription>Active course registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollments.map((enrollment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{enrollment.course?.title || 'Unknown Course'}</h4>
                    <p className="text-sm text-gray-600">
                      Enrolled: {enrollment.enrollment_date ? format(parseISO(enrollment.enrollment_date), 'MMM d, yyyy') : 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                      {enrollment.status}
                    </Badge>
                    {enrollment.progress_percentage && (
                      <p className="text-sm text-gray-600 mt-1">
                        {enrollment.progress_percentage}% complete
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Integration Notice */}
      <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Enhanced Schedule Management
          </h3>
          <p className="text-blue-700 mb-4">
            Comprehensive session scheduling, attendance tracking, and calendar integration 
            are now available through the main Scheduling system.
          </p>
          <div className="flex justify-center space-x-2">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              View Full Schedule
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Manage Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}