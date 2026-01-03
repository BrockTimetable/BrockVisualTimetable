import {
  filterComponentsAgainstTimeSlots,
  filterPinned,
  filterByDuration,
} from "./filterUtils";
import { getBaseComponentId } from "./componentIDUtils";
import {
  getPinnedComponentIds,
  getPinnedDuration,
} from "../../pinnedComponents";
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
  const durationFilter = getPinnedDuration(course.courseCode);

  let validMainComponents = course.sections;
  if (durationFilter) {
    validMainComponents = filterByDuration(validMainComponents, durationFilter);
  }

  const { availableGroups: mainAvailable } = filterComponentsAgainstTimeSlots(
    validMainComponents,
    timeSlots,
  );

  validMainComponents = filterPinned(mainAvailable, course.courseCode, "MAIN");

  if (validMainComponents.length === 0) {
    return [];
  }

  const groupedMainComponents = Object.values(
    validMainComponents.reduce((acc, component) => {
      const groupId = getBaseComponentId(component.id);
      if (!acc[groupId]) acc[groupId] = [];
      acc[groupId].push(component);
      return acc;
    }, {}),
  );

  const processSecondary = (type, items) => {
    const { availableGroups } = filterComponentsAgainstTimeSlots(
      items,
      timeSlots,
    );

    const filtered = filterPinned(availableGroups, course.courseCode, type);
    return filtered;
  };

  const labs = durationFilter
    ? filterByDuration(course.labs, durationFilter)
    : course.labs;
  const tutorials = durationFilter
    ? filterByDuration(course.tutorials, durationFilter)
    : course.tutorials;
  const seminars = durationFilter
    ? filterByDuration(course.seminars, durationFilter)
    : course.seminars;

  const validLabs = processSecondary("LAB", labs);
  const validTutorials = processSecondary("TUT", tutorials);
  const validSeminars = processSecondary("SEM", seminars);

  const singleCourseCombinations = [];
  const pinnedLabIds = new Set(getPinnedComponentIds(course.courseCode, "LAB"));
  const pinnedTutIds = new Set(getPinnedComponentIds(course.courseCode, "TUT"));
  const pinnedSemIds = new Set(getPinnedComponentIds(course.courseCode, "SEM"));

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

    const isLabValid =
      pinnedLabIds.size === 0 ||
      validLabsForMainComponent.some((lab) =>
        pinnedLabIds.has(getBaseComponentId(lab.id)),
      );
    const isTutValid =
      pinnedTutIds.size === 0 ||
      validTutorialsForMainComponent.some((tut) =>
        pinnedTutIds.has(getBaseComponentId(tut.id)),
      );
    const isSemValid =
      pinnedSemIds.size === 0 ||
      validSeminarsForMainComponent.some((sem) =>
        pinnedSemIds.has(getBaseComponentId(sem.id)),
      );

    if (!isLabValid || !isTutValid || !isSemValid) {
      return;
    }

    const combinations = cartesianProduct([
      validLabsForMainComponent.length > 0 ? validLabsForMainComponent : [null],
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

  return singleCourseCombinations;
};

export const generateTimetableCombinations = (
  courseCombinations,
  performanceMetrics,
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
