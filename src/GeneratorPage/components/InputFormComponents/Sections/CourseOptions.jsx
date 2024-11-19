
import React from "react";
import Box from "@mui/material/Box";
import TimeTableSelectComponent from "../TimeTableSelectComponent";
import TermSelectComponent from "../TermSelectComponent";
import CourseSearchComponent from "../CourseSearchComponent";
import AddButtonComponent from "../AddButtonComponent";

export default function CourseOptions({
    term,
    timetableType,
    courseOptions,
    courseInputValue,
    handleTableChange,
    handleTermChange,
    handleCourseCodeChange,
    addCourse,
    setCourseInputValue,
}) {
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
                Course Options
            </Box>
            <Box sx={{ height: "24px" }} />
            <TimeTableSelectComponent onTableChange={handleTableChange} />
            <Box sx={{ height: "16px" }} />
            <TermSelectComponent onTermChange={handleTermChange} />
            <Box sx={{ height: "16px" }} />
            <CourseSearchComponent
                onCourseCodeChange={handleCourseCodeChange}
                courseOptions={courseOptions}
                timetableType={timetableType}
                term={term}
                onEnterPress={addCourse}
                inputValue={courseInputValue}
                setInputValue={setCourseInputValue}
            />
            <Box sx={{ height: "16px" }} />
            <AddButtonComponent onAddCourse={addCourse} />
        </Box>
    );
}