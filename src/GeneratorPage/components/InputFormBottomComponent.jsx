import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CourseList from "./InputFormComponents/Sections/CourseList";
import SourceCode from "./InputFormComponents/Sections/SourceCode";
import { removeCourseData } from "../scripts/courseData";

export default function InputFormBottomComponent({ addedCourses, setAddedCourses, setTimetables, sortOption, generateTimetables, getValidTimetables }) {
    const handleRemoveCourse = (course) => {
        const cleanCourseCode = course.split(" ").slice(0, 2).join("");
        setAddedCourses(addedCourses.filter((c) => c !== course));
        removeCourseData(cleanCourseCode);
        generateTimetables(sortOption);
        setTimetables(getValidTimetables());
    };

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <CourseList addedCourses={addedCourses} removeCourse={handleRemoveCourse} />
                </Grid>
                <Grid item xs={12}>
                    <SourceCode />
                </Grid>
            </Grid>
        </Box>
    );
}