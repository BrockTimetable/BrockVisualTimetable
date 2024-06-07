import React from 'react';
import Form from 'react-bootstrap/Form';
import '../../css/TermSelect.css';

export default function TermSelectComponent({ onTermChange }) {

  function handleTermChange (event){
    const selectedTerm = event.target.value;
    onTermChange(selectedTerm);
  }

  return (
    <>
      <h3 className='defaultLabel'>Step 2 Select Term:</h3>
      <Form.Select size="sm" onChange={handleTermChange}>
        <option value="NOVALUE">Select Term</option>
        <option value="FW">Fall/Winter</option>
        <option value="SP">Spring</option>
        <option value="SU">Summer</option>
      </Form.Select>
    </>
  );
}

