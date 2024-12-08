import React, { useState } from "react";
import { NavbarComponent } from "./GuidePage/components";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";
import ReactGA from "react-ga4";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

function GuidePage() {
  ReactGA.send({
    hitType: "pageview",
    page: "Guide",
    title: "Brock Visual Guide",
  });
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

return (
    <Box sx={{ minWidth: 350, display: "flex", justifyContent: "center" }}>
        <CssBaseline />
        <Box sx={{ maxWidth: 1280, width: "100%" }}>
            <NavbarComponent />
            <Grid container spacing={0} justifyContent="center">
                <Grid item xs={12}>
                    <Box m={2} mb={0}>
                        <Typography variant="h5" gutterBottom>
                            <strong>Guide to Course Registration</strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Welcome to the Brock Visual TimeTable! This guide will help you
                            learn everything you need to know about course planning &
                            registration at Brock University. This guide is written by
                            students, for students. We understand the struggles of course
                            registration and have created this platform to help you make the
                            process easier.
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            <strong>Step 1: Find Your Courses</strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            The first step to course registration is finding the courses you
                            want to take. Go to the{" "}
                            <Link href="https://brocku.ca/webcal/" target="_blank" rel="noopener">
                                Brock University Course Calendar
                            </Link>
                            {" "}and select your year, then program from the Table of Contents.
                            Scroll down to find your specific program and the courses you need
                            to take.
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    </Box>
);
}

export default GuidePage;
