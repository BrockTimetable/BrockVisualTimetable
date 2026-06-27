import { useState, useEffect, useRef } from "react";
import {
  NavbarComponent,
  CalendarComponent,
  InputFormBottomComponent,
  InputFormTopComponent,
} from "@/components/generator";
import { useIsBelowMedium } from "@/lib/utils/screenSizeUtils";
import { CourseDetailsProvider } from "@/lib/contexts/generator/CourseDetailsContext";
import { CourseColorsProvider } from "@/lib/contexts/generator/CourseColorsContext";
import IntroGuideWidget from "@/components/generator/Dialogs/IntroGuideWidget";
import ConflictDialog from "@/components/generator/Dialogs/ConflictDialog";
import { trackPageView } from "@/lib/metrics";
import { clearAllCourseData } from "@/lib/generator/courseData";
import {
  clearAllPins,
  addPinnedComponent,
  getPinnedComponents,
} from "@/lib/generator/pinnedComponents";
import {
  generateTimetables,
  getValidTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";
import {
  removeAddedCourse,
  findCourseLabelByCode,
} from "@/lib/generator/courseActions";
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

function GeneratorPage() {
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
  const [timetables, setTimetables] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [durations, setDurations] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [addedCourses, setAddedCourses] = useState([]);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const conflictInfoRef = useRef(null);
  const acknowledgedRef = useRef(null);
  const isBelowMedium = useIsBelowMedium();

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

  return (
    <CourseDetailsProvider>
      <CourseColorsProvider>
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
      </CourseColorsProvider>
    </CourseDetailsProvider>
  );
}

export default GeneratorPage;
