import { useContext, useState, Fragment } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
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

  if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(dateStr);
};

// Helper function to parse end dates (ISO format YYYY-MM-DD, subtract 1 day since they're stored as exclusive end dates)
const parseEndDate = (dateStr) => {
  if (!dateStr) return null;

  if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day - 1);
  }

  return new Date(dateStr);
};

const hexToRgba = (hex, alphaValue) => {
  const sanitized = hex.replace("#", "");
  const value =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => char + char)
          .join("")
      : sanitized;
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alphaValue})`;
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
      event.stopPropagation();
      if (
        setSelectedDuration &&
        durations &&
        durations.length > 0 &&
        course.duration
      ) {
        const durationCode = course.duration;

        const startTimestamp = Math.floor(course.startDate.getTime() / 1000);
        const endTimestamp = Math.floor(course.endDate.getTime() / 1000);

        let matchedDuration = durations.find((d) => {
          const [durStartUnix, durEndUnix, durCode] = d.split("-");
          return (
            durCode === durationCode &&
            Math.abs(parseInt(durStartUnix) - startTimestamp) < 1209600 &&
            Math.abs(parseInt(durEndUnix) - endTimestamp) < 1209600
          );
        });

        if (!matchedDuration) {
          matchedDuration = durations.find((d) => {
            const [_, __, durCode] = d.split("-");
            return durCode === durationCode;
          });
        }

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
        const dayOfWeek = course.startDate.getDay();
        let navigationDate = new Date(course.startDate);

        if (dayOfWeek >= 2 && dayOfWeek <= 6) {
          const daysToAdd = 8 - dayOfWeek;
          navigationDate.setDate(navigationDate.getDate() + daysToAdd);
        } else {
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

      const dayOffset = (clickPercent / 100) * totalDays;
      const hoverDate = new Date(
        earliestDate.getTime() + dayOffset * 24 * 60 * 60 * 1000,
      );

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

      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickPercent = (clickX / rect.width) * 100;

      const dayOffset = (clickPercent / 100) * totalDays;
      const clickedDate = new Date(
        earliestDate.getTime() + dayOffset * 24 * 60 * 60 * 1000,
      );

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
      <div className="rounded-md border border-[var(--calendar-grid-color-light)] px-2 py-1.5 text-center text-xs text-muted-foreground dark:border-[var(--calendar-grid-color-dark)]">
        No valid course date information available
      </div>
    );
  }

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
    <TooltipProvider>
      <div className="mb-2 px-0.5">
        <div
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
          className="relative w-full cursor-pointer overflow-hidden rounded-lg transition-colors hover:bg-muted/10"
          style={{ height: coursesWithDates.length * 24 + 20 }}
        >
          <div className="absolute inset-0 rounded-lg border border-[var(--calendar-grid-color-light)] transition-colors dark:border-[var(--calendar-grid-color-dark)]" />

          {mousePosition !== null && (
            <div
              className="pointer-events-none absolute top-0 z-[4] h-full w-[2px] transition-[left] duration-100 ease-out"
              style={{
                left: `${mousePosition}%`,
                backgroundColor: "hsl(var(--primary) / 0.3)",
              }}
            />
          )}

          {monthMarkers.map((marker, index) => (
            <Fragment key={`month-${index}`}>
              <div
                className="pointer-events-none absolute top-0 z-[1] h-full w-px bg-[var(--calendar-grid-color-light)] dark:bg-[var(--calendar-grid-color-dark)]"
                style={{ left: `${marker.position}%` }}
              />
              {(monthMarkers.length <= 12 || index % 2 === 0) && (
                <span
                  className="pointer-events-none absolute bottom-0.5 whitespace-nowrap text-[0.65rem] font-medium text-muted-foreground/90"
                  style={{
                    left: `${marker.position}%`,
                    transform: "translateX(-50%)",
                    textShadow:
                      "0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  {marker.label}
                </span>
              )}
            </Fragment>
          ))}

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
                  className="pointer-events-none absolute top-0 z-[5] h-full w-[2px] animate-pulse"
                  style={{
                    left: `${position}%`,
                    backgroundColor: "hsl(var(--primary))",
                  }}
                />
              );
            }
            return null;
          })()}

          {coursesWithDates.map((course, index) => {
            const tooltipText = `${course.fullName}: ${formatDate(
              course.startDate,
            )} - ${formatDate(course.endDate)}`;
            const boxShadow =
              hoveredCourse === course.code
                ? `0 2px 4px ${hexToRgba(
                    course.color,
                    0.4,
                  )}, 0 0 1px rgba(0,0,0,0.2)`
                : "none";

            return (
              <Fragment key={course.code}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      onClick={(event) => handleCourseClick(course, event)}
                      onMouseEnter={() => setHoveredCourse(course.code)}
                      onMouseLeave={() => setHoveredCourse(null)}
                      className="absolute z-[4] ml-1 flex h-3 -translate-y-1/2 cursor-pointer items-center rounded-sm bg-card/85 px-1 text-[0.65rem] font-semibold text-foreground shadow-none transition-all hover:bg-card/95 active:scale-[0.98] active:-translate-y-[45%]"
                      style={{
                        left: `${course.startPercent}%`,
                        top: 12 + index * 24,
                        boxShadow,
                        textShadow:
                          "0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.9)",
                      }}
                    >
                      {course.code}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{tooltipText}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onMouseEnter={() => setHoveredCourse(course.code)}
                      onMouseLeave={() => setHoveredCourse(null)}
                      onClick={(event) => handleCourseClick(course, event)}
                      className="absolute z-[2] h-3 cursor-pointer rounded-full transition-all hover:opacity-100 hover:-translate-y-px active:scale-[0.98] active:translate-y-0"
                      style={{
                        left: `${course.startPercent}%`,
                        top: 12 + index * 24,
                        width: `${course.widthPercent}%`,
                        backgroundColor: course.color,
                        opacity: hoveredCourse === course.code ? 1 : 0.85,
                        transform:
                          hoveredCourse === course.code
                            ? "translateY(-1px)"
                            : "none",
                        boxShadow,
                        zIndex: hoveredCourse === course.code ? 3 : 2,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{tooltipText}</TooltipContent>
                </Tooltip>
              </Fragment>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-between text-[0.7rem] font-medium text-muted-foreground">
          <span>{formatDate(earliestDate)}</span>
          <span>{formatDate(latestDate)}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
