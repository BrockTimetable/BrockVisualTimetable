import React from "react";

import CourseListItemComponent from "./CourseListItemComponent";

import ListSubheader from "@mui/material/ListSubheader";
import Box from "@mui/material/Box";
import List from "@mui/material/List";

export default function CourseListComponent({ courses = [], onRemoveCourse }) {
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
                {courses.map((course) => (
                    <CourseListItemComponent course={course} removeCourse={onRemoveCourse} key={course}/>
                ))}
            </List>
        </Box>
    );
}
