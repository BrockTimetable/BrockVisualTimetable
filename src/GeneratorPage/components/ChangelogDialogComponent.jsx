// ChangelogDialog.js
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

const ChangelogDialogComponent = ({ open, handleClose }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Brock Visual Timetable v1.0</DialogTitle>
            <DialogContent>
                <h4>Tutorial Video</h4>
                <ul>
                    <li>Video tutorial on how to use the Brock Visual Timetable coming soon...</li>
                </ul>
                <h4>Changelog</h4>
                <ul>
                    <li>Version 1.0.0 - Initial release.</li>
                </ul>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangelogDialogComponent;
