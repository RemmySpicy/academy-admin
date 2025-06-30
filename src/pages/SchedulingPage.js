import React, { useState } from 'react';
import styled from 'styled-components';
import { Routes, Route } from 'react-router-dom';
import { 
  Calendar as CalendarIcon,
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Clock,
  MapPin,
  Check,
  X,
  MoreHorizontal
} from 'lucide-react';

const PageContainer = styled.div`
  padding: 20px 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #6c5ce7;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #5a4acf;
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  .month-year {
    font-size: 18px;
    font-weight: 600;
    min-width: 150px;
    text-align: center;
  }
  
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    background-color: white;
    color: #4a5568;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: #6c5ce7;
      color: #6c5ce7;
    }
  }
`;

const ViewSelector = styled.div`
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  
  button {
    padding: 8px 16px;
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    color: #4a5568;
    
    &.active {
      background-color: #6c5ce7;
      color: white;
    }
    
    &:not(:last-child) {
      border-right: 1px solid #e2e8f0;
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const WeekdayHeader = styled.div`
  padding: 10px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #4a5568;
  background-color: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const CalendarDay = styled.div`
  min-height: 140px;
  padding: 8px;
  border-right: ${props => props.isLastInRow ? 'none' : '1px solid #e2e8f0'};
  border-bottom: ${props => props.isLastRow ? 'none' : '1px solid #e2e8f0'};
  background-color: ${props => props.isToday ? '#6c5ce710' : props.isCurrentMonth ? 'white' : '#f7fafc'};
  
  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .day-number {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: ${props => props.isToday ? '600' : '400'};
      color: ${props => props.isToday ? 'white' : props.isCurrentMonth ? '#2d3748' : '#a0aec0'};
      background-color: ${props => props.isToday ? '#6c5ce7' : 'transparent'};
      border-radius: 50%;
    }
    
    .add-event {
      visibility: hidden;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: none;
      background-color: #e2e8f0;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: #6c5ce7;
        color: white;
      }
    }
  }
  
  &:hover {
    .day-header .add-event {
      visibility: visible;
    }
  }
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EventItem = styled.div`
  background-color: ${props => props.bgColor || '#6c5ce730'};
  border-left: 3px solid ${props => props.borderColor || '#6c5ce7'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #2d3748;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const UpcomingEvents = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
  margin-top: 24px;
`;

const UpcomingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .title {
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
  }
  
  .view-all {
    font-size: 14px;
    color: #6c5ce7;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const EventCard = styled.div`
  display: flex;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #cbd5e0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
  
  .event-color {
    width: 4px;
    border-radius: 2px;
    background-color: ${props => props.eventColor || '#6c5ce7'};
    margin-right: 16px;
  }
  
  .event-content {
    flex: 1;
  }
  
  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    
    .event-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 4px;
    }
    
    .event-time {
      font-size: 13px;
      color: #718096;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .event-actions {
      display: flex;
      gap: 8px;
      
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: none;
        background-color: transparent;
        color: #718096;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background-color: #f7fafc;
          color: #4a5568;
        }
      }
    }
  }
  
  .event-details {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 13px;
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #718096;
      
      svg {
        color: #6c5ce7;
      }
    }
  }
  
  .event-status {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid #f0f0f0;
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      
      &.confirmed {
        color: #38b2ac;
        
        svg {
          color: #38b2ac;
        }
      }
      
      &.pending {
        color: #ed8936;
        
        svg {
          color: #ed8936;
        }
      }
      
      &.conflict {
        color: #e53e3e;
        
        svg {
          color: #e53e3e;
        }
      }
    }
  }
