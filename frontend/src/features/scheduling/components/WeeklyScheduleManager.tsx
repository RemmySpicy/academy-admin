'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Edit,
  UserPlus,
  Eye,
  Trash2
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  addWeeks, 
  subWeeks, 
  isSameDay,
  parseISO,
  isToday,
  startOfMonth,
  endOfMonth,
  endOfWeek
} from 'date-fns';
import { useRouter } from 'next/navigation';

import { useFacilities } from '@/features/facilities/hooks';
import { useFacilitySessions } from '../hooks';
import { MonthlyCalendar } from './MonthlyCalendar';
import type { Session, SessionTypeString, SessionStatusString } from '../types';
import type { Facility } from '@/features/facilities/types';

interface WeeklyScheduleManagerProps {
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
}

interface SessionCardProps {
  session: Session;
  onEdit: (sessionId: string) => void;
  onAddParticipants: (sessionId: string) => void;
  onViewParticipants: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
}

function SessionCard({ session, onEdit, onAddParticipants, onViewParticipants, onCancel }: SessionCardProps) {
  const getSessionTypeColor = (type: SessionTypeString) => {
    switch (type) {
      case 'private': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'group': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'school_group': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeVariant = (status: SessionStatusString) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const formatSessionType = (type: SessionTypeString) => {
    switch (type) {
      case 'private': return 'Private Lesson';
      case 'group': return 'Group Lesson';
      case 'school_group': return 'School Group';
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Session Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-sm">{session.title}</h4>
              <Badge variant={getStatusBadgeVariant(session.status)}>
                {session.status}
              </Badge>
            </div>
            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getSessionTypeColor(session.session_type)}`}>
              {formatSessionType(session.session_type)}
            </span>
          </div>

          {/* Time and Participants */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>
                {format(parseISO(session.start_time), 'h:mm a')} - {format(parseISO(session.end_time), 'h:mm a')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-3 w-3" />
              <span>
                {session.enrolled_count || 0} / {session.max_participants || '∞'} participants
              </span>
            </div>
            {session.instructor_names && session.instructor_names.length > 0 && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3" />
                <span>{session.instructor_names.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Difficulty and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {session.difficulty_level && (
                <Badge variant="outline" className="text-xs">
                  {session.difficulty_level}
                </Badge>
              )}
              {session.is_recurring && (
                <Badge variant="outline" className="text-xs">
                  Recurring
                </Badge>
              )}
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(session.id)}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onAddParticipants(session.id)}
                className="h-7 w-7 p-0"
              >
                <UserPlus className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewParticipants(session.id)}
                className="h-7 w-7 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
              {session.status !== 'cancelled' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onCancel(session.id)}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyScheduleManager({ 
  selectedFacilityId, 
  onSelectFacility 
}: WeeklyScheduleManagerProps) {
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 })); // Sunday start
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeView, setActiveView] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Use existing hooks from current implementation
  const { data: facilitiesResponse, isLoading: facilitiesLoading } = useFacilities(1, 100);
  
  // Determine date range based on active view
  const dateRange = useMemo(() => {
    if (activeView === 'weekly') {
      return {
        start_date: format(currentWeek, 'yyyy-MM-dd'),
        end_date: format(addDays(currentWeek, 6), 'yyyy-MM-dd')
      };
    } else {
      // Monthly view - get full month range
      const monthStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
      const monthEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
      return {
        start_date: format(monthStart, 'yyyy-MM-dd'),
        end_date: format(monthEnd, 'yyyy-MM-dd')
      };
    }
  }, [activeView, currentWeek, currentMonth]);

  const { data: sessionsData, isLoading: sessionsLoading } = useFacilitySessions(
    selectedFacilityId,
    dateRange
  );

  const facilities = facilitiesResponse?.items || [];
  const sessions = sessionsData?.items || [];
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId);

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = parseISO(session.start_time);
      return isSameDay(sessionDate, date);
    });
  };

  // Get current selected day (default to today if in current week, otherwise first day of week)
  const getCurrentDay = () => {
    const today = new Date();
    const isCurrentWeek = weekDays.some(day => isSameDay(day, today));
    return isCurrentWeek ? today : weekDays[0];
  };

  const selectedDay = selectedDate || getCurrentDay();
  const selectedDaySessions = getSessionsForDate(selectedDay);

  // Navigation handlers
  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentWeek(startOfWeek(today, { weekStartsOn: 0 }));
    setSelectedDate(today);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Action handlers
  const handleCreateSession = () => {
    const dateParam = format(selectedDay, 'yyyy-MM-dd');
    const facilityParam = selectedFacilityId;
    router.push(`/admin/scheduling/new?date=${dateParam}&facility=${facilityParam}`);
  };

  const handleEditSession = (sessionId: string) => {
    console.log('Edit session:', sessionId);
    // TODO: Navigate to session edit form
  };

  const handleAddParticipants = (sessionId: string) => {
    console.log('Add participants to session:', sessionId);
    // TODO: Open student selection dialog
  };

  const handleViewParticipants = (sessionId: string) => {
    console.log('View participants for session:', sessionId);
    // TODO: Open participants view dialog
  };

  const handleCancelSession = (sessionId: string) => {
    console.log('Cancel session:', sessionId);
    // TODO: Open cancellation dialog with reason
  };

  const handleFacilitySelect = (facilityId: string) => {
    onSelectFacility?.(facilityId);
  };

  // Monthly view handlers
  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  const handleDateClickFromCalendar = (date: Date) => {
    // Switch to weekly view and navigate to the week containing this date
    setActiveView('weekly');
    setCurrentWeek(startOfWeek(date, { weekStartsOn: 0 }));
    setSelectedDate(date);
  };

  const handleWeekClickFromCalendar = (weekStart: Date) => {
    // Switch to weekly view for the selected week
    setActiveView('weekly');
    setCurrentWeek(weekStart);
    setSelectedDate(weekStart);
  };

  const handleCreateSessionFromCalendar = (date: Date) => {
    const dateParam = format(date, 'yyyy-MM-dd');
    const facilityParam = selectedFacilityId;
    router.push(`/admin/scheduling/new?date=${dateParam}&facility=${facilityParam}`);
  };

  // Show facility selection if no facility selected
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
                Weekly schedule management for {selectedFacility?.facility_type} facility
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onSelectFacility?.('')}>
                <MapPin className="h-4 w-4 mr-2" />
                Change Facility
              </Button>
              <Button onClick={handleCreateSession}>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'weekly' | 'monthly')}>
          <TabsList>
            <TabsTrigger value="weekly" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Weekly View</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Monthly View</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Week Navigation */}
        {activeView === 'weekly' && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[200px] text-center">
              {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleTodayClick}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveView('monthly')}>
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {activeView === 'weekly' ? (
        /* Weekly View */
        <Card>
          <CardContent className="p-6">
            <Tabs value={format(selectedDay, 'yyyy-MM-dd')} onValueChange={(value) => {
              const date = new Date(value);
              handleDateSelect(date);
            }}>
              {/* Day Tabs */}
              <TabsList className="grid w-full grid-cols-7 mb-6 h-auto">
                {weekDays.map((day) => {
                  const daySessionCount = getSessionsForDate(day).length;
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <TabsTrigger 
                      key={format(day, 'yyyy-MM-dd')} 
                      value={format(day, 'yyyy-MM-dd')}
                      className="relative flex flex-col items-center space-y-1 p-3 h-auto min-h-[4rem]"
                    >
                      <span className={`text-xs font-medium ${isCurrentDay ? 'text-blue-600' : ''}`}>
                        {format(day, 'EEE')}
                      </span>
                      <span className={`text-lg font-bold ${isCurrentDay ? 'text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {daySessionCount > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {daySessionCount}
                        </Badge>
                      )}
                      {isCurrentDay && (
                        <div className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Day Content */}
              {weekDays.map((day) => (
                <TabsContent key={format(day, 'yyyy-MM-dd')} value={format(day, 'yyyy-MM-dd')}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {format(day, 'EEEE, MMMM d, yyyy')}
                        {isToday(day) && (
                          <Badge variant="outline" className="ml-2">Today</Badge>
                        )}
                      </h3>
                      <Button onClick={handleCreateSession} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Session
                      </Button>
                    </div>
                    
                    {sessionsLoading ? (
                      <div className="text-center py-12 text-gray-500">
                        Loading sessions...
                      </div>
                    ) : getSessionsForDate(day).length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No sessions scheduled for this day</p>
                        <Button onClick={handleCreateSession} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Session
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getSessionsForDate(day)
                          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                          .map((session) => (
                            <SessionCard
                              key={session.id}
                              session={session}
                              onEdit={handleEditSession}
                              onAddParticipants={handleAddParticipants}
                              onViewParticipants={handleViewParticipants}
                              onCancel={handleCancelSession}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        /* Monthly View */
        <MonthlyCalendar
          sessions={sessions}
          selectedMonth={currentMonth}
          onMonthChange={handleMonthChange}
          onDateClick={handleDateClickFromCalendar}
          onWeekClick={handleWeekClickFromCalendar}
          onCreateSession={handleCreateSessionFromCalendar}
          isLoading={sessionsLoading}
        />
      )}
    </div>
  );
}