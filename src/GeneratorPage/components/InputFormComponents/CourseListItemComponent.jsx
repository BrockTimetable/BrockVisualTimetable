import React, { useContext } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import { ListItemButton } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import { CourseColorsContext } from "../../contexts/CourseColorsContext";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { clearCoursePins } from "../../scripts/pinnedComponents";

// Helper function to parse start dates (ISO format YYYY-MM-DD)
const parseStartDate = (dateStr) => {
  if (!dateStr) return "N/A";

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to parse end dates (ISO format YYYY-MM-DD, subtract 1 day since they're stored as exclusive end dates)
const parseEndDate = (dateStr) => {
  if (!dateStr) return "N/A";

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day - 1); // month is 0-indexed, subtract 1 day
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function CourseListComponent({
  course,
  courseDetail,
  removeCourse,
}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const { courseColors, updateCourseColor, getDefaultColorForCourse } =
    useContext(CourseColorsContext);
  const courseCode = course.split(" ")[0] + course.split(" ")[1];

  const handleClick = () => {
    setOpen(!open);
  };

  const handleRemoveClick = () => {
    setOpen(false);
    removeCourse(course);
    clearCoursePins(course.split(" ")[0] + course.split(" ")[1]);
  };

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    if (newColor && newColor !== courseColors[courseCode]) {
      updateCourseColor(courseCode, newColor);
    }
  };

  // Get the current color, falling back to the default color system
  const currentColor =
    courseColors[courseCode] || getDefaultColorForCourse(courseCode);

  return (
    <Box
      sx={{
        mb: 1,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        overflow: "hidden",
        transition: "border-color 0.5s ease",
      }}
    >
      <ListItemButton
        onClick={handleClick}
        sx={{
          backgroundColor: theme.palette.background.paper,
          transition: "background-color 0.5s ease, color 0.5s ease",
        }}
      >
        <ListItemText
          primary={course}
          sx={{ textTransform: "uppercase", fontWeight: "bold" }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: currentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${theme.palette.divider}`,
              }}
            >
              <ColorLensIcon sx={{ color: theme.palette.background.paper }} />
            </Box>
            <input
              type="color"
              value={currentColor}
              onChange={handleColorChange}
              onInput={handleColorChange}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
              }}
            />
          </Box>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={handleRemoveClick}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton edge="end" aria-label="expand">
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem>
            <ListItemText
              primary={courseDetail ? courseDetail.instructor : "N/A"}
              secondary="Course Instructor"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={courseDetail ? courseDetail.section : "N/A"}
              secondary="Section Number"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={
                courseDetail ? parseStartDate(courseDetail.startDate) : "N/A"
              }
              secondary="Start Date"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={
                courseDetail ? parseEndDate(courseDetail.endDate) : "N/A"
              }
              secondary="End Date"
            />
          </ListItem>
        </List>
      </Collapse>
    </Box>
  );
}
