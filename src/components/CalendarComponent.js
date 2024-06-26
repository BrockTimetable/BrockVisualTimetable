import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // for selectable
import Button from "@mui/material/Button";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import "../css/Calendar.css";
import { createCalendarEvents, getDaysOfWeek } from "../scripts/createCalendarEvents";

export default function CalendarComponent({ timetables }) {
    const calendarRef = React.useRef(null);
    const [events, setEvents] = useState([]);
    const [currentTimetableIndex, setCurrentTimetableIndex] = useState(0);
    const [calendarTerm, setCalendarTerm] = useState(true);
    const [calendarTermButtonText, setCalendarTermButtonText] = useState("VIEW WINTER");
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
        setCalendarTermButtonText(calendarTermButtonText === "VIEW WINTER" ? "VIEW FALL" : "VIEW WINTER");
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

    const handleSelect = (selectInfo) => {
        alert(
            "Selected: " +
                selectInfo.startStr +
                " to " +
                selectInfo.endStr +
                "\nPlaceholder function for blocking out time."
        );
    };

    // FullCalendar does not allow you to select the same time across multiple days (select only returns
    // a single day). By default you can select multiple days, but it will select ALL the time from the
    // start to the end date.  This function limits you to selecting a time in a single day.

    // At some point, I would like to come back to this to allow users to select multiple days, but only
    // a specific time range within those days.  This would be useful for selecting a time range that
    // spans multiple days, but only during a specific time range each day.
    const handleSelectAllow = (selectionInfo) => {
        let startDate = selectionInfo.start;
        let endDate = selectionInfo.end;
        endDate.setSeconds(endDate.getSeconds() - 1); // allow full day selection
        if (startDate.getDate() === endDate.getDate()) {
            return true;
        } else {
            return false;
        }
    };

    return (
        <div id="Calendar">
            <Box id="calendarNavBar" style={{ backgroundColor: theme.palette.divider }}>
                <Box m={2}>
                    <Button variant="contained" onClick={handlePrevious} disabled={timetables.length <= 1}>
                        <NavigateBeforeIcon />
                    </Button>
                </Box>
                {currentTimetableIndex + 1} of {timetables.length}
                <Box m={2}>
                    <Button variant="contained" onClick={handleNext} disabled={timetables.length <= 1}>
                        <NavigateNextIcon />
                    </Button>
                </Box>
                <Box sx={{ marginLeft: 0 }}>
                    <Button variant="outlined" onClick={handleCalendarViewClick}>
                        {calendarTermButtonText}
                    </Button>
                </Box>
            </Box>
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
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
                selectable={true}
                selectMinDistance={25}
                select={handleSelect}
                selectAllow={handleSelectAllow}
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
