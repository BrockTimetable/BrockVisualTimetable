import React, { useContext, useState } from "react";
import { CourseDetailsContext } from "@/lib/contexts/generator/CourseDetailsContext";
import { CourseColorsContext } from "@/lib/contexts/generator/CourseColorsContext";

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
            Math.abs(parseInt(durStartUnix, 10) - startTimestamp) < 1209600 &&
            Math.abs(parseInt(durEndUnix, 10) - endTimestamp) < 1209600
          );
        });

        // If no exact match, try to find by duration code only
        if (!matchedDuration) {
          matchedDuration = durations.find((d) => {
            const [, , durCode] = d.split("-");
            return durCode === durationCode;
          });
        }

        // If still no match, just use the date range to find the most appropriate duration
        if (!matchedDuration) {
          let closestMatch = null;
          let smallestDiff = Infinity;

          durations.forEach((d) => {
            const [durStartUnix, durEndUnix] = d.split("-");
            const startDiff = Math.abs(
              parseInt(durStartUnix, 10) - startTimestamp,
            );
            const endDiff = Math.abs(parseInt(durEndUnix, 10) - endTimestamp);
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
        const navigationDate = new Date(course.startDate);

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
      const hoverX = event.clientX - rect.left;
      const hoverPercent = (hoverX / rect.width) * 100;

      // Calculate the date based on click position
      const dayOffset = (hoverPercent / 100) * totalDays;
      const hoverDate = new Date(
        earliestDate.getTime() + dayOffset * 24 * 60 * 60 * 1000,
      );

      // Find the closest duration to the hover date
      const closestDuration = getClosestDuration(hoverDate);
      if (closestDuration) {
        const [startUnix] = closestDuration.split("-");
        const startDate = parseUnixTimestamp(startUnix);
        const daysFromStart =
          (startDate - earliestDate) / (1000 * 60 * 60 * 24);
        const position = (daysFromStart / totalDays) * 100;
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

        let startDate = course.startDate;
        let endDate = course.endDate;

        if (startDate && !(startDate instanceof Date)) {
          startDate = parseStartDate(startDate);
        }
        if (endDate && !(endDate instanceof Date)) {
          endDate = parseEndDate(endDate);
        }

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
          id: `${courseName}-${course.duration || "nodur"}-${startDate.getTime()}`,
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
      <div className="rounded-md border border-border px-3 py-2 text-center text-xs text-muted-foreground">
        No valid course date information available
      </div>
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

  const timelineHeight = coursesWithDates.length * 24 + 20;

  return (
    <div className="mb-2 px-1">
      {/* Timeline container */}
      <div
        onClick={handleTimelineClick}
        onMouseMove={handleTimelineMouseMove}
        onMouseLeave={handleTimelineMouseLeave}
        className="relative w-full cursor-pointer overflow-hidden rounded-md border border-border transition-colors hover:bg-muted/40"
        style={{ height: timelineHeight }}
      >
        {/* Preview line */}
        {mousePosition !== null && (
          <div
            className="pointer-events-none absolute top-0 z-40 h-full w-[2px] bg-primary/30 transition-[left] duration-100 ease-out"
            style={{ left: `${mousePosition}%` }}
          />
        )}

        {/* Month markers */}
        {monthMarkers.map((marker, index) => (
          <React.Fragment key={`month-${index}`}>
            {/* Vertical line */}
            <div
              className="pointer-events-none absolute top-0 z-10 h-full w-px bg-border"
              style={{ left: `${marker.position}%` }}
            />
            {/* Month label - only show every other month if there are many months */}
            {(monthMarkers.length <= 12 || index % 2 === 0) && (
              <div
                className="pointer-events-none absolute bottom-0 z-10 translate-x-[-50%] text-[0.65rem] font-semibold text-muted-foreground"
                style={{ left: `${marker.position}%` }}
              >
                {marker.label}
              </div>
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
              <div
                className="pointer-events-none absolute top-0 z-50 h-full w-[2px] animate-pulse bg-primary"
                style={{ left: `${position}%` }}
              />
            );
          }
          return null;
        })()}

        {/* Course bars with labels */}
        {coursesWithDates.map((course, index) => {
          const tooltipText = `${course.fullName}: ${formatDate(
            course.startDate,
          )} - ${formatDate(course.endDate)}`;
          const isHovered = hoveredCourse === course.id;
          const topOffset = 12 + index * 24;

          return (
            <React.Fragment key={course.id}>
              {/* Course label */}
              <div
                title={tooltipText}
                onClick={(event) => handleCourseClick(course, event)}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                className={`absolute z-40 flex h-3 -translate-y-1/2 items-center whitespace-nowrap rounded-sm px-1 text-[0.65rem] font-semibold text-foreground shadow-sm transition ${
                  isHovered ? "bg-background" : "bg-background/90"
                }`}
                style={{
                  left: `${course.startPercent}%`,
                  top: topOffset,
                }}
              >
                {course.code}
              </div>

              {/* Course bar */}
              <div
                title={tooltipText}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                onClick={(event) => handleCourseClick(course, event)}
                className={`absolute h-3 rounded-md transition ${
                  isHovered ? "shadow-md" : "shadow-sm"
                }`}
                style={{
                  left: `${course.startPercent}%`,
                  top: topOffset,
                  width: `${course.widthPercent}%`,
                  backgroundColor: course.color,
                  opacity: isHovered ? 1 : 0.85,
                }}
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* Date range indicators at the bottom */}
      <div className="mt-2 flex items-center justify-between text-[0.7rem] font-semibold text-muted-foreground">
        <span>{formatDate(earliestDate)}</span>
        <span>{formatDate(latestDate)}</span>
      </div>
    </div>
  );
}
