import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // for selectable
import Button from "@mui/material/Button";
import FormControl from '@mui/material/FormControl';
import Select from "@mui/material/Select";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateFirstIcon from "@mui/icons-material/FirstPage";
import NavigateLastIcon from "@mui/icons-material/LastPage";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import "../css/Calendar.css";
import { createCalendarEvents, getDaysOfWeek, getTimeBlockEvents, addTimeBlockEvent, removeTimeBlockEvent } from "../scripts/createCalendarEvents";
import { generateTimetables, getValidTimetables } from '../scripts/generateTimetables';
import { addPinnedComponent, getPinnedComponents, removePinnedComponent } from '../scripts/pinnedComponents'
import { setBlockedTimeSlots, setOpenTimeSlots } from "../scripts/timeSlots";
import { getCourseData } from "../scripts/courseData";

export default function CalendarComponent({ timetables, setTimetables }) {
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
        if (timetables.length > 0 && timetables[0].courses.length > 0) {
            const timetable = timetables[currentTimetableIndex];
            const newEvents = createCalendarEvents(timetable, getDaysOfWeek);
            //console.log('New events:', newEvents); //Main Debugging log
            setEvents(newEvents);
        }else{
            const newEvents = createCalendarEvents(null, getDaysOfWeek);
            setEvents(newEvents)
            if (Object.keys(getCourseData()).length > 0){
                alert("No valid can be timetables generated!\n\nThis is likely caused by one of the following reasons:\n\n1.Adding a course that is not being offered in that duration.\n2.Adding courses that always overlap with another course\n3.Blocking out all possible timeslots that a course is offered in.\n\nTry unblocking/unpinning some components or removing the last course you have added.");
            }
        }
    };

    const handleCalendarViewClick = () => {
        const calendarApi = calendarRef.current.getApi();
        const year = new Date().getFullYear();
        // currently hardcoded fall and winter dates, so it won't work for other terms/years
        calendarApi.gotoDate(calendarTerm ? (year+1) + "-01-20" : year+"-09-20");
        setCalendarTerm(!calendarTerm);
        setCalendarTermButtonText(calendarTermButtonText === "VIEW WINTER" ? "VIEW FALL" : "VIEW WINTER");
    };

    const handleEventClick = (clickInfo) => {      
        if (clickInfo.event.title !== "TIME BLOCKED"){
            const split = clickInfo.event.title.split(" ");
            const courseCode = split[0];
            if (split[1] !== "TUT" && split[1] !== "LAB" && split[1] !== "SEM") {
                split[1] = "MAIN";
            }

            const pinnedComponents = getPinnedComponents();
            if (pinnedComponents.includes(courseCode + " " + split[1] + " " + clickInfo.event.id)) {
                removePinnedComponent(courseCode + " " + split[1] + " " + clickInfo.event.id);
            } else {
                addPinnedComponent(courseCode + " " + split[1] + " " + clickInfo.event.id);
            }
        }else{
            const blockId = clickInfo.event.id.split("-")[1];
            const blockEvent = getTimeBlockEvents().find(block => block.id === blockId);

            if (blockEvent) {
                const slotStart = (parseInt(blockEvent.startTime.split(':')[0]) - 8) * 2 + (parseInt(blockEvent.startTime.split(':')[1]) / 30);
                const slotEnd = (parseInt(blockEvent.endTime.split(':')[0]) - 8) * 2 + (parseInt(blockEvent.endTime.split(':')[1]) / 30);
                const slotsToUnblock = [];
                
                for (let i = slotStart; i < slotEnd; i++) {
                    slotsToUnblock.push(i);
                }
    
                const unblockedSlots = {
                    [blockEvent.daysOfWeek.trim()]: slotsToUnblock
                };
                setOpenTimeSlots(unblockedSlots);
                removeTimeBlockEvent(blockId);
            }
        }
        setCurrentTimetableIndex(0);
        generateTimetables();
        setTimetables(getValidTimetables());
    };

    const handleNext = () => {
        setCurrentTimetableIndex((currentTimetableIndex + 1) % timetables.length);
    };

    const handlePrevious = () => {
        setCurrentTimetableIndex((currentTimetableIndex - 1 + timetables.length) % timetables.length);
    };

    const handleFirst = () => {
        setCurrentTimetableIndex((0));
    };
    const handleLast = () => {
        setCurrentTimetableIndex((timetables.length - 1));
    };

    const handleSelect = (selectInfo) => {
        const startDateTime = new Date(selectInfo.startStr);
        const endDateTime = new Date(selectInfo.endStr);
        const startDay = startDateTime.toLocaleString('en-US', { weekday: 'short' }); 
        const slotStart = (startDateTime.getHours() - 8) * 2 + (startDateTime.getMinutes() / 30);
        const slotEnd = (endDateTime.getHours() - 8) * 2 + (endDateTime.getMinutes() / 30);
        
        const dayMapping = {
            Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'R', Fri: 'F'
        };
    
        if (dayMapping[startDay]) {
            const slotsToBlock = [];
            for (let i = slotStart; i <= slotEnd - 1; i++) {
                slotsToBlock.push(i);
            }

            const existingBlocks = getTimeBlockEvents();
            let combinedSlotStart = slotStart;
            let combinedSlotEnd = slotEnd;
            let blocksToRemove = [];
    
            for (let block of existingBlocks) {
                if (block.daysOfWeek.trim() === dayMapping[startDay]) {
                    const existingStartParts = block.startTime.split(':');
                    const existingSlotStart = (parseInt(existingStartParts[0]) - 8) * 2 + (parseInt(existingStartParts[1]) / 30);
                    const existingEndParts = block.endTime.split(':');
                    const existingSlotEnd = (parseInt(existingEndParts[0]) - 8) * 2 + (parseInt(existingEndParts[1]) / 30);
    
                    if (!(slotStart >= existingSlotEnd || slotEnd <= existingSlotStart)) {
                        combinedSlotStart = Math.min(combinedSlotStart, existingSlotStart);
                        combinedSlotEnd = Math.max(combinedSlotEnd, existingSlotEnd);
                        blocksToRemove.push(block.id);
                    }
                }
            }
    
            const combinedSlots = [];
            for (let i = combinedSlotStart; i < combinedSlotEnd; i++) {
                combinedSlots.push(i);
            }
    
            const combinedSlotsObject = { [dayMapping[startDay]]: combinedSlots };
    
            setBlockedTimeSlots(combinedSlotsObject);
    
            for (let blockId of blocksToRemove) {
                removeTimeBlockEvent(blockId);
            }
    
            const blockId = Date.now().toString();
            const block = {
                id: blockId,
                daysOfWeek: dayMapping[startDay],
                startTime: `${Math.floor(combinedSlotStart / 2) + 8}:${combinedSlotStart % 2 === 0 ? '00' : '30'}`,
                endTime: `${Math.floor(combinedSlotEnd / 2) + 8}:${combinedSlotEnd % 2 === 0 ? '00' : '30'}`,
                startRecur: new Date().toISOString().split('T')[0],
                endRecur: '9999-12-31'
            };
            addTimeBlockEvent(block);
        }
        setCurrentTimetableIndex(0);
        generateTimetables();
        setTimetables(getValidTimetables());
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
            <Box marginLeft={25}/>
                <Box marginRight={1}>
                    <Button variant="contained" onClick={handleFirst} disabled={timetables.length <= 1}>
                        <NavigateFirstIcon />
                    </Button>
                </Box>
                <Box marginRight={2}>
                    <Button variant="contained" onClick={handlePrevious} disabled={timetables.length <= 1}>
                        <NavigateBeforeIcon />
                    </Button>
                </Box>
                {currentTimetableIndex + 1} of {timetables.length}
                <Box marginLeft={2} >
                    <Button variant="contained" onClick={handleNext} disabled={timetables.length <= 1}>
                        <NavigateNextIcon />
                    </Button>
                </Box>
                <Box marginLeft={1}>
                    <Button variant="contained" onClick={handleLast} disabled={timetables.length <= 1}>
                        <NavigateLastIcon />
                    </Button>
                </Box>
                <Box marginLeft={2}>
                    <FormControl sx={{width:200}}size="small" >
                        <InputLabel id="duration-select-label">Select Duration</InputLabel>
                        <Select
                        labelId="duration-select-label"
                        id="duration-select"
                        label="Duration"
                        value={calendarTermButtonText}
                        onChange={handleCalendarViewClick}>
                        <MenuItem>September-April D1</MenuItem>
                        <MenuItem>September-December D2</MenuItem>
                        <MenuItem>January-April D3</MenuItem>
                        </Select>
                    </FormControl>
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
