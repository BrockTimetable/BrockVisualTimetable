import React, { useMemo, useState } from "react";
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

export default function ExportCalendarButton({ timetables, durations }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const durationsWithVariants = useMemo(
    () => getDurationsWithMultipleVariants(timetables, durations),
    [timetables, durations],
  );

  const handleExport = () => {
    if (durationsWithVariants.length > 0) {
      setConfirmOpen(true);
      return;
    }

    exportCal();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleExport}
        className="transition-none"
      >
        Export Calendar
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
          <div className="space-y-2 text-sm">
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
                exportCal();
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
