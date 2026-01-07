import React, { useState, useEffect, useContext, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import { useSnackbar } from "notistack";
import CalendarNavBar from "./CalendarNavBar";
import BorderBox from "../UI/BorderBox";
import { CalendarDialogs } from "./components/CalendarDialogs";
import CourseTimelineComponent from "./CourseTimelineComponent";
import RenameBlockedSlotDialog from "../Dialogs/RenameBlockedSlotDialog";
import "../../css/Calendar.css";
import "../../css/CustomCalendar.css";
import {
  createCalendarEvents,
  getDaysOfWeek,
  getTimeBlockEvents,
} from "../../scripts/createCalendarEvents";
import { getCourseData } from "../../scripts/courseData";
import { CourseDetailsContext } from "../../contexts/CourseDetailsContext";
import { CourseColorsContext } from "../../contexts/CourseColorsContext";
import {
  sortByBracketContent,
  checkForWeekendClasses,
} from "./utils/calendarUtils.jsx";
import {
  handleCourseComponentClick,
  handleTimeBlockRemoval,
  handleCalendarSelection,
  handleBlockedSlotRename,
} from "./utils/eventHandlerUtils.js";
import { useTouchEvents } from "./hooks/useTouchEvents.js";
import { useEventBusHandlers } from "./hooks/useEventBusHandlers.js";
import { prepareCoursesForTimeline } from "./utils/courseTimelineUtils.js";
import {
  calculateNavigationDate,
  handleDurationChange,
  getCalendarViewNotificationMessage,
} from "./utils/calendarViewUtils.js";
import { getFullCalendarConfig } from "./utils/calendarConfigUtils.js";
import MultiLineSnackbar from "../../../SiteWide/components/MultiLineSnackbar";
import { useIsMobile } from "../../../SiteWide/utils/screenSizeUtils";
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
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [blockToRename, setBlockToRename] = useState(null);
  const [renameAnchorEl, setRenameAnchorEl] = useState(null);
  const [renameAnchorPosition, setRenameAnchorPosition] = useState(null);
  const [coursesForTimeline, setCoursesForTimeline] = useState([]);

  // Screen size detection
  const isMobile = useIsMobile();

  // Touch event handling
  useTouchEvents();

  // Event bus handling
  useEventBusHandlers({
    setCurrentTimetableIndex,
    setIsTruncated,
    setTimeslotsOverridden,
  });

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

  const handleLast = useCallback(() => {
    setCurrentTimetableIndex(timetables.length - 1);
  }, [timetables.length]);

  const updateCalendarEvents = useCallback(() => {
    const currentTimetables = timetablesRef.current;
    const currentIndex = currentTimetableIndexRef.current;
    const currentColors = { ...courseColorsRef.current };

    // Ensure all courses have colors
    if (
      currentTimetables.length > 0 &&
      currentTimetables[0].courses.length > 0
    ) {
      currentTimetables[0].courses.forEach((course) => {
        const courseCode = course.courseCode;
        if (!currentColors[courseCode]) {
          currentColors[courseCode] = getDefaultColorForCourse(courseCode);
        }
      });
    }

    if (
      currentIndex >= currentTimetables.length &&
      currentTimetables.length > 0
    ) {
      handleLast();
    }
    if (
      currentTimetables.length > 0 &&
      currentTimetables[0].courses.length > 0
    ) {
      setNoCourses(false);
      const timetable = currentTimetables[currentIndex];

      // Check if any courses have weekend classes
      const hasWeekendClasses = checkForWeekendClasses(timetable);
      setShowWeekends(hasWeekendClasses);

      if (
        previousDuration === selectedDuration.split("-")[2] &&
        JSON.stringify(timetable)
      ) {
        aprioriDurationTimetable = JSON.parse(JSON.stringify(timetable));
      }

      const newEvents = createCalendarEvents(
        timetable,
        getDaysOfWeek,
        currentColors,
      );

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
      previousDuration = null;
      aprioriDurationTimetable = null;
      const newEvents = createCalendarEvents(
        null,
        getDaysOfWeek,
        currentColors,
      );
      setCourseDetails([]);
      setEvents(newEvents);
      if (Object.keys(getCourseData()).length > 0) {
        setNoTimetablesGenerated(true);
      }
    }
  }, [
    getDefaultColorForCourse,
    enqueueSnackbar,
    setCourseDetails,
    setEvents,
    setNoCourses,
    setNoTimetablesGenerated,
    handleLast,
  ]);

  const handleCalendarViewClick = (durationLabel) => {
    const calendarApi = calendarRef.current.getApi();
    const [startUnix, endUnix, duration] = durationLabel.split("-");

    const startDate = new Date(parseInt(startUnix) * 1000);
    const navigationDate = calculateNavigationDate(startDate);
    calendarApi.gotoDate(navigationDate);

    if (previousDuration == null) {
      previousDuration = duration;
    } else {
      handleDurationChange(
        previousDuration,
        duration,
        aprioriDurationTimetable,
        setCurrentTimetableIndex,
        setTimetables,
        sortOption,
      );
      previousDuration = duration;
    }

    setSelectedDuration(durationLabel);

    // Show calendar view notification
    const message = getCalendarViewNotificationMessage(startDate);
    enqueueSnackbar(<MultiLineSnackbar message={message} />, {
      variant: "info",
    });
  };

  const [shiftHeld, setShiftHeld] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Shift") {
        setShiftHeld(true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === "Shift") {
        setShiftHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (hoveredElement) {
      const event = hoveredElement._fcEvent;
      if (event && event.extendedProps && event.extendedProps.isBlocked) {
        if (shiftHeld) {
          hoveredElement.style.setProperty("cursor", "text", "important");
          hoveredElement.classList.add("rename-mode");

          const eventMain = hoveredElement.querySelector(".fc-event-main");
          if (eventMain) {
            eventMain.style.setProperty("cursor", "text", "important");
          }
        } else {
          hoveredElement.style.removeProperty("cursor");
          hoveredElement.classList.remove("rename-mode");

          const eventMain = hoveredElement.querySelector(".fc-event-main");
          if (eventMain) {
            eventMain.style.removeProperty("cursor");
          }
        }
      }
    }
  }, [shiftHeld, hoveredElement]);

  const handleEventMouseEnter = (mouseEnterInfo) => {
    setHoveredElement(mouseEnterInfo.el);
    mouseEnterInfo.el._fcEvent = mouseEnterInfo.event;

    if (mouseEnterInfo.event.extendedProps.isBlocked) {
      if (shiftHeld) {
        mouseEnterInfo.el.style.setProperty("cursor", "text", "important");
        mouseEnterInfo.el.classList.add("rename-mode");

        const eventMain = mouseEnterInfo.el.querySelector(".fc-event-main");
        if (eventMain) {
          eventMain.style.setProperty("cursor", "text", "important");
        }
      }
    }
  };

  const handleEventMouseLeave = (mouseLeaveInfo) => {
    setHoveredElement(null);
    delete mouseLeaveInfo.el._fcEvent;

    mouseLeaveInfo.el.style.removeProperty("cursor");
    mouseLeaveInfo.el.classList.remove("rename-mode");

    const eventMain = mouseLeaveInfo.el.querySelector(".fc-event-main");
    if (eventMain) {
      eventMain.style.removeProperty("cursor");
    }
  };

  const handleEventClick = (clickInfo) => {
    // Handle shift+click for quick rename
    if (clickInfo.jsEvent && clickInfo.jsEvent.shiftKey) {
      if (clickInfo.event.extendedProps.isBlocked) {
        const blockId = clickInfo.event.id.replace("block-", "");
        const blockEvent = getTimeBlockEvents().find(
          (block) => block.id === blockId,
        );
        if (blockEvent) {
          setBlockToRename({
            id: blockId,
            title: blockEvent.title,
            isMultipleBlocks: false,
          });
          const anchorElement =
            clickInfo.el ||
            clickInfo.jsEvent?.target ||
            document.querySelector(".fc-view-harness");
          setRenameAnchorEl(anchorElement);
          setRenameAnchorPosition(null);
          setRenameDialogOpen(true);
        }
      }
      return;
    }

    // Normal click handling
    if (!clickInfo.event.extendedProps.isBlocked) {
      handleCourseComponentClick(
        clickInfo,
        setCurrentTimetableIndex,
        setTimetables,
        sortOption,
      );
    } else {
      handleTimeBlockRemoval(
        clickInfo,
        setCurrentTimetableIndex,
        setTimetables,
        sortOption,
      );
    }
  };

  const handleNext = () => {
    setCurrentTimetableIndex((currentTimetableIndex + 1) % timetables.length);
  };

  const handleRenameDialogClose = () => {
    setRenameDialogOpen(false);
    setBlockToRename(null);
    setRenameAnchorEl(null);
    setRenameAnchorPosition(null);
  };

  const handleRenameSave = (newTitle) => {
    if (blockToRename) {
      if (blockToRename.ids && blockToRename.ids.length > 0) {
        blockToRename.ids.forEach((blockId) => {
          handleBlockedSlotRename(
            blockId,
            newTitle,
            setCurrentTimetableIndex,
            setTimetables,
            sortOption,
          );
        });
      } else if (blockToRename.id) {
        handleBlockedSlotRename(
          blockToRename.id,
          newTitle,
          setCurrentTimetableIndex,
          setTimetables,
          sortOption,
        );
      }
      setBlockToRename(null);
    }
  };

  const handlePrevious = () => {
    setCurrentTimetableIndex(
      (currentTimetableIndex - 1 + timetables.length) % timetables.length,
    );
  };

  const handleFirst = () => {
    setCurrentTimetableIndex(0);
  };

  const handleSelect = (selectInfo) => {
    handleCalendarSelection(
      selectInfo,
      setCurrentTimetableIndex,
      setTimetables,
      sortOption,
      setRenameDialogOpen,
      setBlockToRename,
      setRenameAnchorEl,
      setRenameAnchorPosition,
    );
  };

  const handleSelectAllow = (selectionInfo) => {
    return true;
  };

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
    [calendarRef],
  );

  // Prepare courses for timeline
  useEffect(() => {
    const courses = prepareCoursesForTimeline(
      timetables,
      currentTimetableIndex,
    );
    setCoursesForTimeline(courses);
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
          {...getFullCalendarConfig({
            calendarRef,
            showWeekends,
            events,
            handleEventClick,
            handleSelect,
            handleSelectAllow,
            handleEventMouseEnter,
            handleEventMouseLeave,
            isMobile,
          })}
        />

        <CalendarDialogs
          truncationDialogOpen={truncationDialogOpen}
          setTruncationDialogOpen={setTruncationDialogOpen}
          noTimetablesDialogOpen={noTimetablesDialogOpen}
          setNoTimetablesDialogOpen={setNoTimetablesDialogOpen}
          timeslotsOverriddenDialogOpen={timeslotsOverriddenDialogOpen}
          setTimeslotsOverriddenDialogOpen={setTimeslotsOverriddenDialogOpen}
        />

        <RenameBlockedSlotDialog
          open={renameDialogOpen}
          onClose={handleRenameDialogClose}
          onSave={handleRenameSave}
          currentTitle={blockToRename?.title || ""}
          isCreating={!blockToRename?.title}
          isMultipleBlocks={blockToRename?.isMultipleBlocks || false}
          anchorEl={renameAnchorEl}
          forceAnchorPosition={renameAnchorPosition}
        />
      </BorderBox>
    </div>
  );
}
