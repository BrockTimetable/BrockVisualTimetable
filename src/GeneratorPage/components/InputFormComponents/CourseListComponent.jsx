import React, { useContext} from "react";
import CourseListItemComponent from "./CourseListItemComponent";
import ListSubheader from "@mui/material/ListSubheader";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { CourseDetailsContext } from "../../contexts/CourseDetailsContext";

export default function CourseListComponent({ courses = [], onRemoveCourse }) {
    const { courseDetails } = useContext(CourseDetailsContext);
    return (
        <Box sx={{ minWidth: 120 }} m={2}>
            <List
                sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                subheader={
                    <ListSubheader component="div">
                        Added Courses (Click to see more details):
                    </ListSubheader>
                }
            >
                {courses.map((course) => {
                    const courseName = course.split(" ")[0] + course.split(" ")[1];
                    const courseDetail = courseDetails.find(detail => detail.name === courseName);
                    return (
                        <CourseListItemComponent
                            course={course}
                            courseDetail={courseDetail}
                            removeCourse={onRemoveCourse}
                            key={course}
                        />
                    );
                })}
            </List>
        </Box>
    );
}
