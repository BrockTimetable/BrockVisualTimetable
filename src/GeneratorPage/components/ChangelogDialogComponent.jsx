import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import FeedbackIcon from "@mui/icons-material/Feedback";

const ChangelogDialogComponent = ({ open, handleClose }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogContent>
                <div>
                    <h2 style={{ fontSize: '1.1rem' }}>Fall/Winter 2025-2026 Update</h2>
                    <p style={{ fontSize: '0.85rem' }}>
                        Fall/Winter 2025-2026 course offerings are now available in the timetable generator!<br></br>Registration opens based on credit count at 6AM on the Brock portal!<br></br><br></br>New students: June 24, 2025<br></br>Transfer Students with over 5.0 credits: July 10, 2025<br></br>15.0 credits or more: July 3, 2025<br></br>10.0 credits or more: July 10, 2025<br></br>9.5 credits or less: July 17, 2025.
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
                <Button 
                    startIcon={<FeedbackIcon />}
                    component="a"
                    href="https://github.com/BrockTimetable/BrockVisualTimetable/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                >
                    Feedback
                </Button>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangelogDialogComponent;
