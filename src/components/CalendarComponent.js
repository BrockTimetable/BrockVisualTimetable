import React, { useState, useEffect} from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import Button from "@mui/material/Button";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import "../css/Calendar.css";
import { createCalendarEvents, getDaysOfWeek } from "../scripts/createCalendarEvents";


export default function CalendarComponent({ timetables }) {
    const calendarRef = React.useRef(null)
    const [events, setEvents] = useState([]);
    const [currentTimetableIndex, setCurrentTimetableIndex] = useState(0);
    const [calendarTerm, setCalendarTerm] = useState(true);
    const [calendarTermButtonText, setCalendarTermButtonText] = useState('VIEW WINTER');
    const theme = useTheme();

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

    const handleCalendarViewClick = (event) => {
        const calendarApi = calendarRef.current.getApi();
        // currently hardcoded fall and winter dates, so it won't work for other terms/years
        calendarApi.gotoDate(calendarTerm ? "2025-01-06" : "2024-09-10");
        setCalendarTerm(!calendarTerm);
        setCalendarTermButtonText(calendarTermButtonText === 'VIEW WINTER' ? 'VIEW FALL' : 'VIEW WINTER');
    };

    const handleEventClick = (clickInfo) => {
        alert("Event: " + clickInfo.event.title + "\nPlaceholder function for pinning classes.");
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
            </div>
            <Box id="calendarNavBar" style={{backgroundColor: theme.palette.divider}}>
                <Box m={2}>
                    <Button variant="contained" onClick={handlePrevious}><NavigateBeforeIcon/></Button>
                </Box>
                {currentTimetableIndex + 1} of {timetables.length}
                <Box m={2}>
                    <Button variant="contained" onClick={handleNext}><NavigateNextIcon /></Button>
                </Box>
                <Box sx={{ marginLeft: 0 }}>
                    <Button variant="contained" onClick={handleCalendarViewClick}>{calendarTermButtonText}</Button>
                </Box>
            </Box>
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin]}
                initialView="timeGridWeek"
                weekends={false}
                headerToolbar={false}
                height={600}
                dayHeaderFormat={{ weekday: "long" }}
                dayCellClassNames={(arg) => (arg.date.getDay() === new Date().getDay() ? "fc-day-today" : "")}
                initialDate="2024-09-10"
                events={events}
                slotMinTime="08:00:00"
                slotMaxTime="23:00:00"
                slotDuration="00:30:00"
                allDaySlot={true}
                allDayText="ONLINE"
                eventContent={renderEventContent}
                eventClick={handleEventClick}
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
