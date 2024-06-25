import React, { useState } from 'react';
import { NavbarComponent, InputFormComponent, CalendarComponent } from './components';
import './css/App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  const [timetables, setTimetables] = useState([]);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <NavbarComponent />
      <InputFormComponent setTimetables={setTimetables} />
      <CalendarComponent timetables={timetables} />
    </ThemeProvider>
      
    </>
  );
}

export default App;