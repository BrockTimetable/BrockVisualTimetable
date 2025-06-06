import React from "react";
import { Box, Button, FormControl, InputLabel, Select, MenuItem, IconButton, useTheme } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateFirstIcon from "@mui/icons-material/FirstPage";
import NavigateLastIcon from "@mui/icons-material/LastPage";
import InfoIcon from "@mui/icons-material/Info";
import CancelIcon from "@mui/icons-material/Cancel";

// Helper function to format duration display text from Unix timestamps
const formatDurationText = (duration) => {
    const [startUnix, endUnix, dur] = duration.split("-");
    const startDate = new Date(parseInt(startUnix, 10) * 1000);
    const endDate = new Date(parseInt(endUnix, 10) * 1000);
    
    const startMonth = startDate.toLocaleString("default", { month: "short" });
    const endMonth = endDate.toLocaleString("default", { month: "short" });
    
    return `${startMonth} - ${endMonth} (D${dur})`;
};

export default function CalendarNavBar({
    isTruncated,
    noTimetablesGenerated,
    timeslotsOverridden,
    handleFirst,
    handlePrevious,
    handleNext,
    handleLast,
    currentTimetableIndex,
    timetables,
    selectedDuration,
    setSelectedDuration,
    durations,
    noCourses,
    sortByBracketContent,
    setTruncationDialogOpen,
    setNoTimetablesDialogOpen,
    setTimeslotsOverriddenDialogOpen,
}) {
    const theme = useTheme();

    return (
        <Box id="calendarNavBar" sx={{ backgroundColor: theme.palette.divider, display: 'flex', alignItems: 'center', borderRadius: '16px', padding: '8px', marginBottom: '16px', height: 'auto', transition: "background-color 0.5s ease", }}>
            <Box id="infoButtonBox" sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                {isTruncated && (
                    <IconButton color="warning" onClick={() => setTruncationDialogOpen(true)}>
                        <InfoIcon />
                    </IconButton>
                )}
                {noTimetablesGenerated && (
                    <IconButton color="error" onClick={() => setNoTimetablesDialogOpen(true)}>
                        <CancelIcon />
                    </IconButton>
                )}
                {timeslotsOverridden && (
                    <IconButton color="info" onClick={() => setTimeslotsOverriddenDialogOpen(true)}>
                        <InfoIcon />
                    </IconButton>
                )}
            </Box>
            <Box id="calendarNavButtons" sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap' }}>
                <Box sx={{ marginRight: 1 }}>
                    <Button variant="contained" onClick={handleFirst} disabled={timetables.length <= 1}>
                        <NavigateFirstIcon />
                    </Button>
                </Box>
                <Box sx={{ marginRight: 2 }}>
                    <Button variant="contained" onClick={handlePrevious} disabled={timetables.length <= 1}>
                        <NavigateBeforeIcon />
                    </Button>
                </Box>
                <Box id="calendarTimetableNumber" sx={{ flex: '0 1 auto', textAlign: 'center', minWidth: '80px' }}>
                    {currentTimetableIndex + 1} of {timetables.length}
                </Box>
                <Box sx={{ marginLeft: 2 }}>
                    <Button variant="contained" onClick={handleNext} disabled={timetables.length <= 1}>
                        <NavigateNextIcon />
                    </Button>
                </Box>
                <Box sx={{ marginLeft: 1 }}>
                    <Button variant="contained" onClick={handleLast} disabled={timetables.length <= 1}>
                        <NavigateLastIcon />
                    </Button>
                </Box>
            </Box>
            <Box id="durationFormBox" sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingTop: '4px', paddingBottom: '4px', marginRight: '4px' }}>
                <FormControl sx={{ width: 160 }} size="small">
                    <InputLabel id="duration-select-label">Duration</InputLabel>
                    <Select
                        labelId="duration-select-label"
                        id="duration-select"
                        label="Duration"
                        value={selectedDuration}
                        onChange={(e) => setSelectedDuration(e.target.value)}
                    >
                        {sortByBracketContent(durations).map((duration, index) => (
                            <MenuItem key={index} value={duration}>
                                {formatDurationText(duration)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
}