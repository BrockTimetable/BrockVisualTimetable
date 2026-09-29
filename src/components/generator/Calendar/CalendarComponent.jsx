import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import FullCalendar from "@fullcalendar/react";
import { useSnackbar } from "notistack";
import { CalendarDays, CalendarPlus, Plus } from "lucide-react";
import CalendarNavBar from "./CalendarNavBar";
import MobileTimeBlockSheet from "./MobileTimeBlockSheet";
import BorderBox from "../UI/BorderBox";
import RenameBlockedSlotDialog from "../Dialogs/RenameBlockedSlotDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "@/styles/generator/Calendar.css";
import "@/styles/generator/CustomCalendar.css";
import {
  createCalendarEvents,
  getDaysOfWeek,
  getTimeBlockEvents,
} from "@/lib/generator/createCalendarEvents";
import { buildCourseDetails } from "@/lib/generator/buildCourseDetails";
import { getCourseData } from "@/lib/generator/courseData";
import { CourseDetailsContext } from "@/lib/contexts/generator/CourseDetailsContext";
import { CourseColorsContext } from "@/lib/contexts/generator/CourseColorsContext";
import {
  sortByBracketContent,
  checkForWeekendClasses,
} from "./utils/calendarUtils.jsx";
import {
  handleCourseComponentClick,
  handleTimeBlockRemoval,
  handleCalendarSelection,
  handleTimeBlockCreation,
  handleTimeBlockUpdate,
  handleBlockedSlotRename,
} from "./utils/eventHandlerUtils.js";
import { useTouchEvents } from "./hooks/useTouchEvents.js";
import { useEventBusHandlers } from "./hooks/useEventBusHandlers.js";
import {
  calculateNavigationDate,
  getCalendarViewNotificationMessage,
  getVisibleTimetables,
} from "./utils/calendarViewUtils.js";
import { buildSelectionPreviewEvents } from "./utils/selectionUtils.js";
import { getFullCalendarConfig } from "./utils/calendarConfigUtils.js";
import MultiLineSnackbar from "@/components/sitewide/MultiLineSnackbar";
import { useIsMobile } from "@/lib/utils/screenSizeUtils";

