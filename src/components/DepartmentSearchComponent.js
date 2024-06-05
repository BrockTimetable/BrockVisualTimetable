import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import '../css/DepartmentSearch.css'
export default function DepartmentSearchComponent() {
  return (
    <>
      <h3 className='defaultLabel'>Step 2: Add a Course (Ex: COSC 1P02)</h3>
      <Form.Control className=''>
      </Form.Control>
      <Button variant="success" className='defaultButton'>Add</Button>
    </>
  )
}
