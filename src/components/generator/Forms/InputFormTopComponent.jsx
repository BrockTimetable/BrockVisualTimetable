import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import ReactGA from "react-ga4";

import MultiLineSnackbar from "@/components/sitewide/MultiLineSnackbar";

import { storeCourseData, removeCourseData } from "@/lib/generator/courseData";
import { getCourse, getNameList } from "@/lib/generator/fetchData";
import {
  generateTimetables,
  getValidTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";
import { addPinnedComponent } from "@/lib/generator/pinnedComponents";

import CourseOptions from "./Settings/CourseOptions";
import SortOptions from "./Settings/SortOptions";

const isAnalyticsEnabled = import.meta.env.PROD;

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
    if (!validateInputs(upperCode)) return;

    const { cleanCourseCode, duration } = parseCourseCode(upperCode);

    if (isCourseAlreadyAdded(cleanCourseCode)) {
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
      handleCourseData(courseData, cleanCourseCode, duration, upperCode);
      // Clear input after a successful add
      setCourseValue("");
    } catch (error) {
      enqueueSnackbar(
        <MultiLineSnackbar message="Error fetching course data." />,
        { variant: "error" },
      );
    } finally {
      requestBlock.current = false;
    }
  };

  const validateInputs = (code) => {
    if (!timetableType || timetableType === "NOVALUE") {
      enqueueSnackbar(
        <MultiLineSnackbar message="Please select a timetable." />,
        { variant: "warning" },
      );
      return false;
    }

    if (!term || term === "NOVALUE") {
      enqueueSnackbar(<MultiLineSnackbar message="Please select a term." />, {
        variant: "warning",
      });
      return false;
    }

    if (!isValidCourseCode(code)) {
      enqueueSnackbar(
        <MultiLineSnackbar message='Invalid course code! Example: "COSC 1P02 D2"' />,
        {
          variant: "warning",
        },
      );
      return false;
    }

    return true;
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
  ) => {
    storeCourseData(courseData);
    setAddedCourses([...addedCourses, courseCodeLabel]);
    addPinnedComponent(`${cleanCourseCode} DURATION ${duration}`);
    generateTimetables(sortChoice);
    setTimetables(getValidTimetables());

    const { durationStartDate, durationEndDate } = getDurationDates(
      courseData,
      duration,
    );
    if (durationStartDate && durationEndDate) {
      const durationLabel = `${durationStartDate}-${durationEndDate}-${duration}`;
      updateDurations(durationLabel);
    }

    if (isAnalyticsEnabled) {
      ReactGA.event({
        category: "Generator Event",
        action: "Added Course",
        label: `${cleanCourseCode} D${duration}`,
      });
    }
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
