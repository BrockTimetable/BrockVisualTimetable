import React, { useContext } from "react";
import CourseListItemComponent from "./CourseListItemComponent";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { CourseDetailsContext } from "../../contexts/CourseDetailsContext";
import { useTheme } from "@mui/material/styles";

export default function CourseListComponent({ courses = [], onRemoveCourse }) {
    const { courseDetails } = useContext(CourseDetailsContext);

    const getCourseDetail = (course) => {
        const courseName = course.split(" ").slice(0, 2).join("").toUpperCase();
        return courseDetails.find((detail) => detail.name === courseName);
    };

    return (
        <Box>
            {courses.length === 0 && <p style={{ textAlign: "center", bgcolor: "text.primary" }}>No courses added</p>}
            {courses.length > 0 && (
                <List
                    fullWidth
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
            )}
        </Box>
    );
}
