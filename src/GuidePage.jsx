import React, { useState } from "react";
import { NavbarComponent } from "./GuidePage/components";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";
import ReactGA from "react-ga4";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import { ListItemButton } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";

function GuidePage() {
    ReactGA.send({
        hitType: "pageview",
        page: "Guide",
        title: "Brock Visual Guide",
    });
    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
    const theme = useTheme();
    const [openCourseCode, setOpenCourseCode] = useState(false);
    const [openAndOr, setOpenAndOr] = useState(false);
    const [openTermSpecific, setOpenTermSpecific] = useState(false);
    const [openContextCredits, setOpenContextCredits] = useState(false);
    const [openElectiveCredits, setOpenElectiveCredits] = useState(false);

    const handleCourseCodeClick = () => {
        setOpenCourseCode(!openCourseCode);
    };

    const handleAndOrClick = () => {
        setOpenAndOr(!openAndOr);
    };

    const handleTermSpecificClick = () => {
        setOpenTermSpecific(!openTermSpecific);
    };

    const handleContextCreditsClick = () => {
        setOpenContextCredits(!openContextCredits);
    };

    const handleElectiveCreditsClick = () => {
        setOpenElectiveCredits(!openElectiveCredits);
    };

    const handleCourseCodeChange = (event) => {
        setCourseCode(event.target.value);
    };

    return (
        <Box sx={{ minWidth: 350, display: "flex", justifyContent: "center" }}>
            <CssBaseline />
            <Box sx={{ maxWidth: 1280, width: "100%" }}>
                <NavbarComponent />
                <Box sx={{ maxWidth: 960, width: "100%", mx: "auto" }}>
                    <Grid container spacing={0} justifyContent="center">
                        <Grid item xs={12}>
                            <Box m={2} mb={8}>
                                <Typography variant="h5" gutterBottom>
                                    <strong>Guide to Course Registration</strong>
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Welcome to the Brock Visual TimeTable! This guide will help you learn everything you
                                    need to know about course planning & registration at Brock University. This guide is
                                    written by students, for students. We understand the struggles of course
                                    registration and have created this platform to help you make the process easier.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    In this guide, you will learn how to find your courses, plan your schedule, and
                                    register for courses. This guide is designed to be simple and easy to follow. This
                                    guide is for all students at Brock University, including first-year students,
                                    upper-year students, and transfer students.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    This guide will be running through creating a first-year computer science co-op
                                    student's timetable. The process is the same for all students, but the courses you
                                    need to take will be different.
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    The Brock Visual TimeTable is not affiliated with Brock University. We are students
                                    who have created this tool to help other students. We are not responsible for any
                                    errors or issues that may arise from using this tool. Please ensure you double-check
                                    your timetable before registering for courses.
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Requirements:</strong>
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Make sure you've{" "}
                                    <Link
                                        href="https://discover.brocku.ca/next-steps/#activate-your-portal"
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        activated
                                    </Link>{" "}
                                    your Brock email account at least 24 hours in advance and have your email and
                                    password ready. You will need to log in to your student portal to register for
                                    courses.
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Step 1: Find Your Courses</strong>
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    The first step to course registration is finding the courses you want to take. Go to
                                    the{" "}
                                    <Link href="https://brocku.ca/webcal/" target="_blank" rel="noopener">
                                        Brock University Course Calendar
                                    </Link>{" "}
                                    and select your year, then program from the Table of Contents. Scroll down to find
                                    your specific program and the courses you need to take. You should see something
                                    similar to the image below.
                                </Typography>
                                <Box m={2} mb={0}>
                                    <img
                                        src={`/guide/course-calendar.png`}
                                        alt="Course Calendar"
                                        style={{ maxWidth: "100%", height: "auto" }}
                                    />
                                </Box>
                                <Typography variant="body1" gutterBottom>
                                    This is a list of all the courses you will need to take for a given term. Above, you
                                    can see the courses required for the first term of a first-year computer science
                                    co-op student. Let's break down everything you see here:
                                </Typography>
                                <Box>
                                    <Box
                                        sx={{
                                            mb: 1,
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 1,
                                            overflow: "hidden",
                                            transition: "border-color 0.5s ease",
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={handleCourseCodeClick}
                                            sx={{
                                                backgroundColor: theme.palette.background.paper,
                                                transition: "background-color 0.5s ease",
                                            }}
                                        >
                                            <ListItemText primary="Course Code" />
                                            {openCourseCode ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                        <Collapse in={openCourseCode} timeout="auto" unmountOnExit>
                                            <Box m={2}>
                                                <Typography variant="body1" gutterBottom>
                                                    The course code is a unique identifier for each course. Lets use{" "}
                                                    <strong>COSC 1P02</strong> as an example. It is made up of 4
                                                    distinct parts:
                                                </Typography>
                                                <List sx={{ listStyle: "decimal", pl: 4 }}>
                                                    <ListItem sx={{ display: "list-item", py: 0 }}>
                                                        <ListItemText primary="COSC is the department acronym, meaning Computer Science." />
                                                    </ListItem>
                                                    <ListItem sx={{ display: "list-item", py: 0 }}>
                                                        <ListItemText primary="1 shows the year level (1 = first year)." />
                                                    </ListItem>
                                                    <ListItem sx={{ display: "list-item", py: 0 }}>
                                                        <ListItemText primary="P tells the credit value (P = 0.5 credit, F = 1.0 credit)." />
                                                    </ListItem>
                                                    <ListItem sx={{ display: "list-item", py: 0 }}>
                                                        <ListItemText primary="02 is the unique course number in the department." />
                                                    </ListItem>
                                                </List>
                                            </Box>
                                        </Collapse>
                                        <ListItemButton
                                            onClick={handleAndOrClick}
                                            sx={{
                                                backgroundColor: theme.palette.background.paper,
                                                transition: "background-color 0.5s ease",
                                            }}
                                        >
                                            <ListItemText primary="AND vs OR" />
                                            {openAndOr ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                        <Collapse in={openAndOr} timeout="auto" unmountOnExit>
                                            <Box m={2}>
                                                <Typography variant="body1" gutterBottom>
                                                    Notice how some courses have <strong>AND</strong> and others have
                                                    <strong> OR</strong> between them. Looking at the image above, you
                                                    can see that
                                                    <strong> COSC 1P02 AND COSC 1P03</strong> are required. This means
                                                    you must take both courses. In the case of these courses, COSC 1P02
                                                    is a prerequisite for COSC 1P03. Assuming you are a first-year
                                                    student, you will need to take COSC 1P02 in your first term and COSC
                                                    1P03 in your second term.
                                                </Typography>
                                                <Typography variant="body1" gutterBottom>
                                                    On the other hand, <strong> COSC 1P50 OR COSC 1P71</strong> are
                                                    required. This means you only need to take one of the two courses.
                                                    You can choose to take COSC 1P50 or COSC 1P71 in your first term.
                                                    Both courses are not required.
                                                </Typography>
                                            </Box>
                                        </Collapse>
                                        <ListItemButton
                                            onClick={handleTermSpecificClick}
                                            sx={{
                                                backgroundColor: theme.palette.background.paper,
                                                transition: "background-color 0.5s ease",
                                            }}
                                        >
                                            <ListItemText primary="Term-specific Courses" />
                                            {openTermSpecific ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                        <Collapse in={openTermSpecific} timeout="auto" unmountOnExit>
                                            <Box m={2}>
                                                <Typography variant="body1" gutterBottom>
                                                    In the example above, you can see that SCIE 0N90 is a term-specific
                                                    course. This means that you can only take this course in the Winter
                                                    term. You will need to plan your schedule accordingly to ensure you
                                                    can take this course.
                                                </Typography>
                                                <Typography variant="body1" gutterBottom>
                                                    In the case of SCIE 0N90, this doesn't have much impact on your
                                                    schedule, as this is a 0 credit course, that you normally take on
                                                    top of your regular course load.
                                                </Typography>
                                            </Box>
                                        </Collapse>
                                        <ListItemButton
                                            onClick={handleContextCreditsClick}
                                            sx={{
                                                backgroundColor: theme.palette.background.paper,
                                                transition: "background-color 0.5s ease",
                                            }}
                                        >
                                            <ListItemText primary="Context Credits" />
                                            {openContextCredits ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                        <Collapse in={openContextCredits} timeout="auto" unmountOnExit>
                                            <Box m={2}>
                                                <Typography variant="body1" gutterBottom>
                                                    Context credits are courses that are required to give you a broader
                                                    understanding of different fields. At Brock, you need to complete
                                                    1.0 context credit in Humanities, Social Sciences, and Sciences. You
                                                    can find the list of courses that fulfill these requirements{" "}
                                                    <Link
                                                        href="https://brocku.ca/webcal/2024/undergrad/areg.html#sec29"
                                                        target="_blank"
                                                        rel="noopener"
                                                    >
                                                        here
                                                    </Link>
                                                    .
                                                </Typography>
                                            </Box>
                                        </Collapse>
                                        <ListItemButton
                                            onClick={handleElectiveCreditsClick}
                                            sx={{
                                                backgroundColor: theme.palette.background.paper,
                                                transition: "background-color 0.5s ease",
                                            }}
                                        >
                                            <ListItemText primary="Elective Credits" />
                                            {openElectiveCredits ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                        <Collapse in={openElectiveCredits} timeout="auto" unmountOnExit>
                                            <Box m={2}>
                                                <Typography variant="body1" gutterBottom>
                                                    Elective credits are courses that you can choose freely from any
                                                    department. These allow you to explore other areas of interest and
                                                    can be used to fulfill additional requirements or personal
                                                    interests.
                                                </Typography>
                                            </Box>
                                        </Collapse>
                                    </Box>
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Step 2: Create your Timetable</strong>
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Once you have found the courses you need to take, you can start planning your
                                    timetable. You can use the{" "}
                                    <Link href="/" target="_blank" rel="noopener">
                                        Brock Visual TimeTable
                                    </Link>{" "}
                                    to create your timetable. Simply input your courses, and the generator will create
                                    all possible timetables for you. You can then choose the timetable that works best
                                    for you.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    When adding courses to the generator, ensure that you are adding the course for the
                                    correct term. You can do this by adding D(number), where number is the term number.
                                    For fall and winter terms:
                                </Typography>
                                <List sx={{ listStyle: "decimal", pl: 4 }}>
                                    <ListItem sx={{ display: "", py: 0 }}>
                                        <ListItemText primary="is for 8 month courses, spanning from September to April." />
                                    </ListItem>
                                    <ListItem sx={{ display: "list-item", py: 0 }}>
                                        <ListItemText primary="is for fall courses, spanning from September to December." />
                                    </ListItem>
                                    <ListItem sx={{ display: "list-item", py: 0 }}>
                                        <ListItemText primary="is for winter courses, spanning from January to April." />
                                    </ListItem>
                                </List>
                                <Typography variant="body1" gutterBottom>
                                    The durations used for spring & summer courses are different. You can find the
                                    duration for each course in the{" "}
                                    <Link href="https://brocku.ca/guides-and-timetables/timetables/" target="_blank" rel="noopener">
                                        timetable
                                    </Link>.
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Note:</strong> This tool is not affiliated with Brock University. We are
                                    students who have created this tool to help other students. We are not responsible
                                    for any errors or issues that may arise from using this tool. Please ensure you
                                    double-check your timetable before registering for courses.
                                </Typography>
                                <Box m={2} mb={0}>
                                    <img
                                        src={`/guide/example-timetable.png`}
                                        alt="Course Calendar"
                                        style={{ maxWidth: "100%", height: "auto" }}
                                    />
                                </Box>
                                <Typography variant="body1" gutterBottom>
                                    This is an example of a timetable generated using the Brock Visual TimeTable. You can
                                    see I've decided to take COSC 1P02, COSC 1P50, MATH 1P66, and ECON 1P92 in my first term,
                                    and FILM 1F94 as an 8 month course. FILM 1F94 fills the context credit for Humanities, and 
                                    ECON 1P92 fills half of the context credit for Social Sciences.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    You can also see that I've blocked out every day from 8:00 AM to 9:00 AM.  This prevents
                                    the generator from scheduling any courses during this time. This is useful if you have
                                    other commitments during this time (e.g. work, volunteering, or sleeping in!).
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Step 3: Register for Courses</strong>
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Once you have created your timetable, you can start registering for courses. Log in to
                                    your{" "}
                                    <Link href="https://my.brocku.ca/" target="_blank" rel="noopener">
                                        student portal
                                    </Link>{" "}
                                    and navigate to the course registration page (left side, about half way down the screen).
                                </Typography>
                                <Box m={2} mb={0}>
                                    <img
                                        src={`/guide/student-dashboard.png`}
                                        alt="Course Calendar"
                                        style={{ maxWidth: "100%", height: "auto" }}
                                    />
                                </Box>
                                <Typography variant="body1" gutterBottom>
                                    You can then select the term you want to register for and input the course codes for the
                                    courses you want to take. Make sure you add the correct components (e.g. lecture,
                                    tutorial, lab) for each course. 
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Once you add a course, it will show up in the "List Of Registered Courses for Current Registration Period"
                                    list at the bottom of the page. The course will be automatically saved, so once it's added, you're good to go!
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}

export default GuidePage;
