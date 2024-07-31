import React, { useState } from "react";
import { NavbarComponent, InputFormComponent, CalendarComponent } from "./GeneratorPage/components";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { CourseDetailsProvider } from "./GeneratorPage/contexts/CourseDetailsContext";

function GeneratorPage() {
    const [timetables, setTimetables] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [durations, setDurations] = useState([]);

    return (
        <CourseDetailsProvider>
            <CssBaseline />
            <NavbarComponent />
            <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={3}>
                    <InputFormComponent
                        setTimetables={setTimetables}
                        setSelectedDuration={setSelectedDuration}
                        setDurations={setDurations}
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                    <Box sx={{ minWidth: 120 }} m={2}>
                        <CalendarComponent
                            timetables={timetables}
                            setTimetables={setTimetables}
                            selectedDuration={selectedDuration}
                            setSelectedDuration={setSelectedDuration}
                            durations={durations}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={12} lg={3}>
                    <Box sx={{ minWidth: 120 }} m={2}>
                        Placeholder for other settings?
                    </Box>
                </Grid>
            </Grid>
        </CourseDetailsProvider>
    );
}

export default GeneratorPage;