import React from "react";
import Box from "@mui/material/Box";
import TimeTableSelectComponent from "../CourseSearch/TimeTableSelectComponent";
import TermSelectComponent from "../CourseSearch/TermSelectComponent";
import CourseSearchComponent from "../CourseSearch/CourseSearchComponent";
import BorderBox from "../../UI/BorderBox";

export default function CourseOptions({
  term,
  timetableType,
  courseOptions,
  courseValue,
  handleTableChange,
  handleTermChange,
  handleCourseCodeChange,
  setCourseValue,
  addCourse,
}) {
  return (
    <BorderBox title="Course Options">
      <TimeTableSelectComponent onTableChange={handleTableChange} />
      <Box sx={{ height: "12px" }} />
      <TermSelectComponent onTermChange={handleTermChange} />
      <Box sx={{ height: "12px" }} />
      <CourseSearchComponent
        onCourseCodeChange={handleCourseCodeChange}
        courseOptions={courseOptions}
        timetableType={timetableType}
        term={term}
        onEnterPress={addCourse}
        value={courseValue}
        setValue={setCourseValue}
      />
    </BorderBox>
  );
}
