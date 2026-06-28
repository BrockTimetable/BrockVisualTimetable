import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useSnackbar } from "notistack";
import {
  NavbarComponent,
  CalendarComponent,
  InputFormBottomComponent,
  InputFormTopComponent,
} from "@/components/generator";
import { useIsBelowMedium } from "@/lib/utils/screenSizeUtils";
import { CourseDetailsProvider } from "@/lib/contexts/generator/CourseDetailsContext";
import {
  CourseColorsProvider,
  CourseColorsContext,
} from "@/lib/contexts/generator/CourseColorsContext";
import { defaultColorForIndex } from "@/lib/contexts/generator/courseColorPalette";
import IntroGuideWidget from "@/components/generator/Dialogs/IntroGuideWidget";
import ConflictDialog from "@/components/generator/Dialogs/ConflictDialog";
import MultiLineSnackbar from "@/components/sitewide/MultiLineSnackbar";
import { trackPageView } from "@/lib/metrics";
import {
  storeCourseData,
  getCourseData,
  clearAllCourseData,
} from "@/lib/generator/courseData";
import {
  clearAllPins,
  addPinnedComponent,
  getPinnedComponents,
} from "@/lib/generator/pinnedComponents";
import {
  addTimeBlockEvent,
  getTimeBlockEvents,
  clearAllTimeBlockEvents,
} from "@/lib/generator/createCalendarEvents";
import {
  setBlockedTimeSlots,
  reinitializeTimeSlots,
} from "@/lib/generator/timeSlots";
import { getCourse } from "@/lib/generator/fetchData";
import {
  generateTimetables,
  getValidTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";
import {
  removeAddedCourse,
  findCourseLabelByCode,
} from "@/lib/generator/courseActions";
import { decodeState } from "@/lib/urlState/urlEncoder";
import {
  syncUrlToState,
  parseCourseLabel,
  buildPinStringsFromIds,
  buildDurationLabel,
} from "@/lib/urlState/urlStateUtils";
import eventBus from "@/lib/eventBus";
import FooterComponent from "@/components/sitewide/FooterComponent";
import { usePageMeta } from "@/lib/usePageMeta";

const conflictSignature = (info) =>
  info
    ? info.involvedCourses
        .map((c) => c.courseCode)
        .sort()
        .join(",")
    : null;

// A conflict is "acknowledged" (kept hidden) only while it matches the exact
// set of courses the user pinned AND every one of those pins is still in place.
// Unpinning an overlapped component drops a pin, so the dialog reopens.
const isConflictAcknowledged = (acknowledged, info) => {
  if (!acknowledged) return false;
  if (acknowledged.signature !== conflictSignature(info)) return false;
  if (!acknowledged.pinTargets || acknowledged.pinTargets.length === 0) {
    return true;
  }
  const pinned = getPinnedComponents();
  return acknowledged.pinTargets.every((pin) => pinned.includes(pin));
};

function GeneratorPageContent() {
  usePageMeta({
    title: "Brock Visual TimeTable",
    description:
      "Generate conflict-free Brock University timetables, compare schedule options, block unavailable times, pin classes, and export your calendar.",
    url: "https://brocktimetable.com/",
  });

  useEffect(() => {
    trackPageView({
      page: "Generator",
      title: "Brock Visual TimeTable",
    });
  }, []);
  const { enqueueSnackbar } = useSnackbar();
  const { courseColors, restoreCourseColors } = useContext(CourseColorsContext);
  const [timetables, setTimetables] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [durations, setDurations] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [addedCourses, setAddedCourses] = useState([]);
  const [currentTimetableIndex, setCurrentTimetableIndex] = useState(0);
  const [timetableType, setTimetableType] = useState("UG");
  const [term, setTerm] = useState("FW");
  const [timeBlockVersion, setTimeBlockVersion] = useState(0);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const conflictInfoRef = useRef(null);
  const acknowledgedRef = useRef(null);
  const isBelowMedium = useIsBelowMedium();

  // Capture the shared-state param synchronously at first render. The URL sync
  // effect runs before the restore effect on mount and (with no courses yet)
  // strips ?s=, so we must read it before that happens.
  const initialEncodedRef = useRef(undefined);
  if (initialEncodedRef.current === undefined) {
    initialEncodedRef.current = new URLSearchParams(window.location.search).get(
      "s",
    );
  }

  // timeBlockEvents is a singleton, so mutations don't trigger React effects.
  // Bumping this version lets the URL sync effect observe time block changes.
  const onTimeBlockChange = useCallback(
    () => setTimeBlockVersion((v) => v + 1),
    [],
  );

  const currentTimetable = timetables[currentTimetableIndex] ?? null;

  useEffect(() => {
    conflictInfoRef.current = conflictInfo;
  }, [conflictInfo]);

  // Surface unavoidable conflicts emitted by the generator. The dialog opens
  // automatically for a new conflict, stays closed once "Pin & Ignore" has
  // acknowledged that exact set of courses, and can be reopened from the
  // calendar's conflict indicator.
  useEffect(() => {
    const handleConflict = (info) => {
      setConflictInfo(info);
      if (!info) {
        // Conflict resolved: forget the acknowledgement so a brand-new conflict
        // (even with the same courses) warns again. Generation emits exactly one
        // terminal conflict state, so "Pin & Ignore" + regeneration re-emits the
        // same signature (kept closed) rather than a transient null.
        acknowledgedRef.current = null;
        setConflictDialogOpen(false);
        return;
      }
      if (!isConflictAcknowledged(acknowledgedRef.current, info)) {
        setConflictDialogOpen(true);
      }
    };
    const handleOpenConflictDialog = () => {
      if (conflictInfoRef.current) {
        setConflictDialogOpen(true);
      }
    };
    eventBus.on("conflict", handleConflict);
    eventBus.on("openConflictDialog", handleOpenConflictDialog);
    return () => {
      eventBus.off("conflict", handleConflict);
      eventBus.off("openConflictDialog", handleOpenConflictDialog);
    };
  }, []);

  const handlePinAndIgnoreConflict = () => {
    const info = conflictInfoRef.current;
    const pinTargets = info?.pinTargets ?? [];
    acknowledgedRef.current = {
      signature: conflictSignature(info),
      pinTargets,
    };
    setConflictDialogOpen(false);

    // Lock the conflicting sections in place so they display a pin icon and the
    // arrangement survives further regeneration. Unpinning any of them later
    // drops a pin, which reopens this dialog (see isConflictAcknowledged).
    if (pinTargets.length) {
      pinTargets.forEach((pin) => addPinnedComponent(pin));
      generateTimetables(sortOption);
      setTimetables(getValidTimetables());
    }
  };

  const handleRemoveConflictCourse = (courseCode) => {
    const courseLabel = findCourseLabelByCode(addedCourses, courseCode);
    if (!courseLabel) return;
    // Regeneration emits a fresh "conflict" event (null or a new set), which
    // updates or closes the dialog via handleConflict above.
    removeAddedCourse(courseLabel, {
      addedCourses,
      setAddedCourses,
      setTimetables,
      sortOption,
    });
  };

  // Clear all state when component unmounts
  useEffect(() => {
    return () => {
      clearAllCourseData();
      clearAllPins();
      setAddedCourses([]);
      setTimetables([]);
      setSelectedDuration("");
      setDurations([]);
      setSortOption("");
    };
  }, []);

  // Keep the URL in sync with the currently displayed timetable. The URL always
  // encodes a fully pinned snapshot, so every shared link is deterministic.
  useEffect(() => {
    syncUrlToState({
      currentTimetable,
      addedCourses,
      sortOption,
      timetableType,
      term,
      timeBlockEvents: getTimeBlockEvents(),
      selectedDuration,
      courseColors,
    });
  }, [
    currentTimetable,
    addedCourses,
    sortOption,
    timetableType,
    term,
    timeBlockVersion,
    selectedDuration,
    courseColors,
  ]);

  const showError = useCallback(() => {
    enqueueSnackbar(
      <MultiLineSnackbar message="Error: The shared timetable does not exist or is no longer being offered." />,
      { variant: "error" },
    );
  }, [enqueueSnackbar]);

  // Restoration is all-or-nothing: any failure wipes everything back to a blank
  // slate, drops the ?s= param, and shows the single error snackbar.
  const resetToBlankSlate = useCallback(() => {
    clearAllCourseData();
    clearAllPins();
    clearAllTimeBlockEvents();
    reinitializeTimeSlots();
    restoreCourseColors({});
    setAddedCourses([]);
    setTimetables([]);
    setSortOption("");
    setTimetableType("UG");
    setTerm("FW");
    setSelectedDuration("");
    setDurations([]);
    const url = new URL(window.location.href);
    url.searchParams.delete("s");
    history.replaceState(null, "", url);
  }, [restoreCourseColors]);

  const restoreFromUrlState = useCallback(
    async (encoded) => {
      // Step 1: Decode
      const state = decodeState(encoded);
      if (!state) {
        showError();
        return;
      }

      // Step 2: Restore term and timetableType
      setTimetableType(state.tt);
      setTerm(state.term);

      // Step 3: Restore time blocks (singleton events + blocked slot grid)
      for (const [i, block] of state.tb.entries()) {
        const blockObj = {
          id: `restore-${Date.now()}-${i}-${block.d}`,
          title: block.n || "",
          daysOfWeek: block.d,
          startTime: block.s,
          endTime: block.e,
          startRecur: "1970-01-01",
          endRecur: "9999-12-31",
        };
        addTimeBlockEvent(blockObj);

        const [sh, sm] = block.s.split(":").map(Number);
        const [eh, em] = block.e.split(":").map(Number);
        const slotStart = (sh - 8) * 2 + sm / 30;
        const slotEnd = (eh - 8) * 2 + em / 30;
        const slots = [];
        for (let s = slotStart; s < slotEnd; s++) slots.push(s);
        setBlockedTimeSlots({ [block.d]: slots });
      }

      // Step 4: Load all courses sequentially (mirrors a normal add, including
      // the DURATION pin that scopes generation to the right academic duration).
      // Collect each course's duration label so the timeline options can be
      // rebuilt — restore bypasses InputFormTopComponent, which normally does it.
      const restoredDurations = [];
      try {
        for (const courseLabel of state.c) {
          const { cleanCourseCode, duration } = parseCourseLabel(courseLabel);
          const courseData = await getCourse(
            cleanCourseCode,
            state.tt,
            state.term,
          );
          storeCourseData(courseData);
          setAddedCourses((prev) => [...prev, courseLabel]);
          addPinnedComponent(`${cleanCourseCode} DURATION ${duration}`);

          const durationLabel = buildDurationLabel(courseData, duration);
          if (durationLabel && !restoredDurations.includes(durationLabel)) {
            restoredDurations.push(durationLabel);
          }
        }
      } catch (e) {
        resetToBlankSlate();
        showError();
        return;
      }

      // Step 5: Apply section pins, verifying every ID exists in fetched data.
      const { pinStrings, allFound } = buildPinStringsFromIds(
        state.p,
        getCourseData(),
      );
      if (!allFound) {
        resetToBlankSlate();
        showError();
        return;
      }
      pinStrings.forEach((pin) => addPinnedComponent(pin));

      // Step 6: Generate
      const sortMap = { w: "sortByWaitingTime", d: "minimizeClassDays" };
      const sort = sortMap[state.sort] ?? "default";
      setSortOption(sort);
      generateTimetables(sort);
      const result = getValidTimetables();

      // Step 7: Verify generation produced a real timetable.
      if (
        !result.length ||
        (result.length === 1 && !result[0].courses?.length)
      ) {
        resetToBlankSlate();
        showError();
        return;
      }

      // Step 8: Restore the duration timeline options, the duration view the
      // user was on (matched by code), and the per-course colors.
      setDurations(restoredDurations);
      const savedDuration =
        restoredDurations.find((d) => d.split("-")[2] === state.sd) ??
        restoredDurations[restoredDurations.length - 1] ??
        "";
      setSelectedDuration(savedDuration);

      // Default colors are deterministic by add order, so rebuild them and layer
      // the stored overrides (the only colors actually encoded) on top.
      const restoredColors = {};
      state.c.forEach((label, i) => {
        restoredColors[parseCourseLabel(label).cleanCourseCode] =
          defaultColorForIndex(i);
      });
      Object.assign(restoredColors, state.col || {});
      restoreCourseColors(restoredColors);

      setTimetables(result);
    },
    [resetToBlankSlate, showError, restoreCourseColors],
  );

  // Restore from a shared URL once on mount.
  useEffect(() => {
    const encoded = initialEncodedRef.current;
    if (!encoded) return;
    restoreFromUrlState(encoded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-w-[350px] flex-col items-center">
      <div className="w-full max-w-[1280px]">
        <NavbarComponent />
        <div className="grid grid-cols-1 justify-center md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="mx-2 mt-2 md:mx-1">
              <InputFormTopComponent
                setTimetables={setTimetables}
                setSelectedDuration={setSelectedDuration}
                setDurations={setDurations}
                setSortOption={setSortOption}
                addedCourses={addedCourses}
                setAddedCourses={setAddedCourses}
                timetableType={timetableType}
                setTimetableType={setTimetableType}
                term={term}
                setTerm={setTerm}
              />
              {!isBelowMedium && (
                <div className="mt-4">
                  <InputFormBottomComponent
                    addedCourses={addedCourses}
                    setAddedCourses={setAddedCourses}
                    setTimetables={setTimetables}
                    timetables={timetables}
                    durations={durations}
                    sortOption={sortOption}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-8">
            <div className="mx-2 mt-0 sm:mt-2 md:mx-1">
              <CalendarComponent
                timetables={timetables}
                setTimetables={setTimetables}
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                durations={durations}
                sortOption={sortOption}
                currentTimetableIndex={currentTimetableIndex}
                setCurrentTimetableIndex={setCurrentTimetableIndex}
                onTimeBlockChange={onTimeBlockChange}
              />
            </div>
          </div>
          {isBelowMedium && (
            <div className="md:col-span-12">
              <div className="mx-2 mt-0 sm:mt-2">
                <InputFormBottomComponent
                  addedCourses={addedCourses}
                  setAddedCourses={setAddedCourses}
                  setTimetables={setTimetables}
                  timetables={timetables}
                  durations={durations}
                  sortOption={sortOption}
                />
              </div>
            </div>
          )}
        </div>
        <IntroGuideWidget />
        <ConflictDialog
          open={conflictDialogOpen}
          onClose={handlePinAndIgnoreConflict}
          conflictInfo={conflictInfo}
          onRemoveCourse={handleRemoveConflictCourse}
        />
        <FooterComponent />
      </div>
    </div>
  );
}

// The page body lives inside the providers so it can read/restore course colors
// (CourseColorsContext) alongside the timetable state it already owns.
function GeneratorPage() {
  return (
    <CourseDetailsProvider>
      <CourseColorsProvider>
        <GeneratorPageContent />
      </CourseColorsProvider>
    </CourseDetailsProvider>
  );
}

export default GeneratorPage;
