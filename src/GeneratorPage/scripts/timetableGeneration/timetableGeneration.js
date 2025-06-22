import {
  generateSingleCourseCombinations,
  generateTimetableCombinations,
} from "./utils/combinationUtils";

import {
  emitNoValidTimetablesFound,
  clearOverriddenFlag,
  clearTruncationFlag,
  sortTimetableIndexReset,
} from "./utils/UIEventsUtils";

import { timeToSlot } from "./utils/timeUtils";
import { isTimetableValid } from "./utils/validateUtils";
import { calculateWaitingTime, calculateClassDays } from "./utils/sortUtils";
import { getCourseData } from "../courseData";
import { getTimeSlots } from "../timeSlots";

let validTimetables = [];
let previousSortOption = "default";
let lastBlockedComponents = [];

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

    if (validTimetables.length === 0 && lastBlockedComponents.length > 0) {
      lastBlockedComponents.sort(
        (a, b) => a.blockedPercentage - b.blockedPercentage,
      );

      for (let i = 0; i < lastBlockedComponents.length; i++) {
        const leastBlockedGroup = lastBlockedComponents[i].group;

        for (const component of leastBlockedGroup) {
          const { days, time } = component.schedule;
          if (!time) continue;
          const [startSlot, endSlot] = time
            .split("-")
            .map((t) => timeToSlot(t.trim()));

          let daysArray;
          if (days.includes(" ")) {
            daysArray = days.split(" ").filter(Boolean);
          } else {
            daysArray = days.replace(/\s/g, "").split("");
          }

          for (let day of daysArray) {
            for (let s = startSlot; s < endSlot; s++) {
              timeSlots[day][s] = false;
            }
          }
        }

        validTimetables = [];

        const retryCourseCombinations = courses.map((course) =>
          generateSingleCourseCombinations(course, timeSlots),
        );

        if (
          retryCourseCombinations.some(
            (combinations) => combinations.length === 0,
          )
        ) {
          continue;
        }

        let retryAllPossibleTimetables = generateTimetableCombinations(
          retryCourseCombinations,
          performanceMetrics,
        );
        retryAllPossibleTimetables.forEach((timetable) => {
          if (isTimetableValid(timetable)) {
            validTimetables.push({ courses: timetable });
          }
        });

        if (validTimetables.length > 0) break;
      }
    }

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
      emitNoValidTimetablesFound();
    }
  } finally {
    performanceMetrics.generationEndTime = performance.now();
  }
};

export const getValidTimetables = () => validTimetables;

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
