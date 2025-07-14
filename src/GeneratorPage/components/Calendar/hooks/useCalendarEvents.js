import { useCallback, useRef } from "react";
import {
  createCalendarEvents,
  getDaysOfWeek,
} from "../../../scripts/createCalendarEvents";
import { getCourseData } from "../../../scripts/courseData";
import { checkForWeekendClasses } from "../utils/calendarUtils.jsx";

export const useCalendarEvents = ({
  timetables,
  currentTimetableIndex,
  courseColors,
  getDefaultColorForCourse,
  setCourseDetails,
  setEvents,
  setNoCourses,
  setNoTimetablesGenerated,
  setShowWeekends,
  handleLast,
}) => {
  const timetablesRef = useRef(timetables);
  const currentTimetableIndexRef = useRef(currentTimetableIndex);
  const courseColorsRef = useRef(courseColors);

  // Update refs when values change
  const updateRefs = useCallback(() => {
    timetablesRef.current = timetables;
    currentTimetableIndexRef.current = currentTimetableIndex;
    courseColorsRef.current = courseColors;
  }, [timetables, currentTimetableIndex, courseColors]);

  const updateCalendarEvents = useCallback(() => {
    const currentTimetables = timetablesRef.current;
    const currentIndex = currentTimetableIndexRef.current;
    const currentColors = { ...courseColorsRef.current };

    // Ensure all courses have colors
    if (
      currentTimetables.length > 0 &&
      currentTimetables[0].courses.length > 0
    ) {
      currentTimetables[0].courses.forEach((course) => {
        const courseCode = course.courseCode;
        if (!currentColors[courseCode]) {
          currentColors[courseCode] = getDefaultColorForCourse(courseCode);
        }
      });
    }

    if (
      currentIndex >= currentTimetables.length &&
      currentTimetables.length > 0
    ) {
      handleLast();
    }

    if (
      currentTimetables.length > 0 &&
      currentTimetables[0].courses.length > 0
    ) {
      setNoCourses(false);
      const timetable = currentTimetables[currentIndex];

      // Check if any courses have weekend classes
      const hasWeekendClasses = checkForWeekendClasses(timetable);
      setShowWeekends(hasWeekendClasses);

      const newEvents = createCalendarEvents(
        timetable,
        getDaysOfWeek,
        currentColors,
      );

      const courseDetails = newEvents
        .filter((event) => event.description)
        .map((event) => {
          let titleArray = event.title.trim().split(" ");
          return {
            name: titleArray[0],
            instructor: event.description,
            section: titleArray.pop(),
            startDate: event.startRecur,
            endDate: event.endRecur,
          };
        });

      setCourseDetails(courseDetails);
      setEvents(newEvents);
      setNoTimetablesGenerated(false);
    } else {
      setNoCourses(true);
      const newEvents = createCalendarEvents(
        null,
        getDaysOfWeek,
        currentColors,
      );
      setCourseDetails([]);
      setEvents(newEvents);
      if (Object.keys(getCourseData()).length > 0) {
        setNoTimetablesGenerated(true);
      }
    }
  }, [
    getDefaultColorForCourse,
    setCourseDetails,
    setEvents,
    setNoCourses,
    setNoTimetablesGenerated,
    setShowWeekends,
    handleLast,
  ]);

  return {
    updateCalendarEvents,
    updateRefs,
    timetablesRef,
    currentTimetableIndexRef,
    courseColorsRef,
  };
};
