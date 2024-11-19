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
import { useTheme } from "@mui/material/styles";
import Divider from '@mui/material/Divider';

export default function CourseListComponent({ course, courseDetail, removeCourse }) {
    const theme = useTheme();

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    const handleRemoveClick = () => {
        setOpen(false);
        removeCourse(course);
    }

    return (
        <Box sx={{ mb: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden' }}>
            <ListItemButton
                onClick={handleClick}
                sx={{ backgroundColor: theme.palette.background.paper }}
            >
                <ListItemText primary={course} sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} />
                <IconButton edge="end" aria-label="delete" onClick={handleRemoveClick}>
                    <DeleteIcon />
                </IconButton>
                <IconButton edge="end" aria-label="expand">
                    {open ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ backgroundColor: theme.palette.background.default }}>
                    <ListItem>
                        <ListItemText primary={courseDetail ? courseDetail.instructor : "N/A"} secondary="Course Instructor" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary={courseDetail ? courseDetail.section : "N/A"} secondary="Section Number" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary={courseDetail ? `${new Date(courseDetail.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : "N/A"} secondary="Start Date" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary={courseDetail ? `${new Date(courseDetail.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : "N/A"} secondary="End Date" />
                    </ListItem>
                </List>
            </Collapse>
        </Box>
    );
}
