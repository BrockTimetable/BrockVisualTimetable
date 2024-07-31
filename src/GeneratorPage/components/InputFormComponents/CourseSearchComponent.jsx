import React from 'react';
import '../../css/DepartmentSearch.css';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';


export default function CourseSearchComponent({onCourseCodeChange}) {

  // this should be replaced with a call to the backend to get the list of courses
  // for now, we will just use a hardcoded list
  // https://github.com/iOlivers/BrockTimeTable/issues/2
  let courses = [
    "COSC 1P02 D2",
    "COSC 1P02 D3",
    "COSC 1P03 D2",
    "COSC 1P03 D3",
    "COSC 1P50 D2",
    "COSC 1P50 D3",
    "COSC 1P71 D3",
    "COSC 2P03 D2",
    "COSC 2P05 D3",
    "COSC 2P08 D3",
    "COSC 2P12 D2",
    "COSC 2P13 D3",
    "COSC 2P89 D2",
    "COSC 2P95 D2",
    "COSC 2P96 D2",
    "COSC 3P01 D2",
    "COSC 3P03 D2",
    "COSC 3P32 D3",
    "COSC 3P71 D2",
    "COSC 3P91 D3",
    "COSC 3P93 D2",
    "COSC 3P94 D3",
    "COSC 3P96 D3",
    "COSC 3P99 D2",
    "COSC 3P99 D3",
    "COSC 4P90 D1",
    "COSC 4P90 D3",
    "COSC 4P01 D2",
    "COSC 4P02 D3",
    "COSC 4P03 D3",
    "COSC 4P41 D2",
    "COSC 4P42 D2",
    "COSC 4P50 D3",
    "COSC 4P61 D2",
    "COSC 4P78 D3",
    "COSC 4P80 D2",
  ];

  const courseCodeChangeHandler = (e, newValue)=>{
    onCourseCodeChange(e, newValue);
  }

  return (
    <>
      <Box sx={{ minWidth: 120 }} m={2}>
        <Autocomplete
        disablePortal
        freeSolo
        onInputChange={courseCodeChangeHandler}
        options={courses}
        sx={{ width: 250 }}
        renderInput={(params) => <TextField {...params} label="Add a course" />}
        />
      </Box>
    </>
  );
}