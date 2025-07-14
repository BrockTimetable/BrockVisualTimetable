import React, { useContext, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import { alpha } from "@mui/material/styles";
import { CourseDetailsContext } from "../../contexts/CourseDetailsContext";
import { CourseColorsContext } from "../../contexts/CourseColorsContext";

// Helper function to format date as Month DD
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (error) {
    return "Unknown";
  }
};

// Helper function to parse Unix timestamp to Date object
const parseUnixTimestamp = (unixTimestamp) => {
  return new Date(parseInt(unixTimestamp, 10) * 1000);
};

// Helper function to parse start dates (ISO format YYYY-MM-DD)
const parseStartDate = (dateStr) => {
  if (!dateStr) return null;

  // Check if it's an ISO date string (YYYY-MM-DD)
  if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  }

  // For other formats, use regular Date parsing
  return new Date(dateStr);
};

// Helper function to parse end dates (ISO format YYYY-MM-DD, subtract 1 day since they're stored as exclusive end dates)
const parseEndDate = (dateStr) => {
  if (!dateStr) return null;

  // Check if it's an ISO date string (YYYY-MM-DD)
  if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day - 1); // month is 0-indexed, subtract 1 day
  }

  // For other formats, use regular Date parsing
  return new Date(dateStr);
};

export default function CourseTimelineComponent({
  addedCourses = [],
  setSelectedDuration,
  durations = [],
  navigateToDate,
  selectedDuration,
}) {
  const { courseDetails } = useContext(CourseDetailsContext);
  const { courseColors, getDefaultColorForCourse } =
    useContext(CourseColorsContext);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);

  const handleCourseClick = (course, event) => {
    try {
      event.stopPropagation(); // Stop the click from reaching the timeline background
      if (
        setSelectedDuration &&
        durations &&
        durations.length > 0 &&
        course.duration
      ) {
        const durationCode = course.duration;

        // Convert start and end dates to Unix timestamps
        const startTimestamp = Math.floor(course.startDate.getTime() / 1000);
        const endTimestamp = Math.floor(course.endDate.getTime() / 1000);

        // Try to find an exact match in the durations array
        let matchedDuration = durations.find((d) => {
          const [durStartUnix, durEndUnix, durCode] = d.split("-");
          return (
            durCode === durationCode &&
            // Allow some flexibility in date matching (within 2 weeks)
            Math.abs(parseInt(durStartUnix) - startTimestamp) < 1209600 &&
            Math.abs(parseInt(durEndUnix) - endTimestamp) < 1209600
          );
        });

        // If no exact match, try to find by duration code only
        if (!matchedDuration) {
          matchedDuration = durations.find((d) => {
            const [_, __, durCode] = d.split("-");
            return durCode === durationCode;
          });
        }

        // If still no match, just use the date range to find the most appropriate duration
        if (!matchedDuration) {
          let closestMatch = null;
          let smallestDiff = Infinity;

          durations.forEach((d) => {
            const [durStartUnix, durEndUnix] = d.split("-");
            const startDiff = Math.abs(parseInt(durStartUnix) - startTimestamp);
            const endDiff = Math.abs(parseInt(durEndUnix) - endTimestamp);
            const totalDiff = startDiff + endDiff;

            if (totalDiff < smallestDiff) {
              smallestDiff = totalDiff;
              closestMatch = d;
            }
          });

          if (closestMatch) {
            matchedDuration = closestMatch;
          }
        }

        if (matchedDuration) {
          setSelectedDuration(matchedDuration);
        }
      }

      if (course.startDate && navigateToDate) {
        const dayOfWeek = course.startDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        let navigationDate = new Date(course.startDate);

        // If classes start on Tuesday-Saturday, navigate to the following week
        // so we can see the full recurring pattern (Monday-Friday)
        if (dayOfWeek >= 2 && dayOfWeek <= 6) {
          // Add days to get to the Monday of the following week
          const daysToAdd = 8 - dayOfWeek; // Days until next Monday
          navigationDate.setDate(navigationDate.getDate() + daysToAdd);
        } else {
          // If classes start on Sunday or Monday, navigate to the Monday of that week
          const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          navigationDate.setDate(navigationDate.getDate() - daysToSubtract);
        }

        navigateToDate(navigationDate.toISOString());
      }
    } catch (error) {
      console.error("Error handling course click:", error);
    }
  };

  const getClosestDuration = (date) => {
    if (!durations || durations.length === 0) return null;

    let closestMatch = null;
    let smallestDiff = Infinity;

    durations.forEach((d) => {
      const [startUnix, endUnix] = d.split("-");
      const startDate = parseUnixTimestamp(startUnix);
      const endDate = parseUnixTimestamp(endUnix);

      // Calculate the difference between the date and the duration's date range
      const startDiff = Math.abs(date - startDate);
      const endDiff = Math.abs(date - endDate);
      const totalDiff = startDiff + endDiff;

      if (totalDiff < smallestDiff) {
        smallestDiff = totalDiff;
        closestMatch = d;
      }
    });

    return closestMatch;
  };

  const handleTimelineMouseMove = (event) => {
    try {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickPercent = (clickX / rect.width) * 100;

      // Calculate the date based on click position
      const dayOffset = (clickPercent / 100) * totalDays;
      const hoverDate = new Date(
        earliestDate.getTime() + dayOffset * 24 * 60 * 60 * 1000,
      );

      // Find the closest duration to the hover date
      const closestDuration = getClosestDuration(hoverDate);
      if (closestDuration) {
        const [startUnix] = closestDuration.split("-");
        const startDate = parseUnixTimestamp(startUnix);
        const dayOffset = (startDate - earliestDate) / (1000 * 60 * 60 * 24);
        const position = (dayOffset / totalDays) * 100;
        setMousePosition(position);
      }
    } catch (error) {
      console.error("Error handling timeline mouse move:", error);
    }
  };

  const handleTimelineClick = (event) => {
    try {
      if (!setSelectedDuration || !durations || durations.length === 0) return;

      // Get the click position relative to the timeline container
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickPercent = (clickX / rect.width) * 100;

      // Calculate the date based on click position
      const dayOffset = (clickPercent / 100) * totalDays;
      const clickedDate = new Date(
        earliestDate.getTime() + dayOffset * 24 * 60 * 60 * 1000,
      );

      // Find the closest duration to the clicked date
      const closestMatch = getClosestDuration(clickedDate);
      if (closestMatch) {
        setSelectedDuration(closestMatch);
      }
    } catch (error) {
      console.error("Error handling timeline click:", error);
    }
  };

  const handleTimelineMouseLeave = () => {
    setMousePosition(null);
  };

  if (!addedCourses?.length) {
    return null;
  }

  const coursesWithDates = addedCourses
    .map((course) => {
      try {
        const courseName = course.code?.toUpperCase();
        const courseString =
          course.string ||
          `${course.code} ${course.section || ""} (${course.duration || ""})`;

        let startDate = course.startDate
          ? parseStartDate(course.startDate)
          : null;
        let endDate = course.endDate ? parseEndDate(course.endDate) : null;

        if (
          !startDate ||
          !endDate ||
          isNaN(startDate.getTime()) ||
          isNaN(endDate.getTime())
        ) {
          const detail = courseDetails?.find((d) => d?.name === courseName);
          if (detail?.startDate && detail?.endDate) {
            startDate = parseStartDate(detail.startDate);
            endDate = parseEndDate(detail.endDate);
          }
        }

        // Skip courses without valid dates
        if (
          !startDate ||
          !endDate ||
          isNaN(startDate.getTime()) ||
          isNaN(endDate.getTime())
        ) {
          return null;
        }

        return {
          code: courseName,
          fullName: courseString,
          startDate,
          endDate,
          color:
            courseColors[courseName] || getDefaultColorForCourse(courseName),
          duration: course.duration || "",
        };
      } catch (error) {
        console.error("Error processing course:", error);
        return null;
      }
    })
    .filter(Boolean);

  if (!coursesWithDates.length) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 1.5,
          px: 2,
          borderRadius: 1,
          backgroundColor: "transparent",
          border: "1px solid",
          borderColor: "var(--calendar-grid-color-light)",
          ".dark-mode &": {
            borderColor: "var(--calendar-grid-color-dark)",
          },
        }}
      >
        <Typography variant="caption" color="text.secondary">
          No valid course date information available
        </Typography>
      </Box>
    );
  }

  // Calculate timeline range using reduce instead of map + spread
  const { earliestDate, latestDate } = coursesWithDates.reduce(
    (acc, course) => ({
      earliestDate:
        course.startDate < acc.earliestDate
          ? course.startDate
          : acc.earliestDate,
      latestDate:
        course.endDate > acc.latestDate ? course.endDate : acc.latestDate,
    }),
    {
      earliestDate: coursesWithDates[0].startDate,
      latestDate: coursesWithDates[0].endDate,
    },
  );

  const totalDays =
    Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) + 1;

  // Calculate position and width percentages for each course
  coursesWithDates.forEach((course) => {
    const startOffset = Math.max(
      0,
      (course.startDate - earliestDate) / (1000 * 60 * 60 * 24),
    );
    const duration =
      Math.ceil((course.endDate - course.startDate) / (1000 * 60 * 60 * 24)) +
      1;

    course.startPercent = (startOffset / totalDays) * 100;
    course.widthPercent = (duration / totalDays) * 100;
  });

  // Generate month markers for the timeline
  const monthMarkers = [];
  const startYear = earliestDate.getFullYear();
  const startMonth = earliestDate.getMonth();
  const endYear = latestDate.getFullYear();
  const endMonth = latestDate.getMonth();

  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

  for (let i = 0; i <= totalMonths; i++) {
    const year = startYear + Math.floor((startMonth + i) / 12);
    const month = (startMonth + i) % 12;

    const monthDate = new Date(year, month, 1);

    if (monthDate >= earliestDate && monthDate <= latestDate) {
      const dayOffset = (monthDate - earliestDate) / (1000 * 60 * 60 * 24);
      const position = (dayOffset / totalDays) * 100;

      monthMarkers.push({
        date: monthDate,
        position,
        label: monthDate.toLocaleDateString("en-US", { month: "short" }),
      });
    }
  }

  return (
    <Box
      sx={{
        mb: 0.5,
        px: 0.5,
      }}
    >
      {/* Timeline container */}
      <Box
        onClick={handleTimelineClick}
        onMouseMove={handleTimelineMouseMove}
        onMouseLeave={handleTimelineMouseLeave}
        sx={{
          position: "relative",
          height: coursesWithDates.length * 24 + 20,
          width: "100%",
          backgroundColor: "transparent",
          borderRadius: 1.5,
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.04),
          },
        }}
      >
        {/* Background with subtle grid */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
            border: "1px solid",
            borderColor: "var(--calendar-grid-color-light)",
            ".dark-mode &": {
              borderColor: "var(--calendar-grid-color-dark)",
            },
            borderRadius: 1.5,
            transition: "all 0.2s ease-in-out",
          }}
        />

        {/* Preview line */}
        {mousePosition !== null && (
          <Box
            sx={{
              position: "absolute",
              left: `${mousePosition}%`,
              top: 0,
              height: "100%",
              width: "2px",
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.3),
              zIndex: 4,
              pointerEvents: "none",
              transition: "left 0.1s ease-out",
            }}
          />
        )}

        {/* Month markers */}
        {monthMarkers.map((marker, index) => (
          <React.Fragment key={`month-${index}`}>
            {/* Vertical line */}
            <Box
              sx={{
                position: "absolute",
                left: `${marker.position}%`,
                top: 0,
                height: "100%",
                width: "1px",
                backgroundColor: "var(--calendar-grid-color-light)",
                ".dark-mode &": {
                  backgroundColor: "var(--calendar-grid-color-dark)",
                },
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
            {/* Month label - only show every other month if there are many months */}
            {(monthMarkers.length <= 12 || index % 2 === 0) && (
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  left: `${marker.position}%`,
                  bottom: 2,
                  transform: "translateX(-50%)",
                  color: (theme) => alpha(theme.palette.text.secondary, 0.9),
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  textShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 1px 2px rgba(0,0,0,0.3)"
                      : "0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                {marker.label}
              </Typography>
            )}
          </React.Fragment>
        ))}

        {/* Current date line */}
        {(() => {
          let selectedDate = null;
          if (selectedDuration) {
            const [startUnix] = selectedDuration.split("-");
            selectedDate = parseUnixTimestamp(startUnix);
          }

          if (
            selectedDate &&
            selectedDate >= earliestDate &&
            selectedDate <= latestDate
          ) {
            const dayOffset =
              (selectedDate - earliestDate) / (1000 * 60 * 60 * 24);
            const position = (dayOffset / totalDays) * 100;

            return (
              <>
                <Box
                  sx={{
                    position: "absolute",
                    left: `${position}%`,
                    top: 0,
                    height: "100%",
                    width: "2px",
                    backgroundColor: (theme) => theme.palette.primary.main,
                    zIndex: 5,
                    pointerEvents: "none",
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": {
                        opacity: 0.4,
                      },
                      "50%": {
                        opacity: 1,
                      },
                      "100%": {
                        opacity: 0.4,
                      },
                    },
                  }}
                />
              </>
            );
          }
          return null;
        })()}

        {/* Course bars with labels */}
        {coursesWithDates.map((course, index) => (
          <React.Fragment key={course.code}>
            {/* Course label */}
            <Tooltip
              title={`${course.fullName}: ${formatDate(
                course.startDate,
              )} - ${formatDate(course.endDate)}`}
              arrow
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 300 }}
            >
              <Typography
                variant="caption"
                onClick={(event) => handleCourseClick(course, event)}
                onMouseEnter={() => setHoveredCourse(course.code)}
                onMouseLeave={() => setHoveredCourse(null)}
                sx={{
                  position: "absolute",
                  left: `${course.startPercent}%`,
                  top: 12 + index * 24,
                  height: "12px",
                  transform: "translateY(-50%)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: (theme) => theme.palette.text.primary,
                  whiteSpace: "nowrap",
                  marginLeft: "4px",
                  zIndex: 4,
                  display: "flex",
                  alignItems: "center",
                  textShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 1px 2px rgba(0,0,0,0.5)"
                      : "0 1px 0 rgba(255,255,255,0.9)",
                  backgroundColor: (theme) =>
                    alpha(theme.palette.background.paper, 0.85),
                  padding: "0 4px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow:
                    hoveredCourse === course.code
                      ? (theme) =>
                          `0 2px 4px ${alpha(
                            course.color,
                            0.4,
                          )}, 0 0 1px ${alpha(theme.palette.common.black, 0.2)}`
                      : "none",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.background.paper, 0.95),
                  },
                  "&:active": {
                    transform: "translateY(-45%) scale(0.98)",
                  },
                }}
              >
                {course.code}
              </Typography>
            </Tooltip>

            {/* Course bar */}
            <Tooltip
              title={`${course.fullName}: ${formatDate(
                course.startDate,
              )} - ${formatDate(course.endDate)}`}
              arrow
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 300 }}
            >
              <Box
                onMouseEnter={() => setHoveredCourse(course.code)}
                onMouseLeave={() => setHoveredCourse(null)}
                onClick={(event) => handleCourseClick(course, event)}
                sx={{
                  position: "absolute",
                  left: `${course.startPercent}%`,
                  top: 12 + index * 24,
                  width: `${course.widthPercent}%`,
                  height: "12px",
                  backgroundColor: course.color,
                  opacity: hoveredCourse === course.code ? 1 : 0.85,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    hoveredCourse === course.code ? "translateY(-1px)" : "none",
                  boxShadow:
                    hoveredCourse === course.code
                      ? (theme) =>
                          `0 2px 4px ${alpha(
                            course.color,
                            0.4,
                          )}, 0 0 1px ${alpha(theme.palette.common.black, 0.2)}`
                      : "none",
                  "&:hover": {
                    opacity: 1,
                    transform: "translateY(-1px)",
                  },
                  "&:active": {
                    transform: "translateY(0px) scale(0.98)",
                    transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
                  },
                  zIndex: hoveredCourse === course.code ? 3 : 2,
                }}
              />
            </Tooltip>
          </React.Fragment>
        ))}
      </Box>

      {/* Date range indicators at the bottom */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 0.5,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          fontSize="0.7rem"
          sx={{ fontWeight: 500 }}
        >
          {formatDate(earliestDate)}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          fontSize="0.7rem"
          sx={{ fontWeight: 500 }}
        >
          {formatDate(latestDate)}
        </Typography>
      </Box>
    </Box>
  );
}
