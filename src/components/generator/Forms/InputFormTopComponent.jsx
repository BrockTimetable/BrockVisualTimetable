import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";

import MultiLineSnackbar from "@/components/sitewide/MultiLineSnackbar";

import { storeCourseData } from "@/lib/generator/courseData";
import { trackCourseAddResult, trackScheduleGenerated } from "@/lib/metrics";
import { getCourse, getNameList } from "@/lib/generator/fetchData";
import {
  generateTimetables,
  getValidTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";
import { addPinnedComponent } from "@/lib/generator/pinnedComponents";

import CourseOptions from "./Settings/CourseOptions";
import SortOptions from "./Settings/SortOptions";

export default function InputFormTop({
  setTimetables,
  setSelectedDuration,
  setDurations,
  setSortOption,
  addedCourses,
  setAddedCourses,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [term, setTerm] = useState("FW");
  const [courseValue, setCourseValue] = useState("");
  const [timetableType, setTimetableType] = useState("UG");
  const [courseOptions, setCourseOptions] = useState([]);
  const [sortChoice, setSortChoice] = useState("default");
  const requestBlock = useRef(false);

  useEffect(() => {
    const fetchCourseOptions = async () => {
      if (term === "NOVALUE" || timetableType === "NOVALUE") return;
      try {
        const courses = await getNameList(timetableType, term);
        setCourseOptions(courses);
      } catch (error) {
        console.error("Error fetching course list:", error);
        enqueueSnackbar(
          <MultiLineSnackbar message="Error fetching course list." />,
          { variant: "error" },
        );
      }
    };

    fetchCourseOptions();
  }, [term, timetableType, enqueueSnackbar]);

  const handleTableChange = (selectedTable) => setTimetableType(selectedTable);
  const handleTermChange = (selectedTerm) => setTerm(selectedTerm);
  const handleCourseCodeChange = (e, value) => {
    setCourseValue(value || "");
  };
  const handleSetCourseValue = (value) => {
    setCourseValue(value || "");
  };

  const addCourse = async (overrideValue) => {
    const upperCode = ((overrideValue ?? courseValue) || "")
      .trim()
      .toUpperCase();
    const validationFailureReason = getValidationFailureReason(upperCode);
    if (validationFailureReason) {
      trackCourseAddFailure({
        failureReason: validationFailureReason,
        courseCount: addedCourses.length,
      });
      showValidationMessage(validationFailureReason);
      return;
    }

    const { cleanCourseCode, duration } = parseCourseCode(upperCode);
    const courseMetadata = getCourseAnalyticsMetadata(
      cleanCourseCode,
      duration,
    );

    if (isCourseAlreadyAdded(cleanCourseCode)) {
      trackCourseAddFailure({
        failureReason: "duplicate_course",
        courseCount: addedCourses.length,
        ...courseMetadata,
      });
      enqueueSnackbar(<MultiLineSnackbar message="Course already added" />, {
        variant: "info",
      });
      return;
    }

    if (requestBlock.current) {
      enqueueSnackbar(
        <MultiLineSnackbar message="Fetching course data... Please Wait!" />,
        {
          variant: "warning",
        },
      );
      return;
    }

    requestBlock.current = true;
    try {
      const courseData = await getCourse(cleanCourseCode, timetableType, term);
      handleCourseData(
        courseData,
        cleanCourseCode,
        duration,
        upperCode,
        courseMetadata,
      );
      // Clear input after a successful add
      setCourseValue("");
    } catch (error) {
      trackCourseAddFailure({
        failureReason: "fetch_error",
        courseCount: addedCourses.length,
        ...courseMetadata,
      });
      enqueueSnackbar(
        <MultiLineSnackbar message="Error fetching course data." />,
        { variant: "error" },
      );
    } finally {
      requestBlock.current = false;
    }
  };

  const getValidationFailureReason = (code) => {
    if (!timetableType || timetableType === "NOVALUE") {
      return "missing_timetable";
    }

    if (!term || term === "NOVALUE") {
      return "missing_term";
    }

    if (!isValidCourseCode(code)) {
      return "invalid_course_code";
    }

    return null;
  };

  const showValidationMessage = (failureReason) => {
    if (failureReason === "missing_timetable") {
      enqueueSnackbar(
        <MultiLineSnackbar message="Please select a timetable." />,
        { variant: "warning" },
      );
      return;
    }

    if (failureReason === "missing_term") {
      enqueueSnackbar(<MultiLineSnackbar message="Please select a term." />, {
        variant: "warning",
      });
      return;
    }

    if (failureReason === "invalid_course_code") {
      enqueueSnackbar(
        <MultiLineSnackbar message='Invalid course code! Example: "COSC 1P02 D2"' />,
        {
          variant: "warning",
        },
      );
    }
  };

  const isValidCourseCode = (code) => {
    const regex = /^[A-Z]{4} \d[A-Z]\d{2} D\d+$/;
    return regex.test(code);
  };

  const parseCourseCode = (code) => {
    const split = code.split(" ");
    const cleanCourseCode = split[0] + split[1];
    const duration = split[2].substring(1);
    return { cleanCourseCode, duration };
  };

  const getCourseAnalyticsMetadata = (cleanCourseCode, duration) => ({
    subjectCode: cleanCourseCode.substring(0, 4),
    courseLevel: cleanCourseCode.substring(4, 5),
    duration: `D${duration}`,
  });

  const trackCourseAddFailure = ({
    failureReason,
    courseCount,
    subjectCode,
    courseLevel,
    duration,
  }) => {
    trackCourseAddResult({
      result: "failure",
      failureReason,
      subjectCode,
      courseLevel,
      duration,
      term,
      timetableType,
      courseCount,
    });
  };

  const isCourseAlreadyAdded = (cleanCourseCode) => {
    return addedCourses.some((course) =>
      course.startsWith(
        cleanCourseCode.substring(0, 4) + " " + cleanCourseCode.substring(4),
      ),
    );
  };

  const handleCourseData = (
    courseData,
    cleanCourseCode,
    duration,
    courseCodeLabel,
    courseMetadata,
  ) => {
    storeCourseData(courseData);
    const updatedCourseCount = addedCourses.length + 1;
    setAddedCourses([...addedCourses, courseCodeLabel]);
    addPinnedComponent(`${cleanCourseCode} DURATION ${duration}`);
    generateTimetables(sortChoice);
    const validTimetables = getValidTimetables();
    setTimetables(validTimetables);

    const { durationStartDate, durationEndDate } = getDurationDates(
      courseData,
      duration,
    );
    if (durationStartDate && durationEndDate) {
      const durationLabel = `${durationStartDate}-${durationEndDate}-${duration}`;
      updateDurations(durationLabel);
    }

    trackCourseAddResult({
      result: "success",
      ...courseMetadata,
      term,
      timetableType,
      courseCount: updatedCourseCount,
    });
    trackScheduleGenerated({
      trigger: "course_added",
      courseCount: updatedCourseCount,
      resultCount: validTimetables.length,
      sortOption: sortChoice,
      hasResults: validTimetables.length > 0,
    });
  };

  const getDurationDates = (courseData, duration) => {
    for (let key in courseData.sections) {
      let section = courseData.sections[key];
      if (section.schedule.duration === duration) {
        return {
          durationStartDate: section.schedule.startDate,
          durationEndDate: section.schedule.endDate,
        };
      }
    }
    return {};
  };

  const updateDurations = (durationLabel) => {
    setDurations((prevDurations) => {
      if (!prevDurations.includes(durationLabel)) {
        return [...prevDurations, durationLabel];
      }
      return prevDurations;
    });
    setSelectedDuration(durationLabel);
  };

  const handleSortChange = (value) => {
    setSortChoice(value);
    setSortOption(value);
    generateTimetables(value);
    setTimetables(getValidTimetables());
  };

  return (
    <div className="space-y-4">
      <CourseOptions
        term={term}
        timetableType={timetableType}
        courseOptions={courseOptions}
        courseValue={courseValue}
        handleTableChange={handleTableChange}
        handleTermChange={handleTermChange}
        handleCourseCodeChange={handleCourseCodeChange}
        setCourseValue={handleSetCourseValue}
        addCourse={addCourse}
      />
      <SortOptions
        sortChoice={sortChoice}
        handleSortChange={handleSortChange}
      />
    </div>
  );
}

InputFormTop.propTypes = {
  setTimetables: PropTypes.func.isRequired,
  setSelectedDuration: PropTypes.func.isRequired,
  setDurations: PropTypes.func.isRequired,
  setSortOption: PropTypes.func.isRequired,
  addedCourses: PropTypes.arrayOf(PropTypes.string).isRequired,
  setAddedCourses: PropTypes.func.isRequired,
};
