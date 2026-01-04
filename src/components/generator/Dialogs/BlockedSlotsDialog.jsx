import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Button } from "@/components/ui/button";

export default function BlockedSlotsDialog({
  timeslotsOverriddenDialogOpen,
  handleCloseBlockedSlotsDialog,
}) {
  return (
    <Dialog
      open={timeslotsOverriddenDialogOpen}
      onClose={handleCloseBlockedSlotsDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="blocked-slots-dialog"
    >
      <DialogTitle id="alert-dialog-title">
        {"Time Block Constraint Course Overlap"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          All available options for one or more course components conflict with
          your current time constraints, meaning the chosen class overlaps with
          your blocked time slots. Consequently, registering for this schedule
          will result in a class during one of your blocked time periods. Please
          ensure you are available for the generated timetable prior to
          registering.
        </DialogContentText>
        <DialogContentText sx={{ mb: 2 }}>
          To resolve this issue:
        </DialogContentText>
        <DialogContentText sx={{ mb: 2 }}>
          1. Adjust your blocked time slots: Consider unblocking certain time
          slots to increase scheduling flexibility.
        </DialogContentText>
        <DialogContentText sx={{ mb: 2 }}>
          2. Choose different courses: Look for alternative classes that do not
          overlap with your blocked times.
        </DialogContentText>
        <DialogContentText>
          Please review your schedule to ensure there are no overlapping
          commitments during the scheduled course periods.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseBlockedSlotsDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