export default function CalendarComponent({
  timetables,
  setTimetables,
  selectedDuration,
  setSelectedDuration,
  durations,
  sortOption,
  currentTimetableIndex,
  setCurrentTimetableIndex,
  onTimeBlockChange,
  term,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const calendarRef = React.useRef(null);
  const timetablesRef = React.useRef(timetables);
  const currentTimetableIndexRef = React.useRef(0);
  const durationNavigationPendingRef = React.useRef(false);
  const pendingDurationStartRef = React.useRef("");
  const navigatedDurationRef = React.useRef("");
  const courseColorsRef = React.useRef({});
  const [events, setEvents] = useState([]);
  const [viewRange, setViewRange] = useState(null);
  const { setCourseDetails } = useContext(CourseDetailsContext);
  const { courseColors, setCalendarUpdateHandler, getDefaultColorForCourse } =
    useContext(CourseColorsContext);
  const [isTruncated, setIsTruncated] = useState(false);
  const [noTimetablesGenerated, setNoTimetablesGenerated] = useState(false);
  const [conflictPresent, setConflictPresent] = useState(false);
  const [noCourses, setNoCourses] = useState(true);
  const [timeslotsOverridden, setTimeslotsOverridden] = useState(false);
  const [showWeekends, setShowWeekends] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [blockToRename, setBlockToRename] = useState(null);
  const [blockToRemove, setBlockToRemove] = useState(null);
  const [blockToEdit, setBlockToEdit] = useState(null);
  const [blockSheetOpen, setBlockSheetOpen] = useState(false);
  const [renameAnchorEl, setRenameAnchorEl] = useState(null);
  const [renameAnchorPosition, setRenameAnchorPosition] = useState(null);
  const [selectionPreviewEvents, setSelectionPreviewEvents] = useState([]);
  const selectionPreviewKeyRef = React.useRef("");

  const visibleTimetables = useMemo(
    () => getVisibleTimetables(timetables, viewRange),
    [timetables, viewRange],
  );
  const calendarEvents = useMemo(() => {
    if (selectionPreviewEvents.length === 0) {
      return events;
    }
    return [...events, ...selectionPreviewEvents];
  }, [events, selectionPreviewEvents]);

  // Screen size detection
  const isMobile = useIsMobile();

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi?.();
    const desiredView = isMobile ? "listWeek" : "timeGridWeek";
    if (
      calendarApi &&
      calendarApi.view?.type !== desiredView &&
      typeof calendarApi.changeView === "function"
    ) {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) calendarApi.changeView(desiredView);
      });
      return () => {
        cancelled = true;
      };
    }
    return undefined;
  }, [isMobile]);

  // Touch event handling
  useTouchEvents();

  // Event bus handling
  useEventBusHandlers({
    setCurrentTimetableIndex,
    setIsTruncated,
    setTimeslotsOverridden,
    setConflictPresent,
  });

  useEffect(() => {
    timetablesRef.current = visibleTimetables;
  }, [visibleTimetables]);

  useEffect(() => {
    currentTimetableIndexRef.current = currentTimetableIndex;
  }, [currentTimetableIndex]);

  // A restored timetable index belongs to the saved duration's calendar view.
  // Let FullCalendar finish moving there before validating it against the
  // visible option count for that view.
  useEffect(() => {
    if (!selectedDuration) {
      pendingDurationStartRef.current = "";
      durationNavigationPendingRef.current = false;
      return;
    }

    const [startUnix] = selectedDuration.split("-");
    const startDate = new Date(Number(startUnix) * 1000);
    const targetDate = calculateNavigationDate(startDate);
    const targetKey = `${targetDate.getFullYear()}-${targetDate.getMonth()}-${targetDate.getDate()}`;
    pendingDurationStartRef.current = targetKey;

    const activeStart = calendarRef.current?.getApi?.().view?.activeStart;
    const activeKey = activeStart
      ? `${activeStart.getFullYear()}-${activeStart.getMonth()}-${activeStart.getDate()}`
      : "";
    durationNavigationPendingRef.current = activeKey !== targetKey;
  }, [selectedDuration, noCourses, visibleTimetables.length]);

  useEffect(() => {
    if (
      visibleTimetables.length === 0 ||
      durationNavigationPendingRef.current
    ) {
      return;
    }
    if (currentTimetableIndex >= visibleTimetables.length) {
      setCurrentTimetableIndex(0);
    }
  }, [currentTimetableIndex, visibleTimetables, setCurrentTimetableIndex]);

  const handleLast = useCallback(() => {
    if (visibleTimetables.length === 0) return;
    setCurrentTimetableIndex(visibleTimetables.length - 1);
  }, [visibleTimetables.length, setCurrentTimetableIndex]);

  const updateCalendarEvents = useCallback(() => {
    const currentTimetables = timetablesRef.current;
    const currentIndex = currentTimetableIndexRef.current;
    const selectedIndex =
      currentIndex >= currentTimetables.length ? 0 : currentIndex;
    const currentColors = { ...courseColorsRef.current };

    if (selectedIndex !== currentIndex) {
      setCurrentTimetableIndex(selectedIndex);
    }

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
      currentTimetables.length > 0 &&
      currentTimetables[0].courses.length > 0
    ) {
      setNoCourses(false);
      const timetable = currentTimetables[selectedIndex];

      // Check if any courses have weekend classes
      const hasWeekendClasses = checkForWeekendClasses(timetable);
      setShowWeekends(hasWeekendClasses);

      const newEvents = createCalendarEvents(
        timetable,
        getDaysOfWeek,
        currentColors,
      );

      const courseDetails = buildCourseDetails(newEvents);

      setCourseDetails(courseDetails);
      setEvents(newEvents);
      setNoTimetablesGenerated(false);
    } else {
      setNoCourses(true);
      const newEvents = createCalendarEvents(
        null,
        getDaysOfWeek,
        currentColors,
      );
      setCourseDetails([]);
      setEvents(newEvents);
      setNoTimetablesGenerated(Object.keys(getCourseData()).length > 0);
    }
  }, [
    getDefaultColorForCourse,
    setCourseDetails,
    setEvents,
    setNoCourses,
    setNoTimetablesGenerated,
    setCurrentTimetableIndex,
  ]);

  const handleCalendarViewClick = useCallback(
    (durationLabel) => {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;

      const [startUnix] = durationLabel.split("-");

      const startDate = new Date(parseInt(startUnix, 10) * 1000);
      const navigationDate = calculateNavigationDate(startDate);

      const targetStart = new Date(
        navigationDate.getFullYear(),
        navigationDate.getMonth(),
        navigationDate.getDate(),
      );
      const currentStart = calendarApi.view?.activeStart;
      const alreadyOnTargetWeek =
        currentStart &&
        currentStart.getFullYear() === targetStart.getFullYear() &&
        currentStart.getMonth() === targetStart.getMonth() &&
        currentStart.getDate() === targetStart.getDate();
      if (alreadyOnTargetWeek) {
        durationNavigationPendingRef.current = false;
      }

      // Defer gotoDate to avoid flushSync warning during React render
      queueMicrotask(() => {
        calendarApi.gotoDate(navigationDate);
        const activeStart = calendarApi.view?.activeStart;
        if (
          activeStart &&
          activeStart.getFullYear() === targetStart.getFullYear() &&
          activeStart.getMonth() === targetStart.getMonth() &&
          activeStart.getDate() === targetStart.getDate()
        ) {
          durationNavigationPendingRef.current = false;
        }
      });

      setSelectedDuration(durationLabel);

      // Show calendar view notification
      const message = getCalendarViewNotificationMessage(startDate);
      enqueueSnackbar(<MultiLineSnackbar message={message} />, {
        variant: "info",
      });
    },
    [enqueueSnackbar, setSelectedDuration],
  );

  const handleDurationChange = useCallback(
    (durationLabel) => {
      setCurrentTimetableIndex(0);
      setSelectedDuration(durationLabel);
    },
    [setCurrentTimetableIndex, setSelectedDuration],
  );

  useEffect(() => {
    courseColorsRef.current = courseColors;
    updateCalendarEvents();
  }, [courseColors, updateCalendarEvents]);

  useEffect(() => {
    updateCalendarEvents();
  }, [currentTimetableIndex, visibleTimetables, updateCalendarEvents]);

  useEffect(() => {
    if (!selectedDuration) {
      navigatedDurationRef.current = "";
      durationNavigationPendingRef.current = false;
      return;
    }
    if (navigatedDurationRef.current === selectedDuration) return;
    if (!calendarRef.current?.getApi?.()) return;

    navigatedDurationRef.current = selectedDuration;
    handleCalendarViewClick(selectedDuration);
  }, [
    selectedDuration,
    noCourses,
    visibleTimetables.length,
    handleCalendarViewClick,
  ]);

  useEffect(() => {
    setCalendarUpdateHandler(updateCalendarEvents);
  }, [setCalendarUpdateHandler, updateCalendarEvents]);

  const handleDatesSet = useCallback((dateInfo) => {
    const start = dateInfo.start;
    const end = dateInfo.end;

    // FullCalendar invokes datesSet during its own commit. Defer the parent
    // update so React doesn't warn about a flushSync during that lifecycle.
    queueMicrotask(() => {
      const startKey = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
      if (startKey === pendingDurationStartRef.current) {
        durationNavigationPendingRef.current = false;
      }
      setViewRange((current) => {
        if (
          current?.start?.getTime() === start.getTime() &&
          current?.end?.getTime() === end.getTime()
        ) {
          return current;
        }
        return { start, end };
      });
    });
  }, []);

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
      const blockId = clickInfo.event.id.replace("block-", "");
      const blockEvent = getTimeBlockEvents().find(
        (block) => block.id === blockId,
      );
      if (!blockEvent) return;

      if (isMobile) {
        setBlockToEdit(blockEvent);
        setBlockSheetOpen(true);
      } else {
        setBlockToRemove(blockEvent);
      }
    }
  };

  const handleMobileTimeBlockSave = (block) => {
    if (blockToEdit) {
      handleTimeBlockUpdate(
        blockToEdit.id,
        block,
        setCurrentTimetableIndex,
        setTimetables,
        sortOption,
        onTimeBlockChange,
      );
      enqueueSnackbar("Weekly time updated", { variant: "success" });
      return;
    }

    handleTimeBlockCreation(
      block,
      setCurrentTimetableIndex,
      setTimetables,
      sortOption,
      onTimeBlockChange,
    );
    enqueueSnackbar("Weekly time blocked", { variant: "success" });
  };

  const handleMobileTimeBlockDelete = (block) => {
    handleTimeBlockRemoval(
      { event: { id: `block-${block.id}` } },
      setCurrentTimetableIndex,
      setTimetables,
      sortOption,
      onTimeBlockChange,
    );
    enqueueSnackbar("Blocked time removed", { variant: "success" });
  };

  const openCreateBlockSheet = () => {
    setBlockToEdit(null);
    setBlockSheetOpen(true);
  };

  const handleBlockSheetOpenChange = (open) => {
    setBlockSheetOpen(open);
    if (!open) setBlockToEdit(null);
  };

  const handleBlockRemovalConfirm = () => {
    if (!blockToRemove) return;

    handleTimeBlockRemoval(
      { event: { id: `block-${blockToRemove.id}` } },
      setCurrentTimetableIndex,
      setTimetables,
      sortOption,
      onTimeBlockChange,
    );
    setBlockToRemove(null);
  };

  const handleNext = () => {
    if (visibleTimetables.length === 0) return;
    setCurrentTimetableIndex(
      (currentTimetableIndex + 1) % visibleTimetables.length,
    );
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
            onTimeBlockChange,
          );
        });
      } else if (blockToRename.id) {
        handleBlockedSlotRename(
          blockToRename.id,
          newTitle,
          setCurrentTimetableIndex,
          setTimetables,
          sortOption,
          onTimeBlockChange,
        );
      }
      setBlockToRename(null);
    }
  };

  const handlePrevious = () => {
    if (visibleTimetables.length === 0) return;
    setCurrentTimetableIndex(
      (currentTimetableIndex - 1 + visibleTimetables.length) %
        visibleTimetables.length,
    );
  };

  const handleFirst = () => {
    setCurrentTimetableIndex(0);
  };

  const showBlankState =
    noCourses && !noTimetablesGenerated && getTimeBlockEvents().length === 0;

  const handleSelect = (selectInfo) => {
    clearSelectionPreview();
    handleCalendarSelection(
      selectInfo,
      setCurrentTimetableIndex,
      setTimetables,
      sortOption,
      setRenameDialogOpen,
      setBlockToRename,
      setRenameAnchorEl,
      setRenameAnchorPosition,
      onTimeBlockChange,
    );
  };

  const clearSelectionPreview = useCallback(() => {
    if (
      selectionPreviewKeyRef.current !== "" ||
      selectionPreviewEvents.length
    ) {
      selectionPreviewKeyRef.current = "";
      setSelectionPreviewEvents([]);
    }
  }, [selectionPreviewEvents.length]);

  const handleSelectAllow = useCallback(
    (selectionInfo) => {
      const start = selectionInfo?.start;
      const end = selectionInfo?.end;

      if (!start || !end) {
        clearSelectionPreview();
        return true;
      }

      const previewEvents = buildSelectionPreviewEvents(start, end);
      if (previewEvents.length === 0) {
        clearSelectionPreview();
        return true;
      }

      const previewKey = previewEvents
        .map(
          (event) => `${event.start.toISOString()}-${event.end.toISOString()}`,
        )
        .join("|");

      if (previewKey !== selectionPreviewKeyRef.current) {
        selectionPreviewKeyRef.current = previewKey;
        setSelectionPreviewEvents(previewEvents);
      }

      return true;
    },
    [clearSelectionPreview],
  );

  const handleUnselect = useCallback(() => {
    clearSelectionPreview();
  }, [clearSelectionPreview]);

  return (
    <div id="Calendar">
      <BorderBox title="Schedule">
        {showBlankState ? (
          <div className="calendar-shell flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
            <CalendarDays
              className="mb-3 h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="text-base font-semibold text-foreground">
              Your week is clear
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add a course to see its class times here.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => {
                const trigger = document.getElementById("courseSearchTrigger");
                trigger?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                trigger?.click();
              }}
            >
              <Plus aria-hidden="true" />
              Add a course
            </Button>
            {isMobile && (
              <Button
                type="button"
                variant="ghost"
                className="mt-2"
                onClick={openCreateBlockSheet}
              >
                <CalendarPlus aria-hidden="true" />
                Block time
              </Button>
            )}
          </div>
        ) : (
          <div className="calendar-shell">
            <CalendarNavBar
              isTruncated={isTruncated}
              noTimetablesGenerated={noTimetablesGenerated}
              timeslotsOverridden={timeslotsOverridden}
              conflictPresent={conflictPresent}
              handleFirst={handleFirst}
              handlePrevious={handlePrevious}
              handleNext={handleNext}
              handleLast={handleLast}
              currentTimetableIndex={currentTimetableIndex}
              timetables={visibleTimetables}
              selectedDuration={selectedDuration}
              setSelectedDuration={handleDurationChange}
              durations={durations}
              sortByBracketContent={sortByBracketContent}
              term={term}
              isMobile={isMobile}
              onBlockTime={openCreateBlockSheet}
            />
            <div className="calendar-shell-divider" aria-hidden="true" />

            <FullCalendar
              {...getFullCalendarConfig({
                calendarRef,
                showWeekends,
                events: calendarEvents,
                handleDatesSet,
                handleEventClick,
                handleSelect,
                handleSelectAllow,
                handleUnselect,
                handleEventMouseEnter,
                handleEventMouseLeave,
                isMobile,
              })}
            />
          </div>
        )}

        {isMobile && (
          <MobileTimeBlockSheet
            open={blockSheetOpen}
            block={blockToEdit}
            onOpenChange={handleBlockSheetOpenChange}
            onSubmit={handleMobileTimeBlockSave}
            onDelete={handleMobileTimeBlockDelete}
          />
        )}

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

        <Dialog
          open={Boolean(blockToRemove)}
          onOpenChange={(open) => {
            if (!open) setBlockToRemove(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove blocked time?</DialogTitle>
              <DialogDescription>
                {blockToRemove?.title
                  ? `“${blockToRemove.title}” will be removed and this time will become available again.`
                  : "This time will become available again."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBlockToRemove(null)}
              >
                Keep blocked
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleBlockRemovalConfirm}
              >
                Remove time
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </BorderBox>
    </div>
  );
}

CalendarComponent.propTypes = {
  timetables: PropTypes.array.isRequired,
  setTimetables: PropTypes.func.isRequired,
  selectedDuration: PropTypes.string.isRequired,
  setSelectedDuration: PropTypes.func.isRequired,
  durations: PropTypes.arrayOf(PropTypes.string).isRequired,
  sortOption: PropTypes.string.isRequired,
  currentTimetableIndex: PropTypes.number.isRequired,
  setCurrentTimetableIndex: PropTypes.func.isRequired,
  onTimeBlockChange: PropTypes.func.isRequired,
  term: PropTypes.string,
};
