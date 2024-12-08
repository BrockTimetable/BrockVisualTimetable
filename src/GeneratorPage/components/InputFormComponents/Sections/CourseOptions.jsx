import React from "react";
import Box from "@mui/material/Box";
import TimeTableSelectComponent from "../TimeTableSelectComponent";
import TermSelectComponent from "../TermSelectComponent";
import CourseSearchComponent from "../CourseSearchComponent";
import AddButtonComponent from "../AddButtonComponent";
import BorderBox from "./BorderBox";

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
        <BorderBox title="Course Options">
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
        </BorderBox>
    );
}