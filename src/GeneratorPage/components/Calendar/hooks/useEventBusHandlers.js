import { useEffect } from "react";
import eventBus from "../../../../SiteWide/Buses/eventBus";

export const useEventBusHandlers = ({
  setCurrentTimetableIndex,
  setIsTruncated,
  setTimeslotsOverridden,
}) => {
  useEffect(() => {
    eventBus.on("requestSetTimetableIndex", () => {
      eventBus.emit("setTimetableIndex", setCurrentTimetableIndex);
    });

    return () => {
      eventBus.off("requestSetTimetableIndex");
    };
  }, [setCurrentTimetableIndex]);

  useEffect(() => {
    const handleTruncation = (status) => {
      setIsTruncated(status);
    };
    eventBus.on("truncation", handleTruncation);
    return () => {
      eventBus.off("truncation", handleTruncation);
    };
  }, [setIsTruncated]);

  useEffect(() => {
    const handleTimeslotsOverridden = (status) => {
      setTimeslotsOverridden(status);
    };
    eventBus.on("overridden", handleTimeslotsOverridden);
    return () => {
      eventBus.off("overridden", handleTimeslotsOverridden);
    };
  }, [setTimeslotsOverridden]);
};
