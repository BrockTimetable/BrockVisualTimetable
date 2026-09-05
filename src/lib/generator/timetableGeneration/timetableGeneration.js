import {
  generateSingleCourseCombinations,
  generateTimetableCombinations,
} from "./utils/combinationUtils";

import {
  emitNoValidTimetablesFound,
  emitTimetableConflict,
  clearConflictFlag,
  clearOverriddenFlag,
  clearTruncationFlag,
  sortTimetableIndexReset,
} from "./utils/UIEventsUtils";

import {
  isTimetableValid,
  findTimetableConflicts,
} from "./utils/validateUtils";
import { buildConflictFallback } from "./utils/conflictUtils";
import { calculateWaitingTime, calculateClassDays } from "./utils/sortUtils";
import { getCourseData } from "../courseData";
import { getTimeSlots } from "../timeSlots";
import { getPinnedComponents } from "../pinnedComponents";

let validTimetables = [];
let previousSortOption = "default";

let performanceMetrics = {
  generationStartTime: 0,
  generationEndTime: 0,
  totalCombinationsProcessed: 0,
  validTimetablesFound: 0,
};

export const generateTimetables = (sortOption) => {
  clearOverriddenFlag();
  clearTruncationFlag();
  previousSortOption = sortTimetableIndexReset(sortOption, previousSortOption);
  performanceMetrics = {
    generationStartTime: 0,
    generationEndTime: 0,
    totalCombinationsProcessed: 0,
    validTimetablesFound: 0,
  };

  validTimetables = [];
  const courseData = getCourseData();
  const courses = Object.values(courseData);
  const timeSlots = getTimeSlots();

  performanceMetrics.generationStartTime = performance.now();

  try {
    const allCourseCombinations = courses.map((course) =>
      generateSingleCourseCombinations(course, timeSlots),
    );

    if (
      allCourseCombinations.some((combinations) => combinations.length === 0)
    ) {
      validTimetables.push({ courses: [] });
      clearConflictFlag();
      return;
    }

    let allPossibleTimetables = generateTimetableCombinations(
      allCourseCombinations,
      performanceMetrics,
    );

    allPossibleTimetables.forEach((timetable) => {
      if (isTimetableValid(timetable)) {
        validTimetables.push({ courses: timetable });
        performanceMetrics.validTimetablesFound++;
      }
    });

    if (sortOption === "sortByWaitingTime") {
      validTimetables.sort((a, b) => {
        const waitingTimeDiff =
          calculateWaitingTime(a.courses) - calculateWaitingTime(b.courses);
        if (waitingTimeDiff !== 0) return waitingTimeDiff;
        return calculateClassDays(a.courses) - calculateClassDays(b.courses);
      });
    } else if (sortOption === "minimizeClassDays") {
      validTimetables.sort(
        (a, b) => calculateClassDays(a.courses) - calculateClassDays(b.courses),
      );
    }

    if (validTimetables.length === 0) {
      // Last resort: every course has at least one valid section combination
      // (the "course not offered" case returned earlier), yet no combination
      // across courses is conflict-free. Rather than wiping the calendar, show
      // the least-conflicting timetable and surface the clash to the user.
      const fallback = buildConflictFallback(
        allPossibleTimetables,
        findTimetableConflicts,
      );

      if (fallback) {
        // Surface every timetable tied for the fewest conflicts so the user can
        // still browse variations (e.g. different seminars) that don't change
        // the unavoidable clash.
        fallback.timetables.forEach(({ timetable, conflictKeys }) => {
          validTimetables.push({
            courses: timetable,
            hasConflicts: true,
            conflictKeys,
          });
        });
        emitTimetableConflict(fallback.conflictInfo);
      } else {
        emitNoValidTimetablesFound();
        clearConflictFlag();
      }
    } else {
      clearConflictFlag();
    }
  } finally {
    performanceMetrics.generationEndTime = performance.now();
  }
};

export const getValidTimetables = () => validTimetables;

// Generates a read-only what-if result for WebMCP. Unlike generateTimetables,
// it neither changes the visible result list nor emits UI events.
export const previewTimetables = (additionalCourses, additionalPins = []) => {
  const courses = [...Object.values(getCourseData()), ...additionalCourses];
  const performance = { totalCombinationsProcessed: 0 };
  const options = {
    pinnedComponents: [...getPinnedComponents(), ...additionalPins],
    emitOverride: false,
    markPinned: false,
  };
  const combinations = courses.map((course) =>
    generateSingleCourseCombinations(course, getTimeSlots(), options),
  );
  if (
    combinations.some((courseCombinations) => courseCombinations.length === 0)
  )
    return [];

  return generateTimetableCombinations(combinations, performance, {
    onTruncate: () => {},
  })
    .filter(isTimetableValid)
    .map((courses) => ({ courses }));
};

export const getGenerationPerformance = () => {
  const {
    generationStartTime,
    generationEndTime,
    totalCombinationsProcessed,
    validTimetablesFound,
  } = performanceMetrics;

  return {
    generationStartTime,
    generationEndTime,
    totalCombinationsProcessed,
    validTimetablesFound,
  };
};
