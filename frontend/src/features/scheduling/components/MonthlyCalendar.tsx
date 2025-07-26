'use client';

import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek as getWeekStart
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Plus, Eye } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { Session, SessionTypeString } from '../types';

interface MonthlyCalendarProps {
  sessions: Session[];
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
  onWeekClick: (weekStart: Date) => void;
  onCreateSession?: (date: Date) => void;
  isLoading?: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: Session[];
  sessionCount: number;
}

export function MonthlyCalendar({
  sessions,
  selectedMonth,
  onMonthChange,
  onDateClick,
  onWeekClick,
  onCreateSession,
  isLoading = false
}: MonthlyCalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Generate calendar days for the month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map(date => {
      const daySessions = sessions.filter(session => {
        const sessionDate = parseISO(session.start_time);
        return isSameDay(sessionDate, date);
      });

      return {
        date,
        isCurrentMonth: isSameMonth(date, selectedMonth),
        isToday: isToday(date),
        sessions: daySessions,
        sessionCount: daySessions.length,
      };
    });
  }, [selectedMonth, sessions]);

  // Group days into weeks
  const weeks = useMemo(() => {
    const weekChunks: CalendarDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weekChunks.push(calendarDays.slice(i, i + 7));
    }
    return weekChunks;
  }, [calendarDays]);

  // Get session type colors
  const getSessionTypeColor = (type: SessionTypeString) => {
    switch (type) {
      case 'private':
        return 'bg-emerald-500';
      case 'group':
        return 'bg-blue-500';
      case 'school_group':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle previous month
  const handlePreviousMonth = () => {
    onMonthChange(subMonths(selectedMonth, 1));
  };

  // Handle next month
  const handleNextMonth = () => {
    onMonthChange(addMonths(selectedMonth, 1));
  };

  // Handle week click - navigate to weekly view
  const handleWeekClick = (week: CalendarDay[]) => {
    const weekStart = getWeekStart(week[0].date, { weekStartsOn: 0 });
    onWeekClick(weekStart);
  };

  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    onDateClick(day.date);
  };

  // Handle create session
  const handleCreateSession = (day: CalendarDay, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onCreateSession) {
      onCreateSession(day.date);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Monthly Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-center font-semibold">
              {format(selectedMonth, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <div key={index} className="h-24 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Weeks */}
            <div className="space-y-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="relative group">
                  {/* Week click overlay */}
                  <div
                    className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-50 transition-opacity cursor-pointer rounded-md z-10"
                    onClick={() => handleWeekClick(week)}
                    title="Click to view this week"
                  />
                  
                  {/* Week indicator */}
                  <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleWeekClick(week)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-2 relative z-20">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={cn(
                          'relative p-2 min-h-[96px] border rounded-md cursor-pointer transition-all',
                          'hover:shadow-md hover:border-blue-300',
                          day.isCurrentMonth 
                            ? 'bg-white border-gray-200' 
                            : 'bg-gray-50 border-gray-100',
                          day.isToday && 'ring-2 ring-blue-500 bg-blue-50',
                          hoveredDate && isSameDay(hoveredDate, day.date) && 'bg-blue-50'
                        )}
                        onClick={() => handleDayClick(day)}
                        onMouseEnter={() => setHoveredDate(day.date)}
                        onMouseLeave={() => setHoveredDate(null)}
                      >
                        {/* Date Number */}
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            'text-sm font-medium',
                            day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                            day.isToday && 'text-blue-600 font-bold'
                          )}>
                            {format(day.date, 'd')}
                          </span>
                          
                          {/* Session Count Badge */}
                          {day.sessionCount > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs px-1.5 py-0.5 h-5"
                            >
                              {day.sessionCount}
                            </Badge>
                          )}
                        </div>

                        {/* Session Indicators */}
                        <div className="space-y-1">
                          {day.sessions.slice(0, 3).map((session, sessionIndex) => (
                            <div
                              key={session.id}
                              className={cn(
                                'text-xs p-1 rounded text-white truncate',
                                getSessionTypeColor(session.session_type)
                              )}
                              title={`${session.title} - ${format(parseISO(session.start_time), 'h:mm a')}`}
                            >
                              {format(parseISO(session.start_time), 'h:mm a')} {session.title}
                            </div>
                          ))}
                          
                          {/* Show more indicator */}
                          {day.sessionCount > 3 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{day.sessionCount - 3} more
                            </div>
                          )}
                        </div>

                        {/* Add Session Button */}
                        {day.isCurrentMonth && onCreateSession && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute bottom-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleCreateSession(day, e)}
                            title="Create session"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t space-y-3">
              <h4 className="text-sm font-medium">Legend</h4>
              <div className="flex items-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                  <span>Private Lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Group Lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>School Groups</span>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                • Click on a day to view/create sessions • Hover over a week to navigate to weekly view • Click session indicators to view details
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}