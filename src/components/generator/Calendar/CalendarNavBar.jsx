import React from "react";
import { Box, useTheme } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateFirstIcon from "@mui/icons-material/FirstPage";
import NavigateLastIcon from "@mui/icons-material/LastPage";
import InfoIcon from "@mui/icons-material/Info";
import CancelIcon from "@mui/icons-material/Cancel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
}) {
  const theme = useTheme();
  const navButtonClassName =
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/40 transition-none";
  const infoButtonBaseClassName =
    "transition-colors disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-accent/60";

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`${infoButtonBaseClassName} text-amber-600 hover:text-amber-600`}
                aria-label="View truncated results info"
              >
                <InfoIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8}>
              <div className="space-y-2 text-sm">
                <div className="font-medium">Truncated Results</div>
                <p className="text-muted-foreground">
                  The generated schedule results are truncated because the input
                  is too broad. Some possible course sections may not be shown.
                </p>
                <p className="text-muted-foreground">
                  Pin down courses by clicking them to lock in place, or block
                  out unwanted time blocks before adding more courses.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {noTimetablesGenerated && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`${infoButtonBaseClassName} text-red-600 hover:text-red-600`}
                aria-label="View no timetables generated info"
              >
                <CancelIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8}>
              <div className="space-y-2 text-sm">
                <div className="font-medium">No Timetables Generated</div>
                <p className="text-muted-foreground">
                  This can happen if a course is not offered for this duration
                  or the selected courses always overlap.
                </p>
                <p className="text-muted-foreground">
                  Try unblocking or unpinning some components, or remove the
                  last course you added.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {timeslotsOverridden && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`${infoButtonBaseClassName} text-sky-600 hover:text-sky-600`}
                aria-label="View time block overlap info"
              >
                <InfoIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8}>
              <div className="space-y-2 text-sm">
                <div className="font-medium">
                  Time Block Constraint Course Overlap
                </div>
                <p className="text-muted-foreground">
                  One or more course components conflict with your blocked time
                  slots, so the generated timetable overlaps your constraints.
                </p>
                <p className="text-muted-foreground">
                  Consider unblocking time slots or choosing different courses.
                </p>
              </div>
            </PopoverContent>
          </Popover>
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
            className={navButtonClassName}
          >
            <NavigateFirstIcon />
          </Button>
        </Box>
        <Box sx={{ marginRight: 2 }}>
          <Button
            onClick={handlePrevious}
            disabled={timetables.length <= 1}
            size="icon"
            className={navButtonClassName}
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
            className={navButtonClassName}
          >
            <NavigateNextIcon />
          </Button>
        </Box>
        <Box sx={{ marginLeft: 1 }}>
          <Button
            onClick={handleLast}
            disabled={timetables.length <= 1}
            size="icon"
            className={navButtonClassName}
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
          <SelectTrigger
            className="duration-select w-auto"
            aria-label="Duration"
          >
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
