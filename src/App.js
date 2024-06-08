import React, { useState } from 'react';
import { NavbarComponent, InputFormComponent, CalendarComponent } from './components';
import './css/App.css';

function App() {
  const [timetables, setTimetables] = useState([]);

  return (
    <>
      <NavbarComponent />
      <InputFormComponent setTimetables={setTimetables} />
      <CalendarComponent timetables={timetables} />
    </>
  );
}

export default App;