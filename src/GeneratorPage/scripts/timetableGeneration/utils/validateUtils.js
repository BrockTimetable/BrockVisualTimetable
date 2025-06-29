import { timeToSlot } from "./timeUtils";
import { getBaseComponentId } from "./componentIDUtils";

export const isTimetableValid = (timetable) => {
  const timeRegex = /[a-zA-Z]/;
  const dateRangesOverlap = (start1, end1, start2, end2) =>
    start1 <= end2 && start2 <= end1;
  const timeSlotsOverlap = (start1, end1, start2, end2) =>
    start1 < end2 && start2 < end1;

  const allComponents = [];

  for (const course of timetable) {
    const components = [
      ...course.mainComponents,
      course.secondaryComponents.lab,
      course.secondaryComponents.tutorial,
      course.secondaryComponents.seminar,
    ].filter(Boolean);

    for (const component of components) {
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
        componentId: component.id,
        baseComponentId: getBaseComponentId(component.id),
        days: daysArray,
        startSlot,
        endSlot,
        startDate,
        endDate,
      });
    }
  }

  for (let i = 0; i < allComponents.length; i++) {
    for (let j = i + 1; j < allComponents.length; j++) {
      const comp1 = allComponents[i];
      const comp2 = allComponents[j];

      if (
        !dateRangesOverlap(
          comp1.startDate,
          comp1.endDate,
          comp2.startDate,
          comp2.endDate
        )
      )
        continue;

      const commonDays = comp1.days.filter((day) => comp2.days.includes(day));
      if (commonDays.length === 0) continue;

      if (
        timeSlotsOverlap(
          comp1.startSlot,
          comp1.endSlot,
          comp2.startSlot,
          comp2.endSlot
        )
      ) {
        return false;
      }
    }
  }

  return true;
};
