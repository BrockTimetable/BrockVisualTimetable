import React, { useState, useEffect } from "react";
import {
  NavbarComponent,
  CalendarComponent,
  InputFormBottomComponent,
  InputFormTopComponent,
} from "@/components/generator";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useIsBelowMedium } from "@/lib/utils/screenSizeUtils";
import { CourseDetailsProvider } from "@/lib/contexts/generator/CourseDetailsContext";
import {
  CourseColorsProvider,
  CourseColorsContext,
} from "@/lib/contexts/generator/CourseColorsContext";
import IntroGuideWidget from "@/components/generator/Dialogs/IntroGuideWidget";
import ReactGA from "react-ga4";
import {
  generateTimetables,
  getValidTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";
import {
  removeCourseData,
  clearAllCourseData,
} from "@/lib/generator/courseData";
import {
  clearCoursePins,
  clearAllPins,
} from "@/lib/generator/pinnedComponents";
import FooterComponent from "@/components/sitewide/FooterComponent";

function GeneratorPage() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    ReactGA.send({
      hitType: "pageview",
      page: "Generator",
      title: "Brock Visual TimeTable",
    });
  }, []);
  const [timetables, setTimetables] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [durations, setDurations] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [addedCourses, setAddedCourses] = useState([]);
  const isBelowMedium = useIsBelowMedium();

  // Clear all state when component unmounts
  useEffect(() => {
    return () => {
      clearAllCourseData();
      clearAllPins();
      setAddedCourses([]);
      setTimetables([]);
      setSelectedDuration("");
      setDurations([]);
      setSortOption("");
    };
  }, []);

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
      <CourseColorsProvider>
        <CourseColorsSetup
          generateTimetables={generateTimetables}
          getValidTimetables={getValidTimetables}
          setTimetables={setTimetables}
          sortOption={sortOption}
        />
        <Box
          sx={{
            minWidth: 350,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CssBaseline />
          <Box sx={{ maxWidth: 1280, width: "100%" }}>
            <NavbarComponent />
            <Grid container spacing={0} justifyContent="center">
              <Grid item xs={12} md={4}>
                <Box ml={2} mr={{ xs: 2, md: 1 }} mt={2} mb={0}>
                  <InputFormTopComponent
                    setTimetables={setTimetables}
                    setSelectedDuration={setSelectedDuration}
                    setDurations={setDurations}
                    setSortOption={setSortOption}
                    addedCourses={addedCourses}
                    setAddedCourses={setAddedCourses}
                  />
                  {!isBelowMedium && (
                    <Box mt={2}>
                      <InputFormBottomComponent
                        addedCourses={addedCourses}
                        setAddedCourses={setAddedCourses}
                        setTimetables={setTimetables}
                        timetables={timetables}
                        durations={durations}
                        sortOption={sortOption}
                        generateTimetables={generateTimetables}
                        getValidTimetables={getValidTimetables}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box ml={{ xs: 2, md: 1 }} mr={2} mt={{ xs: 0, sm: 2 }} mb={0}>
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
              {isBelowMedium && (
                <Grid item xs={12}>
                  <Box m={2} mt={{ xs: 0, sm: 2 }}>
                    <InputFormBottomComponent
                      addedCourses={addedCourses}
                      setAddedCourses={setAddedCourses}
                      setTimetables={setTimetables}
                      timetables={timetables}
                      durations={durations}
                      sortOption={sortOption}
                      generateTimetables={generateTimetables}
                      getValidTimetables={getValidTimetables}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
            <IntroGuideWidget />
            <FooterComponent />
          </Box>
        </Box>
      </CourseColorsProvider>
    </CourseDetailsProvider>
  );
}

// Helper component to set up the CourseColorsContext with timetable handlers
function CourseColorsSetup({
  generateTimetables,
  getValidTimetables,
  setTimetables,
  sortOption,
}) {
  const { setTimetableUpdateHandlers } = React.useContext(CourseColorsContext);

  React.useEffect(() => {
    setTimetableUpdateHandlers({
      generateTimetables,
      getValidTimetables,
      setTimetables,
      sortOption,
    });
  }, [generateTimetables, getValidTimetables, setTimetables, sortOption]);

  return null;
}

export default GeneratorPage;
