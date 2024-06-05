import React from 'react'
import ListGroup from 'react-bootstrap/ListGroup';
import '../css/CourseList.css'
export default function CourseListComponent() {
  return (
    <>
        <div id="courseListContainer">
            <h3 className='defaultLabel' id="courseListTitle">Added Courses:</h3>
            <ListGroup>
            <ListGroup.Item>ABCD 1234</ListGroup.Item>
            <ListGroup.Item>WXYZ 0987</ListGroup.Item>
            </ListGroup>
        </div>
    </>
  )
}
