import React from "react";
import CourseListComponent from "./CourseListComponent";
import BorderBox from "../../UI/BorderBox";

export default function CourseList({
  addedCourses,
  removeCourse,
  setTimetables,
  sortOption,
}) {
  return (
    <BorderBox title="Course List">
      <CourseListComponent
        courses={addedCourses}
        onRemoveCourse={removeCourse}
        setTimetables={setTimetables}
        sortOption={sortOption}
      />
    </BorderBox>
  );
}
