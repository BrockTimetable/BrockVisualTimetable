import { useState, useEffect, useContext, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import { toast } from "sonner";
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
  const calendarRef = useRef(null);
  const timetablesRef = useRef(timetables);
  const currentTimetableIndexRef = useRef(0);
  const courseColorsRef = useRef({});
  const getDefaultColorForCourseRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [currentTimetableIndex, setCurrentTimetableIndex] = useState(0);
  const { setCourseDetails } = useContext(CourseDetailsContext);
  const { courseColors, setCalendarUpdateHandler, getDefaultColorForCourse } =
    useContext(CourseColorsContext);

  useEffect(() => {
    getDefaultColorForCourseRef.current = getDefaultColorForCourse;
  }, [getDefaultColorForCourse]);
  const [isTruncated, setIsTruncated] = useState(false);
  const [truncationDialogOpen, setTruncationDialogOpen] = useState(false);
  const [noTimetablesGenerated, setNoTimetablesGenerated] = useState(false);
  const [noTimetablesDialogOpen, setNoTimetablesDialogOpen] = useState(false);
  const [timeslotsOverridden, setTimeslotsOverridden] = useState(false);
  const [timeslotsOverriddenDialogOpen, setTimeslotsOverriddenDialogOpen] =
    useState(false);
  const [showWeekends, setShowWeekends] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [blockToRename, setBlockToRename] = useState(null);
  const [renameAnchorEl, setRenameAnchorEl] = useState(null);
  const [renameAnchorPosition, setRenameAnchorPosition] = useState(null);
  const [coursesForTimeline, setCoursesForTimeline] = useState([]);

  const isMobile = useIsMobile();

  useTouchEvents();

  useEventBusHandlers({
    setCurrentTimetableIndex,
    setIsTruncated,
    setTimeslotsOverridden,
  });

  const timetablesLengthRef = useRef(timetables.length);
  useEffect(() => {
    timetablesLengthRef.current = timetables.length;
  }, [timetables.length]);

  const handleLast = useCallback(() => {
    setCurrentTimetableIndex(timetablesLengthRef.current - 1);
  }, []);

  const updateCalendarEvents = useCallback(() => {
    const currentTimetables = timetablesRef.current;
    const currentIndex = currentTimetableIndexRef.current;
    const currentColors = { ...courseColorsRef.current };

    if (
      currentTimetables.length > 0 &&
      currentTimetables[0].courses.length > 0
    ) {
      currentTimetables[0].courses.forEach((course) => {
        const courseCode = course.courseCode;
        if (!currentColors[courseCode] && getDefaultColorForCourseRef.current) {
          currentColors[courseCode] =
            getDefaultColorForCourseRef.current(courseCode);
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
      const timetable = currentTimetables[currentIndex];

      const hasWeekendClasses = checkForWeekendClasses(timetable);
      setShowWeekends(hasWeekendClasses);

      if (
        selectedDurationRef.current &&
        previousDuration === selectedDurationRef.current.split("-")[2] &&
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
  }, []);

  const selectedDurationRef = useRef(selectedDuration);
  useEffect(() => {
    selectedDurationRef.current = selectedDuration;
  }, [selectedDuration]);

  const handleCalendarViewClick = useCallback(
    (durationLabel) => {
      const calendarApi = calendarRef.current.getApi();
      const [startUnix, , duration] = durationLabel.split("-");

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

      // Only update if different to prevent infinite loop
      if (selectedDurationRef.current !== durationLabel) {
        setSelectedDuration(durationLabel);
      }

      const message = getCalendarViewNotificationMessage(startDate);
      toast.info(<MultiLineSnackbar message={message} />);
    },
    [
      calendarRef,
      setCurrentTimetableIndex,
      setTimetables,
      setSelectedDuration,
      sortOption,
    ],
  );

  useEffect(() => {
    timetablesRef.current = timetables;
  }, [timetables]);

  useEffect(() => {
    currentTimetableIndexRef.current = currentTimetableIndex;
  }, [currentTimetableIndex]);

  useEffect(() => {
    courseColorsRef.current = courseColors;
    updateCalendarEvents();
  }, [courseColors, updateCalendarEvents]);

  useEffect(() => {
    updateCalendarEvents();
  }, [currentTimetableIndex, timetables, updateCalendarEvents]);

  const previousSelectedDurationRef = useRef(null);
  useEffect(() => {
    if (
      selectedDuration &&
      selectedDuration !== previousSelectedDurationRef.current
    ) {
      previousSelectedDurationRef.current = selectedDuration;
      handleCalendarViewClick(selectedDuration);
    }
  }, [selectedDuration, handleCalendarViewClick]);

  useEffect(() => {
    setCalendarUpdateHandler(() => updateCalendarEvents);
  }, [setCalendarUpdateHandler, updateCalendarEvents]);

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
  }, [hoveredElement, shiftHeld]);

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

  const openRenameDialog = useCallback((clickInfo) => {
    const blockId = clickInfo.event.id.replace("block-", "");
    const blockEvent = getTimeBlockEvents().find(
      (block) => block.id === blockId,
    );
    if (!blockEvent) {
      return;
    }
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
  }, []);

  const handleEventClick = useCallback(
    (clickInfo, source = "fc") => {
      const jsEvent = clickInfo.jsEvent;
      const element =
        clickInfo.el ||
        jsEvent?.target?.closest?.(".fc-event") ||
        jsEvent?.currentTarget;
      const isBlocked = Boolean(clickInfo.event?.extendedProps?.isBlocked);
      if (source !== "pointerdown" && element?._btSuppressNextClick) {
        element._btSuppressNextClick = false;
        return;
      }
      if (jsEvent && jsEvent.__btHandled) {
        return;
      }
      if (jsEvent) {
        jsEvent.__btHandled = true;
      }
      if (clickInfo.jsEvent && clickInfo.jsEvent.shiftKey) {
        if (!isBlocked) {
          return;
        }
        openRenameDialog(clickInfo);
        return;
      }

      if (!isBlocked) {
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

      updateCalendarEvents();
    },
    [
      openRenameDialog,
      setCurrentTimetableIndex,
      setTimetables,
      sortOption,
      updateCalendarEvents,
    ],
  );

  const handleEventDidMount = useCallback(
    (mountInfo) => {
      const dispatchClick = (jsEvent, source) => {
        handleEventClick(
          {
            event: mountInfo.event,
            el: mountInfo.el,
            jsEvent,
          },
          source,
        );
      };

      const nativeClickHandler = (jsEvent) => {
        dispatchClick(jsEvent, "native");
      };

      const pointerDownHandler = (jsEvent) => {
        if (jsEvent.button !== undefined && jsEvent.button !== 0) {
          return;
        }
        dispatchClick(jsEvent, "pointerdown");
        mountInfo.el._btSuppressNextClick = true;
      };

      mountInfo.el._btNativeClickHandler = nativeClickHandler;
      mountInfo.el._btPointerDownHandler = pointerDownHandler;
      mountInfo.el.addEventListener("click", nativeClickHandler);
      if (window.PointerEvent) {
        mountInfo.el.addEventListener("pointerdown", pointerDownHandler);
      } else {
        mountInfo.el.addEventListener("mousedown", pointerDownHandler);
      }
    },
    [handleEventClick],
  );

  const handleEventWillUnmount = useCallback((mountInfo) => {
    const nativeClickHandler = mountInfo.el._btNativeClickHandler;
    if (nativeClickHandler) {
      mountInfo.el.removeEventListener("click", nativeClickHandler);
      delete mountInfo.el._btNativeClickHandler;
    }
    const pointerDownHandler = mountInfo.el._btPointerDownHandler;
    if (pointerDownHandler) {
      if (window.PointerEvent) {
        mountInfo.el.removeEventListener("pointerdown", pointerDownHandler);
      } else {
        mountInfo.el.removeEventListener("mousedown", pointerDownHandler);
      }
      delete mountInfo.el._btPointerDownHandler;
    }
  }, []);

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
      handleRenameDialogClose();
    }
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

  const handleSelectAllow = () => true;

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
          handleFirst={() => setCurrentTimetableIndex(0)}
          handlePrevious={() =>
            setCurrentTimetableIndex(
              (currentTimetableIndex - 1 + timetables.length) %
                timetables.length,
            )
          }
          handleNext={handleNext}
          handleLast={() => setCurrentTimetableIndex(timetables.length - 1)}
          currentTimetableIndex={currentTimetableIndex}
          timetables={timetables}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          durations={durations}
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
            handleEventDidMount,
            handleEventWillUnmount,
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
