import React from 'react';
import Form from 'react-bootstrap/Form';
import '../../css/DepartmentSearch.css';

export default function CourseSearchComponent({ onCourseCodeChange }) {
  return (
    <>
      <h3 className='defaultLabel'>Step 3 Add a Course:</h3>
      <Form.Control
        onChange={onCourseCodeChange}
        placeholder='Example: COSC 1P02'
      />
    </>
  );
}
