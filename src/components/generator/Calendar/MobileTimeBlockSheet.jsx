import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const DAYS = [
  { code: "M", label: "M", fullLabel: "Monday" },
  { code: "T", label: "Tu", fullLabel: "Tuesday" },
  { code: "W", label: "W", fullLabel: "Wednesday" },
  { code: "R", label: "Th", fullLabel: "Thursday" },
  { code: "F", label: "F", fullLabel: "Friday" },
  { code: "S", label: "Sa", fullLabel: "Saturday" },
  { code: "U", label: "Su", fullLabel: "Sunday" },
];

const WEEKDAYS = DAYS.slice(0, 5).map(({ code }) => code);
const TIMES = Array.from({ length: 29 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

const formatTimeLabel = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

export default function MobileTimeBlockSheet({
  open,
  onOpenChange,
  onSubmit,
  block = null,
  onDelete,
}) {
  const [days, setDays] = useState(WEEKDAYS);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setDays(block ? [...block.daysOfWeek.replace(/\s/g, "")] : WEEKDAYS);
      setStartTime(block ? normalizeTime(block.startTime) : "09:00");
      setEndTime(block ? normalizeTime(block.endTime) : "10:00");
      setTitle(block?.title || "");
      setConfirmingDelete(false);
    }
  }, [open, block]);

  const toggleDay = (day) => {
    setDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : DAYS.filter(
            ({ code }) => currentDays.includes(code) || code === day,
          ).map(({ code }) => code),
    );
  };

  const handleStartTimeChange = (nextStartTime) => {
    setStartTime(nextStartTime);
    if (nextStartTime >= endTime) {
      const nextEndTime = TIMES.find((time) => time > nextStartTime);
      if (nextEndTime) setEndTime(nextEndTime);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (days.length === 0) return;
    onSubmit({ days, startTime, endTime, title: title.trim() });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!block) return;
    onDelete(block);
    setConfirmingDelete(false);
    onOpenChange(false);
  };

  const isEditing = Boolean(block);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] overflow-y-auto rounded-t-xl px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-7"
      >
        {confirmingDelete ? (
          <>
            <SheetHeader className="pr-8 text-left">
              <SheetTitle>Delete this blocked time?</SheetTitle>
              <SheetDescription>
                {block?.title
                  ? `“${block.title}” will become available again.`
                  : "This time will become available again."}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => setConfirmingDelete(false)}
              >
                Keep blocked
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-11"
                onClick={handleDelete}
              >
                Delete time
              </Button>
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="pr-8 text-left">
              <SheetTitle>
                {isEditing ? "Edit blocked time" : "Block weekly time"}
              </SheetTitle>
              <SheetDescription>
                This repeats every week on the days you select.
              </SheetDescription>
            </SheetHeader>

            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-foreground">
                  Days
                </legend>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    {DAYS.map(({ code, label, fullLabel }) => {
                      const selected = days.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          aria-label={fullLabel}
                          aria-pressed={selected}
                          onClick={() => toggleDay(code)}
                          className={`h-10 min-w-9 rounded-full border px-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-background text-foreground hover:bg-accent"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 px-2 text-muted-foreground"
                      onClick={() => setDays(WEEKDAYS)}
                    >
                      Weekdays
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 px-2 text-muted-foreground"
                      onClick={() => setDays([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                {days.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Select at least one day.
                  </p>
                )}
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm font-medium text-foreground">
                  <span>From</span>
                  <select
                    aria-label="Start time"
                    value={startTime}
                    onChange={(event) =>
                      handleStartTimeChange(event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-base font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {TIMES.slice(0, -1).map((time) => (
                      <option key={time} value={time}>
                        {formatTimeLabel(time)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-foreground">
                  <span>To</span>
                  <select
                    aria-label="End time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-base font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {TIMES.filter((time) => time > startTime).map((time) => (
                      <option key={time} value={time}>
                        {formatTimeLabel(time)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-2 text-sm font-medium text-foreground">
                <span>
                  Name{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </span>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Work or Gym"
                  maxLength={50}
                  className="h-11 text-base"
                />
              </label>

              <div className="flex items-center justify-between gap-3 pt-1">
                {isEditing ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Delete blocked time"
                    title="Delete blocked time"
                    className="h-11 w-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Trash2 aria-hidden="true" className="h-5 w-5" />
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-11"
                    disabled={days.length === 0}
                  >
                    {isEditing ? "Save changes" : "Block time"}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

const normalizeTime = (time) => {
  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

MobileTimeBlockSheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  block: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    daysOfWeek: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
  }),
  onDelete: PropTypes.func,
};
