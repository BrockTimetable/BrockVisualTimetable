import React, { useState } from "react";
import { NavbarComponent, InputFormComponent, CalendarComponent } from "./GeneratorPage/components";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { CourseDetailsProvider } from "./GeneratorPage/contexts/CourseDetailsContext";
import ChangelogDialogComponent from "./GeneratorPage/components/ChangelogDialogComponent";
import ReactGA from "react-ga4";

function GeneratorPage() {
    ReactGA.send({ hitType: "pageview", page: "Generator", title: "Brock Visual TimeTable" });
    const [timetables, setTimetables] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [durations, setDurations] = useState([]);
    const [isChangelogOpen, setIsChangelogOpen] = useState(true);
    const [sortOption, setSortOption] = useState("");

    const handleOpenChangelog = () => {
        setIsChangelogOpen(true);
    };

    const handleCloseChangelog = () => {
        setIsChangelogOpen(false);
    };

    return (
        <CourseDetailsProvider>
            <Box sx={{ minWidth: 350, display: 'flex', justifyContent: 'center' }}>
                <CssBaseline />
                <Box sx={{ maxWidth: 1280, width: '100%' }}>
                    <NavbarComponent />
                    <Grid container spacing={0} justifyContent="center">
                        <Grid item xs={12} md={4} lg={3}>
                            <Box m={2}>
                                <InputFormComponent
                                    setTimetables={setTimetables}
                                    setSelectedDuration={setSelectedDuration}
                                    setDurations={setDurations}
                                    setSortOption={setSortOption}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Box m={2}>
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
            </Box>
        </CourseDetailsProvider>
    );
}

export default GeneratorPage;