`;

// Mock data for days
const generateCalendarDays = (currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();
  
  // Previous month days to include
  const daysFromPrevMonth = startingDayOfWeek;
  
  // Next month days to include (to fill the grid)
  const totalCells = Math.ceil((totalDaysInMonth + daysFromPrevMonth) / 7) * 7;
  const daysFromNextMonth = totalCells - totalDaysInMonth - daysFromPrevMonth;
  
  const days = [];
  
  // Days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthLastDay = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
  
  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    days.push({
      date: new Date(prevMonthYear, prevMonth, day),
      dayNumber: day,
      isCurrentMonth: false,
      isToday: false,
      events: []
    });
  }
  
  // Days from current month
  const today = new Date();
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: 
        today.getDate() === i && 
        today.getMonth() === month && 
        today.getFullYear() === year,
      events: generateEvents(date)
    });
  }
  
  // Days from next month
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  
  for (let i = 1; i <= daysFromNextMonth; i++) {
    days.push({
      date: new Date(nextMonthYear, nextMonth, i),
      dayNumber: i,
      isCurrentMonth: false,
      isToday: false,
      events: []
    });
  }
  
  return days;
};

// Event colors
const eventColors = {
  swimming: {
    bg: '#4299e120',
    border: '#4299e1'
  },
  football: {
    bg: '#38b2ac20',
    border: '#38b2ac'
  },
  basketball: {
    bg: '#ed893620',
    border: '#ed8936'
  },
  music: {
    bg: '#9f7aea20',
    border: '#9f7aea'
  }
};

// Mock events
const generateEvents = (date) => {
  const day = date.getDate();
  const events = [];
  
  // Random events for certain dates
  if (day % 3 === 0) {
    events.push({
      id: `s-${date.getTime()}`,
      title: 'Swimming Class',
      type: 'swimming',
      time: '10:00 AM - 11:30 AM',
      facility: 'Downtown Swimming Pool',
      instructor: 'Coach Debby',
      students: 12,
      status: 'confirmed'
    });
  }
  
  if (day % 4 === 0) {
    events.push({
      id: `f-${date.getTime()}`,
      title: 'Football Training',
      type: 'football',
      time: '4:00 PM - 5:30 PM',
      facility: 'Ziggies Sports Field',
      instructor: 'Coach Mark',
      students: 15,
      status: day % 8 === 0 ? 'conflict' : 'confirmed'
    });
  }
  
  if (day % 5 === 0) {
    events.push({
      id: `b-${date.getTime()}`,
      title: 'Basketball Practice',
      type: 'basketball',
      time: '2:00 PM - 3:30 PM',
      facility: 'Indoor Court',
      instructor: 'Coach James',
      students: 10,
      status: 'pending'
    });
  }
  
  if (day % 7 === 0) {
    events.push({
      id: `m-${date.getTime()}`,
      title: 'Piano Lessons',
      type: 'music',
      time: '5:00 PM - 6:00 PM',
      facility: 'Music Studio',
      instructor: 'Ms. Sarah',
      students: 1,
      status: 'confirmed'
    });
  }
  
  return events;
};

// Upcoming events (next 5 days)
const generateUpcomingEvents = () => {
  const today = new Date();
  const events = [];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    const dayEvents = generateEvents(date);
    dayEvents.forEach(event => {
      events.push({
        ...event,
        date
      });
    });
  }
  
  return events.slice(0, 5); // Return at most 5 events
};

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SchedulingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const calendarDays = generateCalendarDays(currentDate);
  const upcomingEvents = generateUpcomingEvents();
  
  const goToPrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  const formatEventDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <Check size={14} />;
      case 'pending':
        return <Clock size={14} />;
      case 'conflict':
        return <X size={14} />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'conflict':
        return 'Scheduling Conflict';
      default:
        return '';
    }
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <Title>Schedule</Title>
        <ActionButton>
          <Plus size={18} />
          Add Schedule
        </ActionButton>
      </PageHeader>
      
      <Routes>
        <Route index element={
          <>
            <CalendarHeader>
              <MonthSelector>
                <button onClick={goToPrevMonth}>
                  <ChevronLeft size={18} />
                </button>
                <div className="month-year">
                  {formatMonthYear(currentDate)}
                </div>
                <button onClick={goToNextMonth}>
                  <ChevronRight size={18} />
                </button>
              </MonthSelector>
              
              <ViewSelector>
                <button 
                  className={calendarView === 'day' ? 'active' : ''}
                  onClick={() => setCalendarView('day')}
                >
                  Day
                </button>
                <button 
                  className={calendarView === 'week' ? 'active' : ''}
                  onClick={() => setCalendarView('week')}
                >
                  Week
                </button>
                <button 
                  className={calendarView === 'month' ? 'active' : ''}
                  onClick={() => setCalendarView('month')}
                >
                  Month
                </button>
              </ViewSelector>
            </CalendarHeader>
            
            <CalendarGrid>
              {weekdays.map(day => (
                <WeekdayHeader key={day}>{day.substring(0, 3)}</WeekdayHeader>
              ))}
              
              {calendarDays.map((day, index) => (
                <CalendarDay 
                  key={index}
                  isCurrentMonth={day.isCurrentMonth}
                  isToday={day.isToday}
                  isLastInRow={(index + 1) % 7 === 0}
                  isLastRow={index >= calendarDays.length - 7}
                >
                  <div className="day-header">
                    <div className="day-number">{day.dayNumber}</div>
                    <button className="add-event">
                      <Plus size={12} />
                    </button>
                  </div>
                  
                  <EventList>
                    {day.events.map(event => (
                      <EventItem 
                        key={event.id}
                        bgColor={eventColors[event.type].bg}
                        borderColor={eventColors[event.type].border}
                      >
                        {event.title}
                      </EventItem>
                    ))}
                  </EventList>
                </CalendarDay>
              ))}
            </CalendarGrid>
            
            <UpcomingEvents>
              <UpcomingHeader>
                <div className="title">Upcoming Events</div>
                <a href="#" className="view-all">View all</a>
              </UpcomingHeader>
              
              {upcomingEvents.map((event, index) => (
                <EventCard 
                  key={index}
                  eventColor={eventColors[event.type].border}
                >
                  <div className="event-color"></div>
                  <div className="event-content">
                    <div className="event-header">
                      <div>
                        <div className="event-title">{event.title}</div>
                        <div className="event-time">
                          <CalendarIcon size={14} />
                          {formatEventDate(event.date)} • {event.time}
                        </div>
                      </div>
                      <div className="event-actions">
                        <button>
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="event-details">
                      <div className="detail-item">
                        <MapPin size={14} />
                        {event.facility}
                      </div>
                      <div className="detail-item">
                        <Users size={14} />
                        {event.students} students
                      </div>
                    </div>
                    
                    <div className="event-status">
                      <div className={`status-item ${event.status}`}>
                        {getStatusIcon(event.status)}
                        {getStatusText(event.status)}
                      </div>
                    </div>
                  </div>
                </EventCard>
              ))}
            </UpcomingEvents>
          </>
        } />
      </Routes>
    </PageContainer>
  );
};

export default SchedulingPage; 