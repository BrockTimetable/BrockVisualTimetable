import React, { useState, useEffect, useContext, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import BlockIcon from "@mui/icons-material/Block";
import PinIcon from "@mui/icons-material/PushPin";
import { useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import MultiLineSnackbar from "../../SiteWide/components/MultiLineSnackbar";
import CalendarNavBar from "./CalendarNavBar";
import TruncationDialog from "./TruncationDialog";
import NoTimetablesDialog from "./NoTimetablesDialog";
import BlockedSlotsDialog from "./BlockedSlotsDialog";
import BorderBox from "./InputFormComponents/Sections/BorderBox";
import CourseTimelineComponent from "./CourseTimelineComponent";
import "../css/Calendar.css";
import "../css/CustomCalendar.css";
import {
    createCalendarEvents,
    getDaysOfWeek,
    getTimeBlockEvents,
    addTimeBlockEvent,
    removeTimeBlockEvent,
    isEventPinned,
} from "../scripts/createCalendarEvents";
import { generateTimetables, getValidTimetables } from "../scripts/generateTimetables";
import { addPinnedComponent, getPinnedComponents, removePinnedComponent } from "../scripts/pinnedComponents";
import { setBlockedTimeSlots, setOpenTimeSlots } from "../scripts/timeSlots";
import { getCourseData } from "../scripts/courseData";
import { CourseDetailsContext } from "../contexts/CourseDetailsContext";
import eventBus from "../../SiteWide/Buses/eventBus";
import { CourseColorsContext } from "../contexts/CourseColorsContext";
let previousDuration = null; 
let aprioriDurationTimetable = null;
export default function CalendarComponent({
    timetables,
    setTimetables,
    selectedDuration,
    setSelectedDuration,
    durations,
    sortOption,
}) {
    const { enqueueSnackbar } = useSnackbar();
    const calendarRef = React.useRef(null);
    const timetablesRef = React.useRef(timetables);
    const currentTimetableIndexRef = React.useRef(0);
    const courseColorsRef = React.useRef({});
    const [events, setEvents] = useState([]);
    const [currentTimetableIndex, setCurrentTimetableIndex] = useState(0);
    const theme = useTheme();
    const { setCourseDetails } = useContext(CourseDetailsContext);
    const { courseColors, setCalendarUpdateHandler, getDefaultColorForCourse } = useContext(CourseColorsContext);
    const [isTruncated, setIsTruncated] = useState(false);
    const [truncationDialogOpen, setTruncationDialogOpen] = useState(false);
    const [noTimetablesGenerated, setNoTimetablesGenerated] = useState(false);
    const [noTimetablesDialogOpen, setNoTimetablesDialogOpen] = useState(false);
    const [noCourses, setNoCourses] = useState(true);
    const [timeslotsOverridden, setTimeslotsOverridden] = useState(false);
    const [timeslotsOverriddenDialogOpen, setTimeslotsOverriddenDialogOpen] = useState(false);
    const [showWeekends, setShowWeekends] = useState(false);
    const [timeBlockedTimetables, setTimeBlockedTimetables] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [touch, setTouch] = useState({ startX: 0 });
    const [coursesForTimeline, setCoursesForTimeline] = useState([]);

    useEffect(() => {
        const calendarElement = document.getElementById("Calendar");
        let touchStartTimer;
        let isLongPress = false;

        const handleTouchStart = (event) => {
            touchStartTimer = setTimeout(() => {
                isLongPress = true;
                if (event.target.closest("#Calendar")) {
                    document.body.style.overflow = "hidden";
                }
            }, 500);
        };

        const handleTouchMove = (event) => {
            if (isLongPress) {
                event.preventDefault();
            }
        };

        const handleTouchEnd = () => {
            clearTimeout(touchStartTimer);
            document.body.style.overflow = "";
            isLongPress = false;
        };

        if (calendarElement) {
            calendarElement.addEventListener("touchstart", handleTouchStart, { passive: false });
            calendarElement.addEventListener("touchmove", handleTouchMove, { passive: false });
            calendarElement.addEventListener("touchend", handleTouchEnd);
            calendarElement.addEventListener("touchcancel", handleTouchEnd);
        }

        return () => {
            if (calendarElement) {
                calendarElement.removeEventListener("touchstart", handleTouchStart);
                calendarElement.removeEventListener("touchmove", handleTouchMove);
                calendarElement.removeEventListener("touchend", handleTouchEnd);
                calendarElement.removeEventListener("touchcancel", handleTouchEnd);
            }
        };
    }, []);

    useEffect(() => {
        eventBus.on("requestSetTimetableIndex", () => {
            eventBus.emit("setTimetableIndex", setCurrentTimetableIndex);
        });

        return () => {
            eventBus.off("requestSetTimetableIndex");
        };
    }, []);


    useEffect(() => {
        timetablesRef.current = timetables;
    }, [timetables]);

    useEffect(() => {
        currentTimetableIndexRef.current = currentTimetableIndex;
    }, [currentTimetableIndex]);

    useEffect(() => {
        courseColorsRef.current = courseColors;
        updateCalendarEvents();
    }, [courseColors]);

    useEffect(() => {
        updateCalendarEvents();
    }, [currentTimetableIndex, timetables]);

    useEffect(() => {
        if (selectedDuration) {
            handleCalendarViewClick(selectedDuration);
        }
    }, [selectedDuration]);

    useEffect(() => {
        setCalendarUpdateHandler(() => updateCalendarEvents);
    }, []);

    useEffect(() => {
        const handleTruncation = (status) => {
            setIsTruncated(status);
        };
        eventBus.on("truncation", handleTruncation);
        return () => {
            eventBus.off("truncation", handleTruncation);
        };
    }, []);

    useEffect(() => {
        const handleTimeslotsOverridden = (status) => {
            setTimeslotsOverridden(status);
        };
        eventBus.on("overridden", handleTimeslotsOverridden);
        return () => {
            eventBus.off("overridden", handleTimeslotsOverridden);
        };
    }, []);

    const handleLast = useCallback(() => {
        setCurrentTimetableIndex(timetables.length - 1);
    }, [timetables.length]);

    // Check if any courses have weekend classes
    const checkForWeekendClasses = useCallback((timetable) => {
        if (!timetable || !timetable.courses) {
            return false;
        }
        
        for (const course of timetable.courses) {
            const { mainComponents, secondaryComponents } = course;
            
            // Check main components
            if (mainComponents) {
                for (const component of mainComponents) {
                    if (component.schedule.days && 
                        (component.schedule.days.includes('S') || 
                         component.schedule.days.includes('U'))) {
                        return true;
                    }
                }
            }
            
            // Check secondary components
            if (secondaryComponents) {
                const { lab, tutorial, seminar } = secondaryComponents;
                
                if (lab && lab.schedule.days && 
                    (lab.schedule.days.includes('S') || 
                     lab.schedule.days.includes('U'))) {
                    return true;
                }
                
                if (tutorial && tutorial.schedule.days && 
                    (tutorial.schedule.days.includes('S') || 
                     tutorial.schedule.days.includes('U'))) {
                    return true;
                }
                
                if (seminar && seminar.schedule.days && 
                    (seminar.schedule.days.includes('S') || 
                     seminar.schedule.days.includes('U'))) {
                    return true;
                }
            }
        }
        
        return false;
    }, []);

    const updateCalendarEvents = useCallback(() => {
        const currentTimetables = timetablesRef.current;
        const currentIndex = currentTimetableIndexRef.current;
        const currentColors = {...courseColorsRef.current};

        // Ensure all courses have colors
        if (currentTimetables.length > 0 && currentTimetables[0].courses.length > 0) {
            currentTimetables[0].courses.forEach(course => {
                const courseCode = course.courseCode;
                if (!currentColors[courseCode]) {
                    currentColors[courseCode] = getDefaultColorForCourse(courseCode);
                }
            });
        }

        if (currentIndex >= currentTimetables.length && currentTimetables.length > 0) {
            handleLast();
        }
        if (currentTimetables.length > 0 && currentTimetables[0].courses.length > 0) {
            setNoCourses(false);
            const timetable = currentTimetables[currentIndex];
            
            // Check if any courses have weekend classes
            const hasWeekendClasses = checkForWeekendClasses(timetable);
            setShowWeekends(hasWeekendClasses);
            
            if (previousDuration === selectedDuration.split("-")[2] && JSON.stringify(timetable)) {
                aprioriDurationTimetable = JSON.parse(JSON.stringify(timetable));
            }

            const newEvents = createCalendarEvents(timetable, getDaysOfWeek, currentColors);

            const courseDetails = newEvents
                .filter((event) => event.description)
                .map((event) => {
                    let titleArray = event.title.trim().split(" ");
                    return {
                        name: titleArray[0],
                        instructor: event.description,
                        section: titleArray.pop(),
                        startDate: event.startRecur,
                        endDate: event.endRecur,
                    };
                });

            setCourseDetails(courseDetails);
            setEvents(newEvents);
            setNoTimetablesGenerated(false);
        } else {
            setNoCourses(true);
            const newEvents = createCalendarEvents(null, getDaysOfWeek, currentColors);
            setCourseDetails([]);
            setEvents(newEvents);
            if (Object.keys(getCourseData()).length > 0) {
                enqueueSnackbar(
                    <MultiLineSnackbar message="No valid timetables can be generated! Click the red 'x' icon for more information!" />,
                    {
                        variant: "error",
                    }
                );
                setNoTimetablesGenerated(true);
            }
        }
    }, [getDefaultColorForCourse, enqueueSnackbar, setCourseDetails, setEvents, setNoCourses, setNoTimetablesGenerated, handleLast, checkForWeekendClasses]);

const handleCalendarViewClick = (durationLabel) => {
    const calendarApi = calendarRef.current.getApi();
    const [startUnix, endUnix, duration] = durationLabel.split("-");
    
    const startDate = new Date(parseInt(startUnix) * 1000);
    calendarApi.gotoDate(startDate);
    
    if (previousDuration == null) {
        previousDuration = duration;
    } else if (previousDuration !== duration) {
        if (aprioriDurationTimetable && aprioriDurationTimetable.courses) {
            const pinnedComponents = getPinnedComponents();
            let didPinNewComponent = false;

            aprioriDurationTimetable.courses.forEach((course) => {
                const courseCode = course.courseCode;

                if (course.mainComponents) {
                    course.mainComponents.forEach((component) => {
                        if (component.schedule && component.schedule.duration == previousDuration) {
                            const pinString = `${courseCode} MAIN ${component.id}`;
                            if (!pinnedComponents.includes(pinString)) {
                                addPinnedComponent(pinString);
                                didPinNewComponent = true;
                            }
                        }
                    });
                }

                if (course.secondaryComponents) {
                    Object.entries(course.secondaryComponents).forEach(([type, component]) => {
                        if (component && component.schedule && component.schedule.duration == previousDuration) {
                            const formattedType =
                                type.toLowerCase() === "tutorial" ? "TUT" :
                                type.toLowerCase() === "seminar" ? "SEM" :
                                type.toUpperCase();

                            const pinString = `${courseCode} ${formattedType} ${component.id}`;
                            if (!pinnedComponents.includes(pinString)) {
                                addPinnedComponent(pinString);
                                didPinNewComponent = true;
                            }
                        }
                    });
                }
            });

            previousDuration = duration;
            setCurrentTimetableIndex(0);
            if (didPinNewComponent) {
                generateTimetables(sortOption);
                setTimetables(getValidTimetables());
            }
        }
    }
    
    setSelectedDuration(durationLabel);
    enqueueSnackbar(
        <MultiLineSnackbar
            message={"Calendar View: " + startDate.toLocaleString("default", { month: "long", year: "numeric" })}
        />,
        {
            variant: "info",
        }
    );
};

    const handleEventClick = (clickInfo) => {
        if (!clickInfo.event.extendedProps.isBlocked) {
            const split = clickInfo.event.title.split(" ");
            const courseCode = split[0];
            if (split[1] !== "TUT" && split[1] !== "LAB" && split[1] !== "SEM") {
                split[1] = "MAIN";
            }

            const pinnedComponents = getPinnedComponents();
            /*
            NOTE: substring(0,6) is used as ID's are 6 characters long.

            If there are multiple main components (such as two LECs) the 
            additional main components will have and index counter extension
            which is what the substring is trying to strip for the purpose
            of pinning.
            */
            if (pinnedComponents.includes(courseCode + " " + split[1] + " " + clickInfo.event.id.substring(0, 6))) {
                removePinnedComponent(courseCode + " " + split[1] + " " + clickInfo.event.id.substring(0, 6));
            } else {
                addPinnedComponent(courseCode + " " + split[1] + " " + clickInfo.event.id.substring(0, 6));
            }
        } else {
            const blockId = clickInfo.event.id.replace('block-', '');
            const blockEvent = getTimeBlockEvents().find((block) => block.id === blockId);

            if (blockEvent) {
                const slotStart =
                    (parseInt(blockEvent.startTime.split(":")[0]) - 8) * 2 +
                    parseInt(blockEvent.startTime.split(":")[1]) / 30;
                const slotEnd =
                    (parseInt(blockEvent.endTime.split(":")[0]) - 8) * 2 +
                    parseInt(blockEvent.endTime.split(":")[1]) / 30;
                const slotsToUnblock = [];

                for (let i = slotStart; i < slotEnd; i++) {
                    slotsToUnblock.push(i);
                }

                const unblockedSlots = {
                    [blockEvent.daysOfWeek.trim()]: slotsToUnblock,
                };
                setOpenTimeSlots(unblockedSlots);
                removeTimeBlockEvent(blockId);
            }
        }
        setCurrentTimetableIndex(0);
        generateTimetables(sortOption);
        setTimetables(getValidTimetables());
    };

    const handleNext = () => {
        setCurrentTimetableIndex((currentTimetableIndex + 1) % timetables.length);
    };

    const handlePrevious = () => {
        setCurrentTimetableIndex((currentTimetableIndex - 1 + timetables.length) % timetables.length);
    };

    const handleFirst = () => {
        setCurrentTimetableIndex(0);
    };

    const handleSelect = (selectInfo) => {
        const startDateTime = new Date(selectInfo.startStr);
        const endDateTime = new Date(selectInfo.endStr);
        const startTime = startDateTime.getHours() + ":" + (startDateTime.getMinutes() || "00");
        const endTime = endDateTime.getHours() + ":" + (endDateTime.getMinutes() || "00");
        const slotStart = (startDateTime.getHours() - 8) * 2 + startDateTime.getMinutes() / 30;
        const slotEnd = (endDateTime.getHours() - 8) * 2 + endDateTime.getMinutes() / 30;

        const dayMapping = {
            Mon: "M",
            Tue: "T",
            Wed: "W",
            Thu: "R",
            Fri: "F",
            Sat: "S",
            Sun: "U"
        };

        // Get all days between start and end date
        const days = [];
        let currentDate = new Date(startDateTime);
        while (currentDate <= endDateTime) {
            const dayName = currentDate.toLocaleString("en-US", { weekday: "short" });
            if (dayMapping[dayName]) {
                days.push(dayMapping[dayName]);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (days.length > 0) {
            const slotsToBlock = [];
            for (let i = slotStart; i <= slotEnd - 1; i++) {
                slotsToBlock.push(i);
            }

            // Handle each day separately
            days.forEach(day => {
                const existingBlocks = getTimeBlockEvents();
                let combinedSlotStart = slotStart;
                let combinedSlotEnd = slotEnd;
                let blocksToRemove = [];

                for (let block of existingBlocks) {
                    if (block.daysOfWeek.trim() === day) {
                        const existingStartParts = block.startTime.split(":");
                        const existingSlotStart =
                            (parseInt(existingStartParts[0]) - 8) * 2 + parseInt(existingStartParts[1]) / 30;
                        const existingEndParts = block.endTime.split(":");
                        const existingSlotEnd =
                            (parseInt(existingEndParts[0]) - 8) * 2 + parseInt(existingEndParts[1]) / 30;

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

                const combinedSlotsObject = { [day]: combinedSlots };
                setBlockedTimeSlots(combinedSlotsObject);

                for (let blockId of blocksToRemove) {
                    removeTimeBlockEvent(blockId);
                }

                const blockId = Date.now().toString() + "-" + day;
                const block = {
                    id: blockId,
                    daysOfWeek: day,
                    startTime: `${Math.floor(combinedSlotStart / 2) + 8}:${combinedSlotStart % 2 === 0 ? "00" : "30"}`,
                    endTime: `${Math.floor(combinedSlotEnd / 2) + 8}:${combinedSlotEnd % 2 === 0 ? "00" : "30"}`,
                    startRecur: "1970-01-01",
                    endRecur: "9999-12-31",
                };
                addTimeBlockEvent(block);
            });
            setCurrentTimetableIndex(0);
            generateTimetables(sortOption);
            setTimetables(getValidTimetables());
        }
    };

    const handleSelectAllow = (selectionInfo) => {
        return true; 
    };

    const handleCloseTruncationDialog = () => {
        setTruncationDialogOpen(false);
    };
    const handleCloseNoTimetablesDialog = () => {
        setNoTimetablesDialogOpen(false);
    };
    const handleCloseBlockedSlotsDialog = () => {
        setTimeslotsOverriddenDialogOpen(false);
    };

    function sortByBracketContent(arr) {
        return arr.sort((a, b) => {
            const indexA = a.indexOf("(");
            const indexB = b.indexOf("(");

            const substringA = a.slice(indexA);
            const substringB = b.slice(indexB);

            return substringA.localeCompare(substringB);
        });
    }

    const renderEventContent = (eventInfo) => {
        // Calculate the event duration in minutes
        const startTime = eventInfo.event.start;
        const endTime = eventInfo.event.end;
        const eventDuration = (endTime - startTime) / (1000 * 60); // Duration in minutes

        // Set the threshold for showing the time (90 minutes)
        const minDurationToShowTime = 90;

        if (eventInfo.event.extendedProps.isBlocked) {
            return (
                <div style={{ position: "relative", height: "100%", textAlign: "center" }}>
                    {eventDuration >= minDurationToShowTime && (
                        <div style={{ position: "absolute", top: "2px", left: "2px" }}>
                            <b>{eventInfo.timeText}</b>
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <span style={{ fontSize: "2rem" }}>
                            <BlockIcon />
                        </span>
                    </div>
                </div>
            );
        } else {
            const isPinned = isEventPinned(eventInfo.event);

            return (
                <div
                    style={{
                        position: "relative",
                        backgroundColor: isPinned ? "rgba(0, 0, 0, 0.5)" : "transparent",
                        height: "100%",
                        padding: "2px",
                        borderRadius: "4px", // Add this line to fix border-radius issue
                    }}
                >
                    {eventDuration >= minDurationToShowTime && (
                        <div style={{ position: "absolute", top: "2px", left: "2px" }}>
                            <b>{eventInfo.timeText}</b>
                        </div>
                    )}
                    {isPinned && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0.25,
                                fontSize: "4rem",
                            }}
                        >
                            <PinIcon />
                        </div>
                    )}
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <b>{eventInfo.timeText}</b>
                        <br />
                        <span>{eventInfo.event.title}</span>
                        <br />
                        <span>{eventInfo.event.extendedProps.description}</span>
                    </div>
                </div>
            );
        }
    };

    // Function to navigate the calendar to a specific date
    const navigateToDate = useCallback((date) => {
        if (calendarRef.current && calendarRef.current.getApi) {
            try {
                const calendarApi = calendarRef.current.getApi();
                calendarApi.gotoDate(date);
            } catch (error) {
                // Error handling silently ignored
            }
        }
    }, [calendarRef]);

    useEffect(() => {
        try {
            const currentTimetable = timetables && timetables.length > 0 && currentTimetableIndex < timetables.length ? 
                timetables[currentTimetableIndex] : null;
                
            const coursesData = getCourseData();
            const courses = [];
            
            if (coursesData && Object.keys(coursesData).length > 0) {
                for (const key of Object.keys(coursesData)) {
                    const course = coursesData[key];
                    
                    if (course.courseCode) {
                        let sectionInfo = '';
                        let durationInfo = '';
                        let startDate = '';
                        let endDate = '';
                        
                        if (course.sections && course.sections.length > 0) {
                            const section = course.sections[0];
                            if (section.sectionNumber) {
                                sectionInfo = section.sectionNumber;
                            }
                            
                            if (section.schedule) {
                                if (section.schedule.duration) {
                                    durationInfo = section.schedule.duration;
                                }
                                
                                if (section.schedule.startDate) {
                                    startDate = section.schedule.startDate;
                                }
                                
                                if (section.schedule.endDate) {
                                    endDate = section.schedule.endDate;
                                }
                            }
                        }
                        
                        const courseStr = `${course.courseCode} ${sectionInfo} (${durationInfo})`;
                        
                        const courseObject = {
                            string: courseStr,
                            code: course.courseCode,
                            section: sectionInfo,
                            duration: durationInfo,
                            startDate: startDate,
                            endDate: endDate
                        };
                        
                        courses.push(courseObject);
                    } else if (course.code) {
                        const courseStr = `${course.code} ${course.section || ''} (${course.duration || ''})`;
                        
                        const courseObject = {
                            string: courseStr,
                            code: course.code,
                            section: course.section || '',
                            duration: course.duration || '',
                            startDate: course.startDate || '',
                            endDate: course.endDate || ''
                        };
                        
                        courses.push(courseObject);
                    }
                }
            }
            
            if (currentTimetable && Array.isArray(currentTimetable)) {
                const addedCourseCodes = new Set(courses.map(c => c.code));
                
                currentTimetable.forEach(component => {
                    if (component && component.courseCode) {
                        if (!addedCourseCodes.has(component.courseCode)) {
                            const courseStr = `${component.courseCode} ${component.section || ''} (${component.duration || ''})`;
                            
                            const courseObject = {
                                string: courseStr,
                                code: component.courseCode,
                                section: component.section || '',
                                duration: component.duration || '',
                                startDate: component.startDate || '',
                                endDate: component.endDate || ''
                            };
                            
                            courses.push(courseObject);
                            addedCourseCodes.add(component.courseCode);
                        }
                    }
                });
            }
            
            setCoursesForTimeline(courses.filter(Boolean));
        } catch (error) {
            setCoursesForTimeline([]);
        }
    }, [timetables, currentTimetableIndex]);

    return (
        <div id="Calendar">
        <BorderBox title="Calendar">
            {/* Course Timeline Visualization - moved to the very top */}
            <CourseTimelineComponent 
                addedCourses={coursesForTimeline} 
                setSelectedDuration={setSelectedDuration}
                durations={durations}
                navigateToDate={navigateToDate}
                selectedDuration={selectedDuration}
            />
            
            <CalendarNavBar
                isTruncated={isTruncated}
                noTimetablesGenerated={noTimetablesGenerated}
                timeslotsOverridden={timeslotsOverridden}
                handleFirst={handleFirst}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                handleLast={handleLast}
                currentTimetableIndex={currentTimetableIndex}
                timetables={timetables}
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                durations={durations}
                noCourses={noCourses}
                sortByBracketContent={sortByBracketContent}
                setTruncationDialogOpen={setTruncationDialogOpen}
                setNoTimetablesDialogOpen={setNoTimetablesDialogOpen}
                setTimeslotsOverriddenDialogOpen={setTimeslotsOverriddenDialogOpen}
            />
            
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                weekends={showWeekends}
                headerToolbar={false}
                height={835}
                dayHeaderFormat={{ weekday: "short" }}
                dayCellClassNames={(arg) => (arg.date.getDay() === new Date().getDay() ? "fc-day-today" : "")}
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
                longPressDelay={0}
                selectLongPressDelay={500}
                firstDay={1}
                events={events}
            />
            
            <TruncationDialog
                truncationDialogOpen={truncationDialogOpen}
                handleCloseTruncationDialog={handleCloseTruncationDialog}
            />
            <NoTimetablesDialog
                noTimetablesDialogOpen={noTimetablesDialogOpen}
                handleCloseNoTimetablesDialog={handleCloseNoTimetablesDialog}
            />
            <BlockedSlotsDialog
                timeslotsOverriddenDialogOpen={timeslotsOverriddenDialogOpen}
                handleCloseBlockedSlotsDialog={handleCloseBlockedSlotsDialog}
            />
        </BorderBox>
        </div>
    );
}
