import React, { useState, useEffect, useContext, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTheme } from "@mui/material/styles";
import CalendarNavBar from "./CalendarNavBar";
import BorderBox from "../UI/BorderBox";
import CourseTimelineComponent from "./CourseTimelineComponent";
import { CalendarDialogs } from "./components/CalendarDialogs";
import "../../css/Calendar.css";
import "../../css/CustomCalendar.css";
import { CourseDetailsContext } from "../../contexts/CourseDetailsContext";
import eventBus from "../../../SiteWide/Buses/eventBus";
import { CourseColorsContext } from "../../contexts/CourseColorsContext";
import { useCalendarEventHandlers } from "./hooks/useCalendarEventHandlers";
import { useTimetableManagement } from "./hooks/useTimetableManagement.jsx";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import {
  renderEventContent,
  prepareCoursesForTimeline,
  sortByBracketContent,
} from "./utils/calendarUtils.jsx";
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
  const calendarRef = React.useRef(null);
  const [events, setEvents] = useState([]);
  const [currentTimetableIndex, setCurrentTimetableIndex] = useState(0);
  const theme = useTheme();
  const { setCourseDetails } = useContext(CourseDetailsContext);
  const { courseColors, setCalendarUpdateHandler, getDefaultColorForCourse } =
    useContext(CourseColorsContext);
  const [isTruncated, setIsTruncated] = useState(false);
  const [truncationDialogOpen, setTruncationDialogOpen] = useState(false);
  const [noTimetablesGenerated, setNoTimetablesGenerated] = useState(false);
  const [noTimetablesDialogOpen, setNoTimetablesDialogOpen] = useState(false);
  const [noCourses, setNoCourses] = useState(true);
  const [timeslotsOverridden, setTimeslotsOverridden] = useState(false);
  const [timeslotsOverriddenDialogOpen, setTimeslotsOverriddenDialogOpen] =
    useState(false);
  const [showWeekends, setShowWeekends] = useState(false);
  const [coursesForTimeline, setCoursesForTimeline] = useState([]);

  const {
    handleNext,
    handlePrevious,
    handleFirst,
    handleLast,
    handleCalendarViewClick,
    setAprioriDurationTimetable,
  } = useTimetableManagement({
    timetables,
    setTimetables,
    currentTimetableIndex,
    setCurrentTimetableIndex,
    selectedDuration,
    setSelectedDuration,
    sortOption,
    calendarRef,
  });

  const { handleEventClick, handleSelect, handleSelectAllow } =
    useCalendarEventHandlers({
      setCurrentTimetableIndex,
      setTimetables,
      sortOption,
    });

  const {
    updateCalendarEvents,
    updateRefs,
    timetablesRef,
    currentTimetableIndexRef,
    courseColorsRef,
  } = useCalendarEvents({
    timetables,
    currentTimetableIndex,
    courseColors,
    getDefaultColorForCourse,
    setCourseDetails,
    setEvents,
    setNoCourses,
    setNoTimetablesGenerated,
    setShowWeekends,
    handleLast,
  });

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
      calendarElement.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      calendarElement.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
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
    updateRefs();
  }, [updateRefs]);

  useEffect(() => {
    updateCalendarEvents();
  }, [courseColors, currentTimetableIndex, timetables, updateCalendarEvents]);

  useEffect(() => {
    if (selectedDuration) {
      handleCalendarViewClick(selectedDuration);
    }
  }, [selectedDuration, handleCalendarViewClick]);

  useEffect(() => {
    setCalendarUpdateHandler(() => updateCalendarEvents);
  }, [updateCalendarEvents, setCalendarUpdateHandler]);

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

  // Function to navigate the calendar to a specific date
  const navigateToDate = useCallback(
    (date) => {
      if (calendarRef.current && calendarRef.current.getApi) {
        try {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.gotoDate(date);
        } catch (error) {
          // Error handling silently ignored
        }
      }
    },
    [calendarRef]
  );

  useEffect(() => {
    const courses = prepareCoursesForTimeline(
      timetables,
      currentTimetableIndex
    );
    setCoursesForTimeline(courses);

    // Set apriori duration timetable for pinning logic
    if (timetables.length > 0 && currentTimetableIndex < timetables.length) {
      const currentTimetable = timetables[currentTimetableIndex];
      const currentDuration = selectedDuration
        ? selectedDuration.split("-")[2]
        : null;
      if (currentDuration) {
        setAprioriDurationTimetable(currentTimetable, currentDuration);
      }
    }
  }, [
    timetables,
    currentTimetableIndex,
    selectedDuration,
    setAprioriDurationTimetable,
  ]);

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
          dayCellClassNames={(arg) =>
            arg.date.getDay() === new Date().getDay() ? "fc-day-today" : ""
          }
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

        <CalendarDialogs
          truncationDialogOpen={truncationDialogOpen}
          setTruncationDialogOpen={setTruncationDialogOpen}
          noTimetablesDialogOpen={noTimetablesDialogOpen}
          setNoTimetablesDialogOpen={setNoTimetablesDialogOpen}
          timeslotsOverriddenDialogOpen={timeslotsOverriddenDialogOpen}
          setTimeslotsOverriddenDialogOpen={setTimeslotsOverriddenDialogOpen}
        />
      </BorderBox>
    </div>
  );
}
