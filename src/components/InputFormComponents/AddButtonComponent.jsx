import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function AddButtonComponent({ onAddCourse }) {
  return (
    <Box sx={{ minWidth: 120 }} m={2}>
      <Button variant="contained" onClick={onAddCourse} >Add Course</Button>
    </Box>
  );
}