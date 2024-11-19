import React, { useState } from "react";
import { NavbarComponent, CalendarComponent, InputFormBottomComponent, InputFormTopComponent } from "./GeneratorPage/components";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";
import { CourseDetailsProvider } from "./GeneratorPage/contexts/CourseDetailsContext";
import ChangelogDialogComponent from "./GeneratorPage/components/ChangelogDialogComponent";
import ReactGA from "react-ga4";
import { generateTimetables, getValidTimetables } from "./GeneratorPage/scripts/generateTimetables";

function GeneratorPage() {
    ReactGA.send({ hitType: "pageview", page: "Generator", title: "Brock Visual TimeTable" });
    const [timetables, setTimetables] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [durations, setDurations] = useState([]);
    const [isChangelogOpen, setIsChangelogOpen] = useState(true);
    const [sortOption, setSortOption] = useState("");
    const [addedCourses, setAddedCourses] = useState([]);
    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'));

    const handleOpenChangelog = () => {
        setIsChangelogOpen(true);
    };

    const handleCloseChangelog = () => {
        setIsChangelogOpen(false);
    };

    const removeCourse = (course) => {
        const cleanCourseCode = course.split(" ").slice(0, 2).join("");
        setAddedCourses(addedCourses.filter((c) => c !== course));
        removeCourseData(cleanCourseCode);
        clearCoursePins(cleanCourseCode);
        generateTimetables(sortOption);
        setTimetables(getValidTimetables());
    };

    return (
        <CourseDetailsProvider>
            <Box sx={{ minWidth: 350, display: 'flex', justifyContent: 'center' }}>
                <CssBaseline />
                <Box sx={{ maxWidth: 1280, width: '100%' }}>
                    <NavbarComponent />
                    <Grid container spacing={0} justifyContent="center">
                        <Grid item xs={12} md={4} lg={3}>
                            <Box m={2} mb={0}>
                                <InputFormTopComponent
                                    setTimetables={setTimetables}
                                    setSelectedDuration={setSelectedDuration}
                                    setDurations={setDurations}
                                    setSortOption={setSortOption}
                                    addedCourses={addedCourses}
                                    setAddedCourses={setAddedCourses}
                                />
                                {!isSmallScreen && (
                                    <Box mt={2}>
                                        <InputFormBottomComponent
                                            addedCourses={addedCourses}
                                            setAddedCourses={setAddedCourses}
                                            setTimetables={setTimetables}
                                            sortOption={sortOption}
                                            generateTimetables={generateTimetables}
                                            getValidTimetables={getValidTimetables}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Box m={2} mb={0}>
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
                        {isSmallScreen && (
                            <Grid item xs={12}>
                                <Box m={2} mt={0}>
                                    <InputFormBottomComponent
                                        addedCourses={addedCourses}
                                        setAddedCourses={setAddedCourses}
                                        setTimetables={setTimetables}
                                        sortOption={sortOption}
                                        generateTimetables={generateTimetables}
                                        getValidTimetables={getValidTimetables}
                                    />
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                    <ChangelogDialogComponent open={isChangelogOpen} handleClose={handleCloseChangelog} />
                </Box>
            </Box>
        </CourseDetailsProvider>
    );
}

export default GeneratorPage;
