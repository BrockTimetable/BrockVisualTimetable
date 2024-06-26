
import React from 'react';
import '../../css/TermSelect.css';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function TimetableSelectComponent({ onTableChange }) {
  const [timetable, setTimetable] = React.useState('');

  function handleTermChange (event){
    const selectedTimetable = event.target.value;
    setTimetable(selectedTimetable);
    
    onTableChange(selectedTimetable);
  }

  return (
    <>
      <Box sx={{ minWidth: 120 }} m={2} display={'inline'}>
      <FormControl>
        <InputLabel id='timetable-select-label'>Timetable</InputLabel>
        <Select
          labelId='timetable-select-label'
          value={timetable}
          label="Timetable"
          onChange={handleTermChange}
          sx={{ width: 225 }}
        >
          <MenuItem value={''}>Select Timetable</MenuItem>
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
