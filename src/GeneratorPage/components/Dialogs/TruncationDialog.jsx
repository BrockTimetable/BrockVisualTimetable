import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function TruncationDialog({
  truncationDialogOpen,
  handleCloseTruncationDialog,
}) {
  return (
    <Dialog
      open={truncationDialogOpen}
      onOpenChange={(value) => !value && handleCloseTruncationDialog()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="truncation-dialog"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle id="alert-dialog-title">Truncated Results</DialogTitle>
          <DialogDescription
            id="alert-dialog-description"
            className="space-y-3"
          >
            The generated schedule results are truncated because the input is
            too broad. Some possible course sections may not be shown.
            <span className="block">
              To ensure all results are considered pin down some courses by
              clicking on them to lock them in place or block out unwanted time
              blocks by selecting the area on the calendar prior to adding more
              courses!
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleCloseTruncationDialog}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
