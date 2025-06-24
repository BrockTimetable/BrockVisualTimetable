import {
  filterComponentsAgainstTimeSlots,
  filterPinned,
  filterByDuration,
} from "./filterUtils";
import { getBaseComponentId } from "./componentIDUtils";
import { getPinnedComponents } from "../../pinnedComponents";
import { emitTruncationWarning } from "./UIEventsUtils";

const maxComboThreshold = 50000;

export const cartesianProduct = (arrays) => {
  if (arrays.some((arr) => arr.length === 0)) return [];
  if (arrays.length === 1) return arrays[0].map((item) => [item]);

  const totalPossible = arrays.reduce((acc, arr) => acc * arr.length, 1);
  if (totalPossible > maxComboThreshold) {
    return [];
  }

  let result = [[]];
  let total = 0;

  for (const array of arrays) {
    const temp = new Array(result.length * array.length);
    let tempIndex = 0;

    for (const item of array) {
      for (const combination of result) {
        temp[tempIndex++] = [...combination, item];
        total++;
        if (total >= maxComboThreshold) {
          return temp.slice(0, tempIndex);
        }
      }
    }
    result = temp.slice(0, tempIndex);
  }

  return result;
};

export const generateSingleCourseCombinations = (course, timeSlots) => {
  const pinnedComponents = getPinnedComponents();

  const durationFilter = pinnedComponents.find((p) => {
    const [pinnedCourse, type] = p.split(" ");
    return pinnedCourse === course.courseCode && type === "DURATION";
  });

  let validMainComponents = course.sections;
  if (durationFilter) {
    const duration = durationFilter.split(" ")[2];
    validMainComponents = filterByDuration(validMainComponents, duration);
  }

  const { availableGroups: mainAvailable } = filterComponentsAgainstTimeSlots(
    validMainComponents,
    timeSlots
  );

  validMainComponents = filterPinned(mainAvailable, course.courseCode, "MAIN");

  const processSecondary = (type, items) => {
    const { availableGroups } = filterComponentsAgainstTimeSlots(
      items,
      timeSlots
    );

    const filtered = filterPinned(availableGroups, course.courseCode, type);
    return filtered;
  };

  const labs = durationFilter
    ? filterByDuration(course.labs, durationFilter.split(" ")[2])
    : course.labs;
  const tutorials = durationFilter
    ? filterByDuration(course.tutorials, durationFilter.split(" ")[2])
    : course.tutorials;
  const seminars = durationFilter
    ? filterByDuration(course.seminars, durationFilter.split(" ")[2])
    : course.seminars;

  const validLabs = processSecondary("LAB", labs);
  const validTutorials = processSecondary("TUT", tutorials);
  const validSeminars = processSecondary("SEM", seminars);

  // Check if there are any valid components at all (main or secondary)
  const hasValidComponents =
    validMainComponents.length > 0 ||
    validLabs.length > 0 ||
    validTutorials.length > 0 ||
    validSeminars.length > 0;

  if (!hasValidComponents) {
    return [];
  }

  const singleCourseCombinations = [];

  // Handle courses with main components
  if (validMainComponents.length > 0) {
    const groupedMainComponents = Object.values(
      validMainComponents.reduce((acc, component) => {
        const groupId = getBaseComponentId(component.id);
        if (!acc[groupId]) acc[groupId] = [];
        acc[groupId].push(component);
        return acc;
      }, {})
    );

    groupedMainComponents.forEach((mainComponentGroup) => {
      const mainComponentDuration = mainComponentGroup[0].schedule.duration;
      const isOnlyMainSection = validMainComponents.length === 1;

      const getMatchingCharIndex = (componentId) =>
        Math.min(3, componentId.length - 1);
      const mainBaseId = getBaseComponentId(mainComponentGroup[0].id);

      const matchSecondary = (secondaries) =>
        secondaries.filter((comp) => {
          const compBase = getBaseComponentId(comp.id);
          return (
            comp.schedule.duration === mainComponentDuration &&
            ((isOnlyMainSection && mainBaseId !== "0") ||
              compBase.charAt(getMatchingCharIndex(compBase)) ===
                mainBaseId.charAt(getMatchingCharIndex(mainBaseId)))
          );
        });

      const validLabsForMainComponent = matchSecondary(validLabs);
      const validTutorialsForMainComponent = matchSecondary(validTutorials);
      const validSeminarsForMainComponent = matchSecondary(validSeminars);

      const pinnedLab = pinnedComponents.find(
        (p) =>
          p.includes("LAB") &&
          !p.includes("LABR") &&
          p.split(" ")[0] === course.courseCode
      );
      const pinnedTut = pinnedComponents.find(
        (p) => p.includes("TUT") && p.split(" ")[0] === course.courseCode
      );
      const pinnedSem = pinnedComponents.find(
        (p) => p.includes("SEM") && p.split(" ")[0] === course.courseCode
      );

      const isLabValid =
        !pinnedLab ||
        validLabsForMainComponent.some(
          (lab) => getBaseComponentId(lab.id) === pinnedLab.split(" ")[2]
        );
      const isTutValid =
        !pinnedTut ||
        validTutorialsForMainComponent.some(
          (tut) => getBaseComponentId(tut.id) === pinnedTut.split(" ")[2]
        );
      const isSemValid =
        !pinnedSem ||
        validSeminarsForMainComponent.some(
          (sem) => getBaseComponentId(sem.id) === pinnedSem.split(" ")[2]
        );

      if (!isLabValid || !isTutValid || !isSemValid) {
        return;
      }

      const combinations = cartesianProduct([
        validLabsForMainComponent.length > 0
          ? validLabsForMainComponent
          : [null],
        validTutorialsForMainComponent.length > 0
          ? validTutorialsForMainComponent
          : [null],
        validSeminarsForMainComponent.length > 0
          ? validSeminarsForMainComponent
          : [null],
      ]);

      combinations.forEach(([lab, tutorial, seminar]) => {
        singleCourseCombinations.push({
          courseCode: course.courseCode,
          mainComponents: mainComponentGroup,
          secondaryComponents: { lab, tutorial, seminar },
        });
      });
    });
  } else {
    // Handle courses with only secondary components (no main components)
    // For courses without main components, we need to generate combinations of secondary components

    // Get the duration from any available secondary component
    let courseDuration = null;
    if (validSeminars.length > 0) {
      courseDuration = validSeminars[0].schedule.duration;
    } else if (validLabs.length > 0) {
      courseDuration = validLabs[0].schedule.duration;
    } else if (validTutorials.length > 0) {
      courseDuration = validTutorials[0].schedule.duration;
    }

    // Filter secondary components to match the course duration if available
    const filteredLabs = courseDuration
      ? validLabs.filter((lab) => lab.schedule.duration === courseDuration)
      : validLabs;
    const filteredTutorials = courseDuration
      ? validTutorials.filter((tut) => tut.schedule.duration === courseDuration)
      : validTutorials;
    const filteredSeminars = courseDuration
      ? validSeminars.filter((sem) => sem.schedule.duration === courseDuration)
      : validSeminars;

    // Check pinned components for secondary-only courses
    const pinnedLab = pinnedComponents.find(
      (p) =>
        p.includes("LAB") &&
        !p.includes("LABR") &&
        p.split(" ")[0] === course.courseCode
    );
    const pinnedTut = pinnedComponents.find(
      (p) => p.includes("TUT") && p.split(" ")[0] === course.courseCode
    );
    const pinnedSem = pinnedComponents.find(
      (p) => p.includes("SEM") && p.split(" ")[0] === course.courseCode
    );

    const isLabValid =
      !pinnedLab ||
      filteredLabs.some(
        (lab) => getBaseComponentId(lab.id) === pinnedLab.split(" ")[2]
      );
    const isTutValid =
      !pinnedTut ||
      filteredTutorials.some(
        (tut) => getBaseComponentId(tut.id) === pinnedTut.split(" ")[2]
      );
    const isSemValid =
      !pinnedSem ||
      filteredSeminars.some(
        (sem) => getBaseComponentId(sem.id) === pinnedSem.split(" ")[2]
      );

    if (isLabValid && isTutValid && isSemValid) {
      const combinations = cartesianProduct([
        filteredLabs.length > 0 ? filteredLabs : [null],
        filteredTutorials.length > 0 ? filteredTutorials : [null],
        filteredSeminars.length > 0 ? filteredSeminars : [null],
      ]);

      combinations.forEach(([lab, tutorial, seminar]) => {
        // Only create combination if at least one secondary component exists
        if (lab || tutorial || seminar) {
          singleCourseCombinations.push({
            courseCode: course.courseCode,
            mainComponents: [], // Empty array for courses with no main components
            secondaryComponents: { lab, tutorial, seminar },
          });
        }
      });
    }
  }

  return singleCourseCombinations;
};

export const generateTimetableCombinations = (
  courseCombinations,
  performanceMetrics
) => {
  let results = [];
  let count = 0;

  const generate = (prefix, arrays) => {
    if (arrays.length === 0) {
      results.push(prefix);
      count++;
      performanceMetrics.totalCombinationsProcessed++;
      if (count >= maxComboThreshold) {
        emitTruncationWarning();
        return false;
      }
      return true;
    }

    const [first, ...rest] = arrays;
    for (const item of first) {
      if (!generate([...prefix, item], rest)) return false;
    }
    return true;
  };

  generate([], courseCombinations);
  return results;
};
