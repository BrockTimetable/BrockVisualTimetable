import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Button } from "@/components/ui/button";

export default function NoTimetablesDialog({
  noTimetablesDialogOpen,
  handleCloseNoTimetablesDialog,
}) {
  return (
    <Dialog
      open={noTimetablesDialogOpen}
      onClose={handleCloseNoTimetablesDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="no-timetables-generated-dialog"
    >
      <DialogTitle id="alert-dialog-title">
        {"No Timetables Generated"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          This is likely caused by one of the following reasons:
        </DialogContentText>
        <DialogContentText>
          1. Adding a course that is not being offered in that duration.
        </DialogContentText>
        <DialogContentText sx={{ mb: 2 }}>
          2. Adding courses that always overlap with another course.
        </DialogContentText>
        <DialogContentText>
          Try unblocking/unpinning some components or removing the last course
          you have added.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseNoTimetablesDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
