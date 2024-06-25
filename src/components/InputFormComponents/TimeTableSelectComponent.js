
import React from 'react';
import Form from 'react-bootstrap/Form';
import '../../css/TermSelect.css';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function TimetableSelectComponent({ onTableChange }) {
  const [timetable, setTimetable] = React.useState('NOVALUE');

  function handleTermChange (event){
    const selectedTimetable = event.target.value;
    setTimetable(selectedTimetable);
    
    onTableChange(selectedTimetable);
  }

  return (
    <>
      <Box sx={{ minWidth: 120 }} m={2} display={'inline'}>
      <FormControl>
        <InputLabel>Timetable</InputLabel>
        <Select
          value={timetable}
          label="Term"
          onChange={handleTermChange}
        >
          <MenuItem value={'NOVALUE'}>Select Timetable</MenuItem>
          <MenuItem value={'UG'}>New/Returning Students</MenuItem>
          <MenuItem value={'AD'}>Adult Education</MenuItem>
          <MenuItem value={'PS'}>Teacher Education</MenuItem>
          <MenuItem value={'GR'}>Graduate Studies</MenuItem>
        </Select>
      </FormControl>
    </Box>
    </>
  );
}

/*

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
*/
