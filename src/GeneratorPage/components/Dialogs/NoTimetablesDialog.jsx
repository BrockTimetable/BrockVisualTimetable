import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function NoTimetablesDialog({
  noTimetablesDialogOpen,
  handleCloseNoTimetablesDialog,
}) {
  return (
    <Dialog
      open={noTimetablesDialogOpen}
      onOpenChange={(value) => !value && handleCloseNoTimetablesDialog()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="no-timetables-generated-dialog"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle id="alert-dialog-title">
            No Timetables Generated
          </DialogTitle>
          <DialogDescription
            id="alert-dialog-description"
            className="space-y-2"
          >
            <span className="block">
              This is likely caused by one of the following reasons:
            </span>
            <span className="block">
              1. Adding a course that is not being offered in that duration.
            </span>
            <span className="block">
              2. Adding courses that always overlap with another course.
            </span>
            <span className="block">
              Try unblocking/unpinning some components or removing the last
              course you have added.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleCloseNoTimetablesDialog}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
