import { timeToSlot } from "./timeUtils";
import { getBaseComponentId } from "./componentIDUtils";

const dateRangesOverlap = (start1, end1, start2, end2) =>
  start1 <= end2 && start2 <= end1;
const timeSlotsOverlap = (start1, end1, start2, end2) =>
  start1 < end2 && start2 < end1;

// Flattens a timetable into a list of scheduled component descriptors, skipping
// components without a concrete time (e.g. fully asynchronous/online sections).
// pinType records how the component would be pinned (MAIN/LAB/TUT/SEM).
const flattenTimetableComponents = (timetable) => {
  const timeRegex = /[a-zA-Z]/;
  const allComponents = [];

  for (const course of timetable) {
    const taggedComponents = [
      ...course.mainComponents.map((component) => ({ component, pinType: "MAIN" })),
      { component: course.secondaryComponents.lab, pinType: "LAB" },
      { component: course.secondaryComponents.tutorial, pinType: "TUT" },
      { component: course.secondaryComponents.seminar, pinType: "SEM" },
    ].filter(({ component }) => Boolean(component));

    for (const { component, pinType } of taggedComponents) {
      const { days, time, startDate, endDate } = component.schedule;
      if (!time || timeRegex.test(time)) continue;

      const [startSlot, endSlot] = time
        .split("-")
        .map((t) => timeToSlot(t.trim()));
      const daysArray = days.includes(" ")
        ? days.split(" ").filter(Boolean)
        : days.replace(/\s/g, "").split("");

      allComponents.push({
        courseCode: course.courseCode,
        courseName: course.courseName || "",
        componentId: component.id,
        type: component.type,
        pinType,
        baseComponentId: getBaseComponentId(component.id),
        days: daysArray,
        time,
        startSlot,
        endSlot,
        startDate,
        endDate,
      });
    }
  }

  return allComponents;
};

const componentsConflict = (comp1, comp2) => {
  if (
    !dateRangesOverlap(
      comp1.startDate,
      comp1.endDate,
      comp2.startDate,
      comp2.endDate,
    )
  )
    return false;

  const commonDays = comp1.days.filter((day) => comp2.days.includes(day));
  if (commonDays.length === 0) return false;

  return timeSlotsOverlap(
    comp1.startSlot,
    comp1.endSlot,
    comp2.startSlot,
    comp2.endSlot,
  );
};

export const isTimetableValid = (timetable) => {
  const allComponents = flattenTimetableComponents(timetable);

  for (let i = 0; i < allComponents.length; i++) {
    for (let j = i + 1; j < allComponents.length; j++) {
      if (componentsConflict(allComponents[i], allComponents[j])) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Returns every overlapping pair of components in a timetable. Unlike
 * isTimetableValid this does a full scan (no short-circuit) so the result can be
 * used to highlight and explain unavoidable conflicts to the user.
 */
export const findTimetableConflicts = (timetable) => {
  const allComponents = flattenTimetableComponents(timetable);
  const conflicts = [];

  for (let i = 0; i < allComponents.length; i++) {
    for (let j = i + 1; j < allComponents.length; j++) {
      const comp1 = allComponents[i];
      const comp2 = allComponents[j];
      // Components of the same course are expected to be scheduled together and
      // are not treated as user-facing conflicts.
      if (comp1.courseCode === comp2.courseCode) continue;
      if (componentsConflict(comp1, comp2)) {
        conflicts.push({ a: comp1, b: comp2 });
      }
    }
  }

  return conflicts;
};
