import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

const ChangelogDialogComponent = ({ open, handleClose }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Brock Visual Timetable - [Early Access Release]</DialogTitle>
            <DialogContent>
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: 'red', fontSize: '0.775rem' }}>
                        <strong>NOTE:</strong> This is an early access release. Features may not work as intended, and changes are expected in future updates. We appreciate your patience and feedback as we continue to improve the application.
                    </p>
                    <h2>Tutorial Video</h2>
                    <p>
                        To ensure you have a smooth and efficient experience while creating your timetable,
                        we highly recommend watching the tutorial video below.
                    </p>
                    <video width="100%" height="auto" controls autoPlay>
                        <source src="/BrockTimeTableTutorial.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div>
                    <p style={{ fontSize: '0.775rem' }}>
                        <strong>NOTE:</strong> The Brock Visual Timetable application was developed by an independent team of students with the goal of assisting other students and is not affiliated with, partnered, or endorsed
                        by Brock University. The use of this application is at your own discretion. For any official information or updates related to Brock University, please refer directly to the
                        university's official channels.<br></br><br></br>For any questions, concerns, feedback, or bug reports, please contact us at brocktimetable@gmail.com
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
