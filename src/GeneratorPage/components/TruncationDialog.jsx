
import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

export default function TruncationDialog({ truncationDialogOpen, handleCloseTruncationDialog }) {
    return (
        <Dialog
            open={truncationDialogOpen}
            onClose={handleCloseTruncationDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            id="truncation-dialog"
        >
            <DialogTitle id="alert-dialog-title">{"Truncated Results"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description" sx={{ mb: 2 }}>
                    The generated schedule results are truncated because the input is too broad. Some possible course
                    sections may not be shown.
                </DialogContentText>
                <DialogContentText>
                    To ensure all results are considered pin down some courses by clicking on them to lock them in place
                    or block out unwanted time blocks by selecting the area on the calendar prior to adding more
                    courses!
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseTruncationDialog} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}