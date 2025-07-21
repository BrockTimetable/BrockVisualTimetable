import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CourseList from "./CourseList/CourseList";
import SourceCode from "../UI/SourceCode";
import PerformanceMetrics from "./Settings/PerformanceMetrics";
import Tips from "./Settings/Tips";
import ExportOptions from "./Settings/ExportOptions";
import { removeCourseData } from "../../scripts/courseData";
import { removePinnedComponent } from "../../scripts/pinnedComponents";

export default function InputFormBottomComponent({
  addedCourses,
  setAddedCourses,
  setTimetables,
  sortOption,
  generateTimetables,
  getValidTimetables,
}) {
  const handleRemoveCourse = (course) => {
    const cleanCourseCode = course.split(" ").slice(0, 2).join("");
    setAddedCourses(addedCourses.filter((c) => c !== course));
    removeCourseData(cleanCourseCode);
    removePinnedComponent(
      `${cleanCourseCode} DURATION ${course.split(" ")[2].substring(1)}`,
    );
    generateTimetables(sortOption);
    setTimetables(getValidTimetables());
  };

  return (
    <Box>
      <Grid container spacing={{ xs: 0, sm: 2 }}>
        <Grid item xs={12}>
          <CourseList
            addedCourses={addedCourses}
            removeCourse={handleRemoveCourse}
            setTimetables={setTimetables}
            sortOption={sortOption}
          />
        </Grid>
        <Grid item xs={12}>
          <Tips />
        </Grid>
        {process.env.NODE_ENV === "development" && (
          <Grid item xs={12}>
            <PerformanceMetrics />
          </Grid>
        )}
        <Grid item xs={12}>
          <ExportOptions />
        </Grid>
        <Grid item xs={12}>
          <SourceCode />
        </Grid>
      </Grid>
    </Box>
  );
}
