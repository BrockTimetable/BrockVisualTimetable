import React from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/timegrid';
import '../css/Calendar.css'
export default function CalendarComponent() {
  return (
    <>
        <div id="Calendar">
            <FullCalendar 
            plugins={[dayGridPlugin]} 
            initialView="timeGridWeek" 
            weekends={false}
            height={600}
            dayHeaderFormat={{ weekday: 'long' }}
            dayCellClassNames={(arg) => (arg.date.getDay() === new Date().getDay() ? 'fc-day-today' : '')}
            initialDate="2024-09-10">
            </FullCalendar>
        </div>
    </>
  )
}
