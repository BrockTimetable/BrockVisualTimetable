import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  XCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

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
  setTruncationDialogOpen,
  setNoTimetablesDialogOpen,
  setTimeslotsOverriddenDialogOpen,
}) {
  return (
    <div
      id="calendarNavBar"
      className="mb-4 flex h-auto items-center rounded-lg border border-border bg-card p-2 transition-colors"
    >
      <div
        id="infoButtonBox"
        className="order-1 flex flex-none justify-center sm:flex-1 sm:justify-start"
      >
        {isTruncated && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTruncationDialogOpen(true)}
            aria-label="Truncated results"
          >
            <Info className="h-4 w-4 text-amber-500" />
          </Button>
        )}
        {noTimetablesGenerated && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNoTimetablesDialogOpen(true)}
            aria-label="No timetables"
          >
            <XCircle className="h-4 w-4 text-destructive" />
          </Button>
        )}
        {timeslotsOverridden && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTimeslotsOverriddenDialogOpen(true)}
            aria-label="Timeslots overridden"
          >
            <Info className="h-4 w-4 text-sky-500" />
          </Button>
        )}
      </div>
      <div
        id="calendarNavButtons"
        className="order-2 flex flex-none items-center justify-center whitespace-nowrap sm:flex-1"
      >
        <div className="mr-1">
          <Button
            size="icon"
            onClick={handleFirst}
            disabled={timetables.length <= 1}
            aria-label="First timetable"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="mr-2">
          <Button
            size="icon"
            onClick={handlePrevious}
            disabled={timetables.length <= 1}
            aria-label="Previous timetable"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div
          id="calendarTimetableNumber"
          className="min-w-[80px] flex-[0_1_auto] text-center text-sm"
        >
          {currentTimetableIndex + 1} of {timetables.length}
        </div>
        <div className="ml-2">
          <Button
            size="icon"
            onClick={handleNext}
            disabled={timetables.length <= 1}
            aria-label="Next timetable"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-1">
          <Button
            size="icon"
            onClick={handleLast}
            disabled={timetables.length <= 1}
            aria-label="Last timetable"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        id="durationFormBox"
        className="order-3 flex flex-none justify-center py-1 sm:flex-1 sm:justify-end sm:pr-1"
      >
        <div className="duration-select w-40">
          <Select value={selectedDuration} onValueChange={setSelectedDuration}>
            <SelectTrigger id="duration-select" aria-label="Duration">
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
    </div>
  );
}
