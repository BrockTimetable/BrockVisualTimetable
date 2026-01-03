import {
  isComponentPinned,
  pinComponent,
} from "../../../scripts/pinnedComponents";
import {
  generateTimetables,
  getValidTimetables,
} from "../../../scripts/timetableGeneration/timetableGeneration";
import { getBaseComponentId } from "../../../scripts/timetableGeneration/utils/componentIDUtils";

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

// Handle duration change logic with component pinning
export const handleDurationChange = (
  previousDuration,
  newDuration,
  aprioriDurationTimetable,
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
) => {
  if (previousDuration !== newDuration) {
    if (aprioriDurationTimetable && aprioriDurationTimetable.courses) {
      let didPinNewComponent = false;

      aprioriDurationTimetable.courses.forEach((course) => {
        const courseCode = course.courseCode;

        // Handle main components
        if (course.mainComponents) {
          course.mainComponents.forEach((component) => {
            if (
              component.schedule &&
              component.schedule.duration == previousDuration
            ) {
              const baseId = getBaseComponentId(component.id);
              if (!isComponentPinned(courseCode, "MAIN", baseId)) {
                pinComponent(courseCode, "MAIN", baseId);
                didPinNewComponent = true;
              }
            }
          });
        }

        // Handle secondary components
        if (course.secondaryComponents) {
          Object.entries(course.secondaryComponents).forEach(
            ([type, component]) => {
              if (
                component &&
                component.schedule &&
                component.schedule.duration == previousDuration
              ) {
                const formattedType =
                  type.toLowerCase() === "tutorial"
                    ? "TUT"
                    : type.toLowerCase() === "seminar"
                      ? "SEM"
                      : type.toUpperCase();

                const baseId = getBaseComponentId(component.id);
                if (!isComponentPinned(courseCode, formattedType, baseId)) {
                  pinComponent(courseCode, formattedType, baseId);
                  didPinNewComponent = true;
                }
              }
            },
          );
        }
      });

      setCurrentTimetableIndex(0);
      if (didPinNewComponent) {
        generateTimetables(sortOption);
        setTimetables(getValidTimetables());
      }
    }
  }
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
