import React from 'react'
import Form from 'react-bootstrap/Form';
import '../css/TermSelect.css'
export default function TermSelectComponent() {
  return (
    <>
    <h3 className='defaultLabel'>Step 1 Select Term:</h3>
    <Form.Select size="sm">
      <option>Select Term</option>
      <option value="1">Fall/Winter</option>
      <option value="2">Spring</option>
      <option value="3">Summer</option>
    </Form.Select>
    </>
  )
}
