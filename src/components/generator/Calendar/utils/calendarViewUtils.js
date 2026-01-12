import { getBaseComponentId } from "@/lib/generator/timetableGeneration/utils/componentIDUtils";

// Calculate navigation date based on start date and day of week
export const calculateNavigationDate = (startDate) => {
  const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let navigationDate = new Date(startDate);

  // If classes start on Tuesday-Saturday, navigate to the following week
  // so we can see the full recurring pattern (Monday-Friday)
  if (dayOfWeek >= 2 && dayOfWeek <= 6) {
    // Add days to get to the Monday of the following week
    const daysToAdd = 8 - dayOfWeek; // Days until next Monday
    navigationDate.setDate(navigationDate.getDate() + daysToAdd);
  } else {
    // If classes start on Sunday or Monday, navigate to the Monday of that week
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    navigationDate.setDate(navigationDate.getDate() - daysToSubtract);
  }

  return navigationDate;
};

const getViewRangeSeconds = (viewRange) => {
  if (!viewRange?.start || !viewRange?.end) {
    return null;
  }

  return {
    start: Math.floor(viewRange.start.getTime() / 1000),
    end: Math.floor((viewRange.end.getTime() - 1) / 1000),
  };
};

const doesComponentOverlapRange = (component, range) => {
  if (!range) return true;

  const { startDate, endDate } = component.schedule || {};
  if (startDate == null || endDate == null) {
    return true;
  }

  return startDate <= range.end && endDate >= range.start;
};

const buildComponentSignature = (component, type, range) => {
  if (!component || !component.schedule) return null;
  if (!doesComponentOverlapRange(component, range)) return null;

  const baseId = getBaseComponentId(component.id);
  const duration = component.schedule.duration ?? "";
  return `${type}:${baseId}:${duration}`;
};

export const getVisibleTimetableSignature = (timetable, viewRange) => {
  if (!timetable?.courses || !viewRange) {
    return null;
  }

  const range = getViewRangeSeconds(viewRange);
  const courseSignatures = [];

  timetable.courses.forEach((course) => {
    const componentSignatures = [];

    if (course.mainComponents) {
      course.mainComponents.forEach((component) => {
        const signature = buildComponentSignature(component, "MAIN", range);
        if (signature) componentSignatures.push(signature);
      });
    }

    if (course.secondaryComponents) {
      const { lab, tutorial, seminar } = course.secondaryComponents;
      const labSignature = buildComponentSignature(lab, "LAB", range);
      const tutSignature = buildComponentSignature(tutorial, "TUT", range);
      const semSignature = buildComponentSignature(seminar, "SEM", range);

      if (labSignature) componentSignatures.push(labSignature);
      if (tutSignature) componentSignatures.push(tutSignature);
      if (semSignature) componentSignatures.push(semSignature);
    }

    if (componentSignatures.length > 0) {
      componentSignatures.sort();
      courseSignatures.push(
        `${course.courseCode}|${componentSignatures.join(",")}`,
      );
    }
  });

  if (courseSignatures.length === 0) {
    return "no-visible-courses";
  }

  courseSignatures.sort();
  return courseSignatures.join("||");
};

export const getVisibleTimetables = (timetables, viewRange) => {
  if (!Array.isArray(timetables)) return [];
  if (!viewRange) return timetables;

  const uniqueSignatures = new Set();
  const filteredTimetables = [];

  timetables.forEach((timetable) => {
    const signature = getVisibleTimetableSignature(timetable, viewRange);
    if (signature == null) {
      filteredTimetables.push(timetable);
      return;
    }

    if (!uniqueSignatures.has(signature)) {
      uniqueSignatures.add(signature);
      filteredTimetables.push(timetable);
    }
  });

  return filteredTimetables;
};

// Get calendar view notification message
export const getCalendarViewNotificationMessage = (startDate) => {
  return (
    "Calendar View: " +
    startDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    })
  );
};
