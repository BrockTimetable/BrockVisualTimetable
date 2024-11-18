import React, { useState } from "react";
import { NavbarComponent, InputFormComponent, CalendarComponent } from "./GeneratorPage/components";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { CourseDetailsProvider } from "./GeneratorPage/contexts/CourseDetailsContext";
import ChangelogDialogComponent from "./GeneratorPage/components/ChangelogDialogComponent";
import ReactGA from 'react-ga4';

function GeneratorPage() {
    ReactGA.send({ hitType: 'pageview', page: "Generator", title: "Brock Visual TimeTable" });
    const [timetables, setTimetables] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [durations, setDurations] = useState([]);
    const [isChangelogOpen, setIsChangelogOpen] = useState(true);
    const [sortOption, setSortOption] = useState('NOVALUE');

    const handleOpenChangelog = () => {
        setIsChangelogOpen(true);
    };

    const handleCloseChangelog = () => {
        setIsChangelogOpen(false);
    };

    return (
        <CourseDetailsProvider>
            <Box sx={{ minWidth: 350 }}>
                <CssBaseline />
                <NavbarComponent />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={3}>
                        <InputFormComponent
                            setTimetables={setTimetables}
                            setSelectedDuration={setSelectedDuration}
                            setDurations={setDurations}
                            setSortOption={setSortOption}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={8}>
                        <Box sx={{ minWidth: 350}} m={2}>
                            <CalendarComponent
                                timetables={timetables}
                                setTimetables={setTimetables}
                                selectedDuration={selectedDuration}
                                setSelectedDuration={setSelectedDuration}
                                durations={durations}
                                sortOption={sortOption}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <ChangelogDialogComponent open={isChangelogOpen} handleClose={handleCloseChangelog} />
            </Box>
        </CourseDetailsProvider>
    );
}

export default GeneratorPage;
