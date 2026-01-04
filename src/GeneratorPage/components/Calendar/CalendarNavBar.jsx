import React from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateFirstIcon from "@mui/icons-material/FirstPage";
import NavigateLastIcon from "@mui/icons-material/LastPage";
import InfoIcon from "@mui/icons-material/Info";
import CancelIcon from "@mui/icons-material/Cancel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Box
      id="calendarNavBar"
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
        borderRadius: "8px",
        padding: "8px",
        marginBottom: "16px",
        height: "auto",
        transition: "background-color 0.5s ease",
      }}
    >
      <Box
        id="infoButtonBox"
        sx={{
          flex: { xs: "none", sm: 1 },
          display: "flex",
          justifyContent: { xs: "center", sm: "flex-start" },
          order: { xs: 1, sm: 1 },
        }}
      >
        {isTruncated && (
          <IconButton
            color="warning"
            onClick={() => setTruncationDialogOpen(true)}
          >
            <InfoIcon />
          </IconButton>
        )}
        {noTimetablesGenerated && (
          <IconButton
            color="error"
            onClick={() => setNoTimetablesDialogOpen(true)}
          >
            <CancelIcon />
          </IconButton>
        )}
        {timeslotsOverridden && (
          <IconButton
            color="info"
            onClick={() => setTimeslotsOverriddenDialogOpen(true)}
          >
            <InfoIcon />
          </IconButton>
        )}
      </Box>
      <Box
        id="calendarNavButtons"
        sx={{
          flex: { xs: "none", sm: 1 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          whiteSpace: "nowrap",
          order: { xs: 2, sm: 2 },
        }}
      >
        <Box sx={{ marginRight: 1 }}>
          <Button
            onClick={handleFirst}
            disabled={timetables.length <= 1}
            size="icon"
          >
            <NavigateFirstIcon />
          </Button>
        </Box>
        <Box sx={{ marginRight: 2 }}>
          <Button
            onClick={handlePrevious}
            disabled={timetables.length <= 1}
            size="icon"
          >
            <NavigateBeforeIcon />
          </Button>
        </Box>
        <Box
          id="calendarTimetableNumber"
          sx={{ flex: "0 1 auto", textAlign: "center", minWidth: "80px" }}
        >
          {currentTimetableIndex + 1} of {timetables.length}
        </Box>
        <Box sx={{ marginLeft: 2 }}>
          <Button
            onClick={handleNext}
            disabled={timetables.length <= 1}
            size="icon"
          >
            <NavigateNextIcon />
          </Button>
        </Box>
        <Box sx={{ marginLeft: 1 }}>
          <Button
            onClick={handleLast}
            disabled={timetables.length <= 1}
            size="icon"
          >
            <NavigateLastIcon />
          </Button>
        </Box>
      </Box>
      <Box
        id="durationFormBox"
        sx={{
          flex: { xs: "none", sm: 1 },
          display: "flex",
          justifyContent: { xs: "center", sm: "flex-end" },
          paddingTop: "4px",
          paddingBottom: "4px",
          marginRight: { xs: 0, sm: "4px" },
          order: { xs: 3, sm: 3 },
        }}
      >
        <Select value={selectedDuration} onValueChange={setSelectedDuration}>
          <SelectTrigger className="duration-select" aria-label="Duration">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            {sortByBracketContent(durations).map((duration, index) => (
              <SelectItem key={index} value={duration}>
                {formatDurationText(duration)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Box>
    </Box>
  );
}
