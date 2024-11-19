import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CourseList from "./InputFormComponents/Sections/CourseList";
import SourceCode from "./InputFormComponents/Sections/SourceCode";

export default function InputFormBelowComponent({ addedCourses, removeCourse }) {
    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <CourseList addedCourses={addedCourses} removeCourse={removeCourse} />
                </Grid>
                <Grid item xs={12}>
                    <SourceCode />
                </Grid>
            </Grid>
        </Box>
    );
}