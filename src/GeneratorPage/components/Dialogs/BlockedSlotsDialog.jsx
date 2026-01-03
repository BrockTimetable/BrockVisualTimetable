import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function BlockedSlotsDialog({
  timeslotsOverriddenDialogOpen,
  handleCloseBlockedSlotsDialog,
}) {
  return (
    <Dialog
      open={timeslotsOverriddenDialogOpen}
      onOpenChange={(value) => !value && handleCloseBlockedSlotsDialog()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="blocked-slots-dialog"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle id="alert-dialog-title">
            Time Block Constraint Course Overlap
          </DialogTitle>
          <DialogDescription
            id="alert-dialog-description"
            className="space-y-2"
          >
            <span className="block">
              All available options for one or more course components conflict
              with your current time constraints, meaning the chosen class
              overlaps with your blocked time slots. Consequently, registering
              for this schedule will result in a class during one of your
              blocked time periods. Please ensure you are available for the
              generated timetable prior to registering.
            </span>
            <span className="block">To resolve this issue:</span>
            <span className="block">
              1. Adjust your blocked time slots: Consider unblocking certain
              time slots to increase scheduling flexibility.
            </span>
            <span className="block">
              2. Choose different courses: Look for alternative classes that do
              not overlap with your blocked times.
            </span>
            <span className="block">
              Please review your schedule to ensure there are no overlapping
              commitments during the scheduled course periods.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleCloseBlockedSlotsDialog}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
