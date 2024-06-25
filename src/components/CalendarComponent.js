import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import Button from 'react-bootstrap/Button';
import '../css/Calendar.css';
import { createCalendarEvents, getDaysOfWeek } from '../scripts/createCalendarEvents';

export default function CalendarComponent({ timetables }) {
  const [events, setEvents] = useState([]);
  const [currentTimetableIndex, setCurrentTimetableIndex] = useState(0);

  useEffect(() => {
    updateCalendarEvents();
  }, [currentTimetableIndex, timetables]);

  const updateCalendarEvents = () => {
    if (timetables.length > 0) {
      const timetable = timetables[currentTimetableIndex];
      const newEvents = createCalendarEvents(timetable, getDaysOfWeek);
      //console.log('New events:', newEvents); // Debugging log
      setEvents(newEvents);
    }
  };

  const handleNext = () => {
    setCurrentTimetableIndex((currentTimetableIndex + 1) % timetables.length);
  };

  const handlePrevious = () => {
    setCurrentTimetableIndex((currentTimetableIndex - 1 + timetables.length) % timetables.length);
  };

  return (
    <div id="Calendar">
      <div id="calendarNavBar">
        <Button variant="secondary" id="calPrev" onClick={handlePrevious}>Previous Schedule</Button>
        {currentTimetableIndex + 1} out of {timetables.length} possible schedules
        <Button variant="secondary" id="calNext" onClick={handleNext}>Next Schedule</Button>
      </div>
      <FullCalendar 
        plugins={[timeGridPlugin]} 
        initialView="timeGridWeek" 
        weekends={false}
        headerToolbar={{
          left: 'title',
          center: '',
          right: ''
        }}
        height={600}
        dayHeaderFormat={{ weekday: 'long' }}
        dayCellClassNames={(arg) => (arg.date.getDay() === new Date().getDay() ? 'fc-day-today' : '')}
        initialDate="2024-09-10"
        events={events}
        slotMinTime="08:00:00"
        slotMaxTime="23:00:00"
        slotDuration="00:30:00"
        allDaySlot={true}
        allDayText='ONLINE'
        eventContent={renderEventContent}
      />
    </div>
  );
}

const renderEventContent = (eventInfo) => {
  return (
    <div>
      <b>{eventInfo.timeText}</b>
      <br />
      <span>{eventInfo.event.title}</span>
      <br />
      <span>{eventInfo.event.extendedProps.description}</span>
    </div>
  );
};