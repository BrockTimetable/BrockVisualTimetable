import React, { useState } from 'react';
import CourseSearchComponent from './InputFormComponents/CourseSearchComponent';
import TermSelectComponent from './InputFormComponents/TermSelectComponent';
import TimeTableSelectComponent from './InputFormComponents/TimeTableSelectComponent';
import AddButtonComponent from './InputFormComponents/AddButtonComponent';
import CourseListComponent from './InputFormComponents/CourseListComponent';
import { getCourse } from '../scripts/fetchData';

export default function InputFormComponent() {
  const [term, setTerm] = useState('NOVALUE');
  const [courseCode, setCourseCode] = useState('');
  const [timetableType, setTimetableType] = useState('NOVALUE');
  const [addedCourses, setAddedCourses] = useState([]);

  const handleTableChange = (selectedTable) => {
    setTimetableType(selectedTable);
  };

  const handleTermChange = (selectedTerm) => {
    setTerm(selectedTerm);
  };

  const handleCourseCodeChange = (e) => {
    setCourseCode(e.target.value);
  };

  const addCourse = async () => {

    if (!courseCode || term === 'NOVALUE') {
      alert('Please enter a valid course code and select a term');
      return;
    }
    
    if (addedCourses.includes(courseCode)) {
        alert('Course already added');
        return;
      }

    try {
      const courseData = await getCourse(courseCode, timetableType, term);
      setAddedCourses([...addedCourses, courseCode]);
      console.log(courseData);
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  };

  const removeCourse = (course) => {
    setAddedCourses(addedCourses.filter(c => c !== course));
  };

  return (
    <>
      <TimeTableSelectComponent onTableChange={handleTableChange} />
      <TermSelectComponent onTermChange={handleTermChange} />
      <CourseSearchComponent onCourseCodeChange={handleCourseCodeChange} />
      <AddButtonComponent onAddCourse={addCourse} />
      <CourseListComponent courses={addedCourses} onRemoveCourse={removeCourse} />
    </>
  );
}