
import React from "react";
import Box from "@mui/material/Box";
import CourseListComponent from "../CourseListComponent";

export default function CourseList({ addedCourses, removeCourse }) {
    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "primary.main",
                borderRadius: "8px",
                padding: "16px",
                position: "relative",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "primary.main",
                    padding: "4px 8px",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                }}
            >
                Course List
            </Box>
            <Box sx={{ height: "24px" }} />
            <CourseListComponent courses={addedCourses} onRemoveCourse={removeCourse} />
        </Box>
    );
}