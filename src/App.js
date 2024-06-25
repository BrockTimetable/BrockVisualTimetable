import React, { useState } from 'react';
import { NavbarComponent, InputFormComponent, CalendarComponent } from './components';
import './css/App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  const [timetables, setTimetables] = useState([]);

  //const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersDarkMode = false;

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light'
        },
      }),
    [prefersDarkMode],
  );

  return (
    <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavbarComponent />
      <InputFormComponent setTimetables={setTimetables} />
      <CalendarComponent timetables={timetables} />
    </ThemeProvider>
      
    </>
  );
}

export default App;