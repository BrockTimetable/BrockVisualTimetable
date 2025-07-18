import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import ReactGA from "react-ga4";

import MultiLineSnackbar from "../../../SiteWide/components/MultiLineSnackbar";

import { storeCourseData, removeCourseData } from "../../scripts/courseData";
import { getCourse, getNameList } from "../../scripts/fetchData";
import {
  generateTimetables,
  getValidTimetables,
} from "../../scripts/timetableGeneration/timetableGeneration";
import { addPinnedComponent } from "../../scripts/pinnedComponents";

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
    setCourseCode(value.toUpperCase());
    setCourseInputValue(value);
  };

  const addCourse = async () => {
    if (!validateInputs()) return;

    const { cleanCourseCode, duration } = parseCourseCode(courseCode);

    if (isCourseAlreadyAdded(cleanCourseCode)) {
      enqueueSnackbar(<MultiLineSnackbar message="Course already added" />, {
        variant: "info",
      });
      return;
    }

    if (requestBlock) {
      enqueueSnackbar(
        <MultiLineSnackbar message="Fetching course data... Please Wait!" />,
        {
          variant: "warning",
        },
      );
      return;
    }

    requestBlock = true;
    try {
      const courseData = await getCourse(cleanCourseCode, timetableType, term);
      handleCourseData(courseData, cleanCourseCode, duration);
      setCourseInputValue(""); // Clear the input value
    } catch (error) {
      enqueueSnackbar(
        <MultiLineSnackbar message="Error fetching course data." />,
        { variant: "error" },
      );
    } finally {
      requestBlock = false;
    }
  };

  const validateInputs = () => {
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

    if (!isValidCourseCode(courseCode)) {
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

  const handleCourseData = (courseData, cleanCourseCode, duration) => {
    storeCourseData(courseData);
    setAddedCourses([...addedCourses, courseCode]);
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

  const handleSortChange = (e) => {
    setSortChoice(e.target.value);
    setSortOption(e.target.value);
    generateTimetables(e.target.value);
    setTimetables(getValidTimetables());
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
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
        </Grid>
        <Grid item xs={12}>
          <SortOptions
            sortChoice={sortChoice}
            handleSortChange={handleSortChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
