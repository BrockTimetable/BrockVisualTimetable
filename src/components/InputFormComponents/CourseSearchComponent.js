import React from 'react';
import Form from 'react-bootstrap/Form';
import '../../css/DepartmentSearch.css';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';


export default function CourseSearchComponent({onCourseCodeChange}) {

  // this should be replaced with a call to the backend to get the list of courses
  // for now, we will just use a hardcoded list
  // https://github.com/iOlivers/BrockTimeTable/issues/2
  let courses = [
    {label: 'COSC 1P02 D2'},
    {label: 'COSC 1P02 D3'},
    {label: 'COSC 1P03 D2'},
    {label: 'COSC 1P03 D3'},
    {label: 'COSC 2P03 D2'},
    {label: 'COSC 2P03 D3'},
    {label: 'COSC 2P05 D2'},
    {label: 'COSC 2P05 D3'},
    {label: 'COSC 2P12 D2'},
    {label: 'COSC 2P12 D3'},
    {label: 'COSC 2P13 D2'},
    {label: 'COSC 2P13 D3'},
    {label: 'etc...'},
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