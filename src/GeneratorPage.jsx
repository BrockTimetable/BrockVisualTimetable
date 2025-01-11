import React, { useState, useEffect } from "react";
import { CourseDetailsProvider } from "./GeneratorPage/contexts/CourseDetailsContext";
import { CourseColorsProvider, CourseColorsContext } from "./GeneratorPage/contexts/CourseColorsContext";
import { NavbarComponent, CalendarComponent, InputFormTopComponent, InputFormBottomComponent } from "./GeneratorPage/components";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { generateTimetables, getValidTimetables } from "./GeneratorPage/scripts/generateTimetables";

export default function GeneratorPage() {
    const [timetables, setTimetables] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [durations, setDurations] = useState([]);
    const [sortOption, setSortOption] = useState("default");
    const [addedCourses, setAddedCourses] = useState([]);

    return (
        <CourseDetailsProvider>
            <CourseColorsProvider>
                <CourseColorsSetup 
                    generateTimetables={generateTimetables}
                    getValidTimetables={getValidTimetables}
                    setTimetables={setTimetables}
                    sortOption={sortOption}
                />
                <Box>
                    <NavbarComponent />
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <InputFormTopComponent
                                    setTimetables={setTimetables}
                                    setSelectedDuration={setSelectedDuration}
                                    setDurations={setDurations}
                                    setSortOption={setSortOption}
                                    addedCourses={addedCourses}
                                    setAddedCourses={setAddedCourses}
                                />
                                <Box sx={{ height: "16px" }} />
                                <InputFormBottomComponent
                                    addedCourses={addedCourses}
                                    setAddedCourses={setAddedCourses}
                                    setTimetables={setTimetables}
                                    sortOption={sortOption}
                                    generateTimetables={generateTimetables}
                                    getValidTimetables={getValidTimetables}
                                />
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <CalendarComponent
                                    timetables={timetables}
                                    setTimetables={setTimetables}
                                    selectedDuration={selectedDuration}
                                    setSelectedDuration={setSelectedDuration}
                                    durations={durations}
                                    sortOption={sortOption}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </CourseColorsProvider>
        </CourseDetailsProvider>
    );
}

// Helper component to set up the CourseColorsContext with timetable handlers
function CourseColorsSetup({ generateTimetables, getValidTimetables, setTimetables, sortOption }) {
    const { setTimetableUpdateHandlers } = React.useContext(CourseColorsContext);

    useEffect(() => {
        setTimetableUpdateHandlers({
            generateTimetables,
            getValidTimetables,
            setTimetables,
            sortOption
        });
    }, [generateTimetables, getValidTimetables, setTimetables, sortOption]);

    return null;
}
