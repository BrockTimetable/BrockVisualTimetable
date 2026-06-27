import { useEffect } from "react";
import eventBus from "@/lib/eventBus";

export const useEventBusHandlers = ({
  setCurrentTimetableIndex,
  setIsTruncated,
  setTimeslotsOverridden,
  setConflictPresent,
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

  useEffect(() => {
    const handleConflict = (info) => {
      setConflictPresent(Boolean(info));
    };
    eventBus.on("conflict", handleConflict);
    return () => {
      eventBus.off("conflict", handleConflict);
    };
  }, [setConflictPresent]);
};
