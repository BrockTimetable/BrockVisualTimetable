import React, { useContext } from "react";
import CourseListItemComponent from "./CourseListItemComponent";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { CourseDetailsContext } from "../../contexts/CourseDetailsContext";

export default function CourseListComponent({ courses = [], onRemoveCourse }) {
  const { courseDetails } = useContext(CourseDetailsContext);

  const getCourseDetail = (course) => {
    const courseName = course.split(" ").slice(0, 2).join("").toUpperCase();
    return courseDetails.find((detail) => detail.name === courseName);
  };

  return (
    <Box sx={{ minWidth: 120 }} m={2}>
      <h5 style={{ fontWeight: "normal" }}>
        Added Courses (Click to see more details):
      </h5>
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        {courses.map((course) => (
          <CourseListItemComponent
            course={course}
            courseDetail={getCourseDetail(course)}
            removeCourse={onRemoveCourse}
            key={course}
          />
        ))}
      </List>
    </Box>
  );
}
