import { useState, useEffect } from "react";
import ReactGA from "react-ga4";
import { toast } from "sonner";

import MultiLineSnackbar from "../../../SiteWide/components/MultiLineSnackbar";

import { storeCourseData } from "../../scripts/courseData";
import { getCourse, getNameList } from "../../scripts/fetchData";
import {
  generateTimetables,
  getValidTimetables,
} from "../../scripts/timetableGeneration/timetableGeneration";
import { pinCourseDuration } from "../../scripts/pinnedComponents";

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
  const [term, setTerm] = useState("FW");
  const [courseCode, setCourseCode] = useState("");
  const [courseInputValue, setCourseInputValue] = useState("");
  const [timetableType, setTimetableType] = useState("UG");
  const [courseOptions, setCourseOptions] = useState([]);
  const [sortChoice, setSortChoice] = useState("default");
  let requestBlock = false;

  useEffect(() => {
    const fetchCourseOptions = async () => {
      if (term === "NOVALUE" || timetableType === "NOVALUE") return;
      try {
        const courses = await getNameList(timetableType, term);
        setCourseOptions(courses);
      } catch (error) {
        console.error("Error fetching course list:", error);
        toast.error(
          <MultiLineSnackbar message="Error fetching course list." />,
        );
      }
    };

    fetchCourseOptions();
  }, [term, timetableType]);

  const handleTableChange = (selectedTable) => setTimetableType(selectedTable);
  const handleTermChange = (selectedTerm) => setTerm(selectedTerm);
  const handleCourseCodeChange = (e, value) => {
    setCourseCode(value.toUpperCase());
    setCourseInputValue(value);
  };

  const addCourse = async () => {
    if (!validateInputs()) return;

    const originalCourseCode = courseCode;
    const { cleanCourseCode, duration } = parseCourseCode(originalCourseCode);

    if (isCourseAlreadyAdded(cleanCourseCode)) {
      toast.info(<MultiLineSnackbar message="Course already added" />);
      return;
    }

    if (requestBlock) {
      toast.warning(
        <MultiLineSnackbar message="Fetching course data... Please Wait!" />,
      );
      return;
    }

    requestBlock = true;
    try {
      const courseData = await getCourse(cleanCourseCode, timetableType, term);
      handleCourseData(
        courseData,
        cleanCourseCode,
        duration,
        originalCourseCode,
      );
      // Clear the input and remount the autocomplete to ensure it resets
      setCourseInputValue("");
      setCourseCode("");
    } catch (error) {
      toast.error(<MultiLineSnackbar message="Error fetching course data." />);
    } finally {
      requestBlock = false;
    }
  };

  const validateInputs = () => {
    if (!timetableType || timetableType === "NOVALUE") {
      toast.warning(<MultiLineSnackbar message="Please select a timetable." />);
      return false;
    }

    if (!term || term === "NOVALUE") {
      toast.warning(<MultiLineSnackbar message="Please select a term." />);
      return false;
    }

    if (!isValidCourseCode(courseCode)) {
      toast.warning(
        <MultiLineSnackbar message='Invalid course code! Example: "COSC 1P02 D2"' />,
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
    pinCourseDuration(cleanCourseCode, duration);
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

    ReactGA.event({
      category: "Generator Event",
      action: "Added Course",
      label: `${cleanCourseCode} D${duration}`,
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
        courseInputValue={courseInputValue}
        handleTableChange={handleTableChange}
        handleTermChange={handleTermChange}
        handleCourseCodeChange={handleCourseCodeChange}
        addCourse={addCourse}
        setCourseInputValue={setCourseInputValue}
      />
      <SortOptions
        sortChoice={sortChoice}
        handleSortChange={handleSortChange}
      />
    </div>
  );
}
