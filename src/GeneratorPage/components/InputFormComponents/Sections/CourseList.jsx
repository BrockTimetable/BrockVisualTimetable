import React from "react";
import CourseListComponent from "../CourseListComponent";
import BorderBox from "./BorderBox";

export default function CourseList({ addedCourses, removeCourse }) {
    return (
        <BorderBox title="Course List">
            <CourseListComponent courses={addedCourses} onRemoveCourse={removeCourse} />
        </BorderBox>
    );
}