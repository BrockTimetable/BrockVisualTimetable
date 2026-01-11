import { useCallback, useRef } from "react";
import { useSnackbar } from "notistack";
import MultiLineSnackbar from "@/components/sitewide/MultiLineSnackbar";

let previousDuration = null;

export const useTimetableManagement = ({
  timetables,
  setTimetables,
  currentTimetableIndex,
  setCurrentTimetableIndex,
  selectedDuration,
  setSelectedDuration,
  sortOption,
  calendarRef,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleNext = useCallback(() => {
    setCurrentTimetableIndex((currentTimetableIndex + 1) % timetables.length);
  }, [currentTimetableIndex, timetables.length, setCurrentTimetableIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentTimetableIndex(
      (currentTimetableIndex - 1 + timetables.length) % timetables.length,
    );
  }, [currentTimetableIndex, timetables.length, setCurrentTimetableIndex]);

  const handleFirst = useCallback(() => {
    setCurrentTimetableIndex(0);
  }, [setCurrentTimetableIndex]);

  const handleLast = useCallback(() => {
    setCurrentTimetableIndex(timetables.length - 1);
  }, [timetables.length, setCurrentTimetableIndex]);

  const handleCalendarViewClick = useCallback(
    (durationLabel) => {
      const calendarApi = calendarRef.current.getApi();
      const [startUnix, endUnix, duration] = durationLabel.split("-");

      const startDate = new Date(parseInt(startUnix) * 1000);
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

      calendarApi.gotoDate(navigationDate);

      if (previousDuration == null) {
        previousDuration = duration;
      } else if (previousDuration !== duration) {
        previousDuration = duration;
        setCurrentTimetableIndex(0);
      }

      setSelectedDuration(durationLabel);
      enqueueSnackbar(
        <MultiLineSnackbar
          message={
            "Calendar View: " +
            startDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })
          }
        />,
        {
          variant: "info",
        },
      );
    },
    [
      calendarRef,
      setCurrentTimetableIndex,
      setTimetables,
      setSelectedDuration,
      enqueueSnackbar,
      sortOption,
    ],
  );

  const setAprioriDurationTimetable = useCallback(() => {}, []);

  return {
    handleNext,
    handlePrevious,
    handleFirst,
    handleLast,
    handleCalendarViewClick,
    setAprioriDurationTimetable,
  };
};
