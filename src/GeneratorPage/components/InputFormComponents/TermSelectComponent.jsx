import React from 'react';
import '../../css/TermSelect.css';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function TermSelectComponent({ onTermChange }) {
  const [term, setTerm] = React.useState('');

  function handleTermChange (event){
    const selectedTerm = event.target.value;
    setTerm(selectedTerm);
    
    onTermChange(selectedTerm);
  }

  return (
    <>
      <Box sx={{ minWidth: 120 }} m={2} display={'inline'}>
      <FormControl id = 'termSelectComponent'>
        <InputLabel id='term-select-label'>Term</InputLabel>
        <Select
          labelId='term-select-label'
          value={term}
          label="Term"
          onChange={handleTermChange}
          sx={{ width: 125 }}
        >
          <MenuItem value={''}>Select Term</MenuItem>
          <MenuItem disabled={false} value={'FW'}>Fall/Winter</MenuItem>
          <MenuItem disabled={true} value={'SP'}>Spring</MenuItem>
          <MenuItem disabled={true} value={'SU'}>Summer</MenuItem>
        </Select>
      </FormControl>
    </Box>
    </>
  );
}