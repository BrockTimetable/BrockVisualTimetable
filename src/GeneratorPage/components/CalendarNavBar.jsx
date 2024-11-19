
import React from "react";
import { Box, Button, FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateFirstIcon from "@mui/icons-material/FirstPage";
import NavigateLastIcon from "@mui/icons-material/LastPage";
import InfoIcon from "@mui/icons-material/Info";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTheme } from "@mui/material/styles";

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
        <Box id="calendarNavBar" style={{ backgroundColor: theme.palette.divider }}>
            <Box id="infoButtonBox" marginLeft={1}>
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
            <Box id="calendarNavButtons">
                <Box marginRight={1}>
                    <Button variant="contained" onClick={handleFirst} disabled={timetables.length <= 1}>
                        <NavigateFirstIcon />
                    </Button>
                </Box>
                <Box marginRight={2}>
                    <Button variant="contained" onClick={handlePrevious} disabled={timetables.length <= 1}>
                        <NavigateBeforeIcon />
                    </Button>
                </Box>
                <Box id="calendarTimetableNumber">
                    {currentTimetableIndex + 1} of {timetables.length}
                </Box>
                <Box marginLeft={2}>
                    <Button variant="contained" onClick={handleNext} disabled={timetables.length <= 1}>
                        <NavigateNextIcon />
                    </Button>
                </Box>
                <Box marginLeft={1}>
                    <Button variant="contained" onClick={handleLast} disabled={timetables.length <= 1}>
                        <NavigateLastIcon />
                    </Button>
                </Box>
            </Box>
            <Box id="durationFormBox" marginRight={2}>
                {!noCourses && (
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
                                    {(() => {
                                        const [startUnix, endUnix, dur] = duration.split("-");
                                        const startMonth = new Date(parseInt(startUnix, 10) * 1000).toLocaleString(
                                            "default",
                                            { month: "short" }
                                        );
                                        const endMonth = new Date(parseInt(endUnix, 10) * 1000).toLocaleString(
                                            "default",
                                            { month: "short" }
                                        );
                                        return `${startMonth} - ${endMonth} (D${dur})`;
                                    })()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>
        </Box>
    );
}