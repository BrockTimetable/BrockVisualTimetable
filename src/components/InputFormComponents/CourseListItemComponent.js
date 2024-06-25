import React from "react";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import { ListItemButton } from "@mui/material";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { Margin, Padding } from "@mui/icons-material";

export default function CourseListComponent({ course, removeCourse }) {

    // Default value for courses
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    const handleRemoveClick = () => {
        setOpen(false);
        removeCourse(course);
    }

    return (
        <Box>
            <ListItemButton
                //onClick={() => onRemoveCourse(course)}
                onClick={handleClick}
            >
                <ListItemText primary={course} />
                <IconButton edge="false" aria-label="delete" onClick={handleRemoveClick}>
                    <DeleteIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete">
                    {open ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItem>
                        <ListItemText primary="Prof. Name" secondary="Course Instructor"/>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Placeholder 1" secondary="Placeholder 2"/>
                    </ListItem>
                </List>
            </Collapse>
        </Box>
    );
}

