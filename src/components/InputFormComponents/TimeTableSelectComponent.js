import React from 'react';
import Form from 'react-bootstrap/Form';
import '../../css/TermSelect.css';

export default function TimeTableSelectComponent({ onTableChange }) {

  function handleTableChange (event){
    const selectedTable = event.target.value;
    onTableChange(selectedTable);
  }

  return (
    <>
      <h3 className='defaultLabel'>Step 1 Select Time Table:</h3>
      <Form.Select size="sm" onChange={handleTableChange}>
        <option value="NOVALUE">Select Time Table</option>
        <option value="UG">New/Returning Students</option>
        <option value="AD">Adult Education</option>
        <option value="PS">Teacher Education</option>
        <option value="GR">Graduate Studies</option>
      </Form.Select>
    </>
  );
}

