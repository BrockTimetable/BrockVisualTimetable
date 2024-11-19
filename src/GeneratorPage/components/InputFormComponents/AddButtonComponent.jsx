import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddBoxIcon from '@mui/icons-material/AddBox';

export default function AddButtonComponent({ onAddCourse }) {
  return (
    <Box>
      <Button variant="contained" onClick={onAddCourse} startIcon={<AddBoxIcon />}>
        Add Course
      </Button>
    </Box>
  );
}