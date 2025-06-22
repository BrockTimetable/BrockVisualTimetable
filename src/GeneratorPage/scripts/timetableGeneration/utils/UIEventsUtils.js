import eventBus from "../../../../SiteWide/Buses/eventBus";
import ReactGA from "react-ga4";

export const emitNoValidTimetablesFound = () => {
  eventBus.emit("snackbar", {
    message:
      "No valid timetables could be generated. Courses may always overlap!",
    variant: "error",
  });
};

export const emitTimetableOverridden = () => {
  eventBus.emit("overridden", true);
  eventBus.emit("snackbar", {
    message:
      "All available options for one or more course components were blocked. One or more user-defined time blocks has been overridden to find a valid timetable.",
    variant: "warning",
  });
};

export const clearOverriddenFlag = () => {
  eventBus.emit("overridden", false);
};

export const sortTimetableIndexReset = (sortOption, previousSortOption) => {
  if (sortOption !== previousSortOption) {
    eventBus.on("setTimetableIndex", (setCurrentTimetableIndex) => {
      if (setCurrentTimetableIndex) {
        setCurrentTimetableIndex(0);
      }
    });
    eventBus.emit("requestSetTimetableIndex");
    return sortOption;
  }
  return previousSortOption;
};

export const emitTruncationWarning = () => {
  eventBus.emit("truncation", true);
  eventBus.emit("snackbar", {
    message:
      "The generated schedule results are truncated! Click the yellow '!' icon for more information!",
    variant: "warning",
  });
  ReactGA.event({
    category: "Generator Event",
    action: "Truncation",
  });
};

export const clearTruncationFlag = () => {
  eventBus.emit("truncation", false);
};
