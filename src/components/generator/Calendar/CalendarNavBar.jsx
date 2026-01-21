import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleX,
  Info,
} from "lucide-react";
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
  sortByBracketContent,
}) {
  const navButtonClassName =
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/40 transition-none";
  const infoButtonBaseClassName =
    "transition-colors disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-accent/60";

  return (
    <div
      id="calendarNavBar"
      className="mb-4 flex h-auto items-center rounded-lg border border-border bg-card p-2"
    >
      <div
        id="infoButtonBox"
        className="order-1 flex flex-none justify-center sm:flex-1 sm:justify-start"
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
                <Info className="h-4 w-4" />
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
                <CircleX className="h-4 w-4" />
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
                <Info className="h-4 w-4" />
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
      </div>
      <div
        id="calendarNavButtons"
        className="order-2 flex flex-none items-center justify-center whitespace-nowrap sm:flex-1"
      >
        <div className="mr-1">
          <Button
            onClick={handleFirst}
            disabled={timetables.length <= 1}
            size="icon"
            className={navButtonClassName}
          >
            <ChevronsLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="mr-2">
          <Button
            onClick={handlePrevious}
            disabled={timetables.length <= 1}
            size="icon"
            className={navButtonClassName}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <div
          id="calendarTimetableNumber"
          className="min-w-[80px] flex-[0_1_auto] text-center text-sm font-medium text-foreground"
        >
          {currentTimetableIndex + 1} of {timetables.length}
        </div>
        <div className="ml-2">
          <Button
            onClick={handleNext}
            disabled={timetables.length <= 1}
            size="icon"
            className={navButtonClassName}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="ml-1">
          <Button
            onClick={handleLast}
            disabled={timetables.length <= 1}
            size="icon"
            className={navButtonClassName}
          >
            <ChevronsRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div
        id="durationFormBox"
        className="order-3 flex flex-none justify-center py-1 sm:flex-1 sm:justify-end sm:pr-1"
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
      </div>
    </div>
  );
}
