import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import '../../css/CourseList.css';

export default function CourseListComponent({ courses = [], onRemoveCourse }) { // Default value for courses
  return (
    <div id="courseListContainer">
      <h3 className='defaultLabel' id="courseListTitle">Added Courses (Click to Remove):</h3>
      <ListGroup>
        {courses.map(course => (
          <ListGroup.Item key={course} onClick={() => onRemoveCourse(course)}>
            {course}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}