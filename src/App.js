import React, { useState } from "react";
import { NavbarComponent, InputFormComponent, CalendarComponent } from "./components";
import "./css/App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

function App() {
    const [timetables, setTimetables] = useState([]);

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    //const prefersDarkMode = false;

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? "dark" : "light",
                },
            }),
        [prefersDarkMode]
    );

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <NavbarComponent />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={3}>
                        <InputFormComponent setTimetables={setTimetables} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                        <Box sx={{ minWidth: 120 }} m={2}>
                            <CalendarComponent timetables={timetables} />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={12} lg={3}>
                        <Box sx={{ minWidth: 120 }} m={2}>
                            Placeholder for other settings?
                        </Box>
                    </Grid>
                </Grid>
            </ThemeProvider>
        </>
    );
}

export default App;
