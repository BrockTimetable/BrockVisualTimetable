import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { exportCal } from "@/lib/generator/ExportCal.js";
import { getVisibleTimetables } from "@/components/generator/Calendar/utils/calendarViewUtils.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatDurationText = (duration) => {
  const [startUnix, endUnix, dur] = duration.split("-");
  const startDate = new Date(parseInt(startUnix, 10) * 1000);
  const endDate = new Date(parseInt(endUnix, 10) * 1000);

  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const endMonth = endDate.toLocaleString("default", { month: "short" });

  return `${startMonth} - ${endMonth} (D${dur})`;
};

const getDurationRange = (duration) => {
  const [startUnix, endUnix] = duration.split("-");
  return {
    start: new Date(parseInt(startUnix, 10) * 1000),
    end: new Date(parseInt(endUnix, 10) * 1000),
  };
};

const getDurationsWithMultipleVariants = (timetables, durations) => {
  if (!Array.isArray(timetables) || timetables.length === 0) {
    return [];
  }

  if (!Array.isArray(durations) || durations.length === 0) {
    return [];
  }

  return durations
    .map((duration) => {
      const range = getDurationRange(duration);
      const visibleTimetables = getVisibleTimetables(timetables, range);
      return {
        duration,
        count: visibleTimetables.length,
      };
    })
    .filter((entry) => entry.count > 1);
};

export default function ExportCalendarButton({
  timetables,
  durations,
  onExportComplete,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const durationsWithVariants = useMemo(
    () => getDurationsWithMultipleVariants(timetables, durations),
    [timetables, durations],
  );
  const canExport =
    timetables.length > 0 && (timetables[0]?.courses?.length ?? 0) > 0;

  const handleExport = () => {
    if (!canExport) return;
    if (durationsWithVariants.length > 0) {
      setConfirmOpen(true);
      return;
    }

    exportCal({ durationCount: durations.length });
    onExportComplete?.();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleExport}
        disabled={!canExport}
        className="w-full transition-none disabled:opacity-100"
        title={
          canExport
            ? "Download this timetable as an .ics file"
            : "Add a course before exporting"
        }
      >
        Export .ics file
      </Button>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Multiple timetable options</DialogTitle>
            <DialogDescription>
              You still have more than one timetable variant in these terms.
              Exporting now might not reflect your final schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="workspace-body space-y-2">
            <div className="font-medium text-foreground">
              Terms with variants
            </div>
            <ul className="list-disc pl-5 text-muted-foreground">
              {durationsWithVariants.map(({ duration, count }) => (
                <li key={duration}>
                  {formatDurationText(duration)} ({count} timetables)
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Go back
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                exportCal({ durationCount: durations.length });
                onExportComplete?.();
              }}
            >
              Export anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

ExportCalendarButton.propTypes = {
  timetables: PropTypes.array.isRequired,
  durations: PropTypes.arrayOf(PropTypes.string).isRequired,
  onExportComplete: PropTypes.func,
};
