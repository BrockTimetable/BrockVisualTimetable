import React, { useState, useEffect } from 'react';
import CourseSearchComponent from './InputFormComponents/CourseSearchComponent';
import TermSelectComponent from './InputFormComponents/TermSelectComponent';
import TimeTableSelectComponent from './InputFormComponents/TimeTableSelectComponent';
import AddButtonComponent from './InputFormComponents/AddButtonComponent';
import CourseListComponent from './InputFormComponents/CourseListComponent';
import { storeCourseData, removeCourseData } from '../scripts/courseData';
import { getCourse } from '../scripts/fetchData';
import { generateTimetables, getValidTimetables } from '../scripts/generateTimetables';
import { addPinnedComponent, clearCoursePins, getPinnedComponents } from '../scripts/pinnedComponents'
import Box from '@mui/material/Box';

export default function InputFormComponent({ setTimetables }) {
  const [term, setTerm] = useState('NOVALUE');
  let [courseCode, setCourseCode] = useState('');
  const [timetableType, setTimetableType] = useState('NOVALUE');
  const [addedCourses, setAddedCourses] = useState([]);

  const handleTableChange = (selectedTable) => {
    setTimetableType(selectedTable);
  };

  const handleTermChange = (selectedTerm) => {
    setTerm(selectedTerm);
  };

  const handleCourseCodeChange = (e, value) => {
    setCourseCode(value);
  };

  const addCourse = async () => {
    if (!courseCode || term === 'NOVALUE') {
      alert('Please enter a valid course code and select a term');
      return;
    }

    const split = courseCode.split(" ");
    if (split.length != 3 || !split[2].includes("D")){
      alert('Incorrect Course Code Format!\n\nMust use: XXXX #X## D#\n\nExample: COSC 1P02 D2');
      return;
    }

    const cleanCourseCode = split[0] + split[1];
    const duration = split[2].substring(1);
    let alreadyAdded = false;
    addedCourses.forEach(course => {
      if (course.startsWith(cleanCourseCode.substring(0,4) + " " + cleanCourseCode.substring(4))){
        alreadyAdded = true;
        return;
      }
    });

    if (alreadyAdded){
      alert('Course already added');
      return;
    }

    try {
      const courseData = await getCourse(cleanCourseCode, timetableType, term);
      storeCourseData(courseData);
      setAddedCourses([...addedCourses, courseCode]);
      addPinnedComponent(cleanCourseCode + " DURATION " + duration);
      generateTimetables(); 
      setTimetables(getValidTimetables()); 
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  };

  const removeCourse = (course) => {
    const split = course.split(" ");
    const cleanCourseCode = split[0] + split[1];
    setAddedCourses(addedCourses.filter(c => c !== course));
    removeCourseData(cleanCourseCode);
    clearCoursePins(cleanCourseCode);
    generateTimetables();
    setTimetables(getValidTimetables()); 
  };

  return (
    <>
      <Box sx={{ minWidth: 120 }} m={2}>
        <TimeTableSelectComponent onTableChange={handleTableChange} />
        <TermSelectComponent onTermChange={handleTermChange} />
        <CourseSearchComponent onCourseCodeChange={handleCourseCodeChange} />
        <AddButtonComponent onAddCourse={addCourse} />
        <CourseListComponent courses={addedCourses} onRemoveCourse={removeCourse} />
      </Box>
    </>
  );
}