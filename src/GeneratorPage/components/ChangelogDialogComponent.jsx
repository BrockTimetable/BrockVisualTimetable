import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

const ChangelogDialogComponent = ({ open, handleClose }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogContent>
                <div>
                    <h2 style={{ fontSize: '1.1rem' }}>Spring/Summer 2025 Update</h2>
                    <p style={{ fontSize: '0.85rem' }}>
                        Spring & Summer 2025 course offerings are now available in the timetable generator!<br></br><br></br>Registration opens Wednesday, March 5th 2025 at 6:00AM EST on your my.brocku.ca portal.
                    </p>
                    <h2 style={{ fontSize: '1.1rem' }}>Tutorial Video</h2>
                    <p style={{ fontSize: '0.85rem' }}>
                        To ensure you have a smooth and efficient experience while creating your timetable,
                        we highly recommend watching the tutorial video below.
                    </p>
                    <video width="100%" height="auto" controls autoPlay>
                        <source src="/BrockTimeTableTutorial.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div>
                    <p style={{ fontSize: '0.6rem' }}>
                        <strong>NOTE:</strong> The Brock Visual Timetable is not affiliated with, partnered, or endorsed by Brock University. The accuracy and availability of this application is not guaranteed.
                    </p>
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangelogDialogComponent;
