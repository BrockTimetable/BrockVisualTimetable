import {
  createContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { defaultColors } from "./courseColorPalette";

export const CourseColorsContext = createContext();

export const CourseColorsProvider = ({ children }) => {
  const [courseColors, setCourseColors] = useState({});
  const [usedColors, setUsedColors] = useState([]);
  const usedColorsRef = useRef([]);
  const calendarHandlerRef = useRef(null);

  const setCalendarUpdateHandler = useCallback((handler) => {
    calendarHandlerRef.current = handler;
  }, []);

  const updateCalendarColors = useCallback(() => {
    if (calendarHandlerRef.current) {
      calendarHandlerRef.current();
    }
  }, []);

  const getNextColor = useCallback(() => {
    const currentUsedColors = usedColorsRef.current;
    const availableColors = defaultColors.filter(
      (color) => !currentUsedColors.includes(color),
    );
    if (availableColors.length === 0) {
      // If all colors are used, start over with a slight variation
      const colorIndex = currentUsedColors.length % defaultColors.length;
      return defaultColors[colorIndex];
    }
    return availableColors[0];
  }, []);

  useEffect(() => {
    usedColorsRef.current = usedColors;
  }, [usedColors]);

  const colourTimeoutRef = useRef(false);
  const updateCourseColor = useCallback(
    (courseCode, color) => {
      if (!colourTimeoutRef.current) {
        colourTimeoutRef.current = true;

        setCourseColors((prev) => {
          const oldColor = prev[courseCode];
          if (oldColor) {
            setUsedColors((current) => current.filter((c) => c !== oldColor));
          }
          setUsedColors((current) => [...current, color]);
          return {
            ...prev,
            [courseCode]: color,
          };
        });

        updateCalendarColors();

        setTimeout(() => {
          colourTimeoutRef.current = false;
        }, 50);
      }
    },
    [updateCalendarColors],
  );

  // Bulk-apply a saved { courseCode: hex } map (used when restoring a shared URL).
  // Bypasses updateCourseColor's debounce so every color lands in one pass.
  const restoreCourseColors = useCallback((colorMap) => {
    const map = colorMap || {};
    setCourseColors(map);
    setUsedColors(Object.values(map));
  }, []);

  const getDefaultColorForCourse = useCallback(
    (courseCode) => {
      if (courseColors[courseCode]) {
        return courseColors[courseCode];
      }
      return getNextColor();
    },
    [courseColors, getNextColor],
  );

  const initializeCourseColor = useCallback((courseCode) => {
    setCourseColors((prev) => {
      if (prev[courseCode]) {
        return prev;
      }
      const currentUsedColors = usedColorsRef.current;
      const availableColors = defaultColors.filter(
        (color) => !currentUsedColors.includes(color),
      );
      let newColor;
      if (availableColors.length === 0) {
        const colorIndex = currentUsedColors.length % defaultColors.length;
        newColor = defaultColors[colorIndex];
      } else {
        newColor = availableColors[0];
      }
      // Update usedColors
      setUsedColors((current) => [...current, newColor]);
      return {
        ...prev,
        [courseCode]: newColor,
      };
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      courseColors,
      updateCourseColor,
      getDefaultColorForCourse,
      initializeCourseColor,
      restoreCourseColors,
      setCalendarUpdateHandler,
    }),
    [
      courseColors,
      updateCourseColor,
      getDefaultColorForCourse,
      initializeCourseColor,
      restoreCourseColors,
      setCalendarUpdateHandler,
    ],
  );

  return (
    <CourseColorsContext.Provider value={contextValue}>
      {children}
    </CourseColorsContext.Provider>
  );
};

CourseColorsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
