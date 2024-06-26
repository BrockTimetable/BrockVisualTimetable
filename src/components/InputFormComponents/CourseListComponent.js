import React from "react";

import CourseListItemComponent from "./CourseListItemComponent";

import ListSubheader from "@mui/material/ListSubheader";
import Box from "@mui/material/Box";
import List from "@mui/material/List";

export default function CourseListComponent({ courses = [], onRemoveCourse }) {
    return (
        <Box sx={{ minWidth: 120 }} m={2}>
            <List
                sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                subheader={
                    <ListSubheader component="div">
                        Added Courses (Click to see more details):
                    </ListSubheader>
                }
            >
                {courses.map((course) => (
                    <CourseListItemComponent course={course} removeCourse={onRemoveCourse} />
                ))}
            </List>
        </Box>
    );
}

/*
<Grid item xs={12} md={6}>
  <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
    Avatar with text and icon
  </Typography>
  <Demo>
    <List dense={dense}>
      {generate(
        <ListItem
          secondaryAction={
            <IconButton edge="end" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemAvatar>
            <Avatar>
              <FolderIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Single-line item"
            secondary={secondary ? 'Secondary text' : null}
          />
        </ListItem>,
      )}
    </List>
  </Demo>
</Grid>
  */
