import React from "react";
import BlockIcon from "@mui/icons-material/Block";
import PinIcon from "@mui/icons-material/PushPin";
import { isEventPinned } from "@/lib/generator/createCalendarEvents";
import { getCourseData } from "@/lib/generator/courseData";

// Event rendering function
export const renderEventContent = (eventInfo, isMobile = false) => {
  // Calculate the event duration in minutes
  const startTime = eventInfo.event.start;
  const endTime = eventInfo.event.end;
  const eventDuration = (endTime - startTime) / (1000 * 60); // Duration in minutes

  // Set the threshold for showing the time (90 minutes)
  const minDurationToShowTime = 90;

  if (eventInfo.event.extendedProps.isBlocked) {
    const blockTitle = eventInfo.event.title || "";
    const truncatedTitle =
      blockTitle.length > 25 ? `${blockTitle.substring(0, 25)}...` : blockTitle;

    return (
      <div
        style={{ position: "relative", height: "100%", textAlign: "center" }}
      >
        {eventDuration >= minDurationToShowTime && (
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: "2px",
              textAlign: "left",
            }}
          >
            <b>{eventInfo.timeText}</b>
            <br />
            <span style={{}}>{truncatedTitle}</span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <span style={{ fontSize: "2rem" }}>
            <BlockIcon />
          </span>
        </div>
      </div>
    );
  } else {
    const isPinned = isEventPinned(eventInfo.event);

    return (
      <div
        style={{
          position: "relative",
          backgroundColor: isPinned ? "rgba(0, 0, 0, 0.5)" : "transparent",
          height: "100%",
          padding: "2px",
          borderRadius: "4px",
        }}
      >
        {eventDuration >= minDurationToShowTime && (
          <div style={{ position: "absolute", top: "2px", left: "2px" }}>
            <b>{eventInfo.timeText}</b>
          </div>
        )}
        {isPinned && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.25,
              fontSize: "4rem",
            }}
          >
            <PinIcon />
          </div>
        )}
        <div style={{ position: "relative", zIndex: 1 }}>
          <b>{eventInfo.timeText}</b>
          <br />
          <span>{eventInfo.event.title}</span>
          {(isMobile || eventDuration >= minDurationToShowTime) && (
            <>
              <br />
              <span
                style={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  lineHeight: "1.2",
                }}
                title={
                  eventInfo.event.extendedProps.description ||
                  "Instructor information not available"
                }
              >
                {eventInfo.event.extendedProps.description || "No instructor"}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }
};

// Check if any courses have weekend classes
export const checkForWeekendClasses = (timetable) => {
  if (!timetable || !timetable.courses) {
    return false;
  }

  for (const course of timetable.courses) {
    const { mainComponents, secondaryComponents } = course;

    // Check main components
    if (mainComponents) {
      for (const component of mainComponents) {
        if (
          component.schedule.days &&
          (component.schedule.days.includes("S") ||
            component.schedule.days.includes("U"))
        ) {
          return true;
        }
      }
    }

    // Check secondary components
    if (secondaryComponents) {
      const { lab, tutorial, seminar } = secondaryComponents;

      if (
        lab &&
        lab.schedule.days &&
        (lab.schedule.days.includes("S") || lab.schedule.days.includes("U"))
      ) {
        return true;
      }

      if (
        tutorial &&
        tutorial.schedule.days &&
        (tutorial.schedule.days.includes("S") ||
          tutorial.schedule.days.includes("U"))
      ) {
        return true;
      }

      if (
        seminar &&
        seminar.schedule.days &&
        (seminar.schedule.days.includes("S") ||
          seminar.schedule.days.includes("U"))
      ) {
        return true;
      }
    }
  }

  return false;
};

// Prepare courses for timeline
export const prepareCoursesForTimeline = (
  timetables,
  currentTimetableIndex,
) => {
  try {
    const currentTimetable =
      timetables &&
      timetables.length > 0 &&
      currentTimetableIndex < timetables.length
        ? timetables[currentTimetableIndex]
        : null;

    const coursesData = getCourseData();
    const courses = [];

    if (coursesData && Object.keys(coursesData).length > 0) {
      for (const key of Object.keys(coursesData)) {
        const course = coursesData[key];

        if (course.courseCode) {
          let sectionInfo = "";
          let durationInfo = "";
          let startDate = "";
          let endDate = "";

          if (course.sections && course.sections.length > 0) {
            const section = course.sections[0];
            if (section.sectionNumber) {
              sectionInfo = section.sectionNumber;
            }

            if (section.schedule) {
              if (section.schedule.duration) {
                durationInfo = section.schedule.duration;
              }

              if (section.schedule.startDate) {
                startDate = section.schedule.startDate;
              }

              if (section.schedule.endDate) {
                endDate = section.schedule.endDate;
              }
            }
          }

          const courseStr = `${course.courseCode} ${sectionInfo} (${durationInfo})`;

          const courseObject = {
            string: courseStr,
            code: course.courseCode,
            section: sectionInfo,
            duration: durationInfo,
            startDate: startDate,
            endDate: endDate,
          };

          courses.push(courseObject);
        } else if (course.code) {
          const courseStr = `${course.code} ${course.section || ""} (${
            course.duration || ""
          })`;

          const courseObject = {
            string: courseStr,
            code: course.code,
            section: course.section || "",
            duration: course.duration || "",
            startDate: course.startDate || "",
            endDate: course.endDate || "",
          };

          courses.push(courseObject);
        }
      }
    }

    if (currentTimetable && Array.isArray(currentTimetable)) {
      const addedCourseCodes = new Set(courses.map((c) => c.code));

      currentTimetable.forEach((component) => {
        if (component && component.courseCode) {
          if (!addedCourseCodes.has(component.courseCode)) {
            const courseStr = `${component.courseCode} ${
              component.section || ""
            } (${component.duration || ""})`;

            const courseObject = {
              string: courseStr,
              code: component.courseCode,
              section: component.section || "",
              duration: component.duration || "",
              startDate: component.startDate || "",
              endDate: component.endDate || "",
            };

            courses.push(courseObject);
            addedCourseCodes.add(component.courseCode);
          }
        }
      });
    }

    return courses.filter(Boolean);
  } catch (error) {
    return [];
  }
};

// Utility function for sorting by bracket content
export const sortByBracketContent = (arr) => {
  return arr.sort((a, b) => {
    const indexA = a.indexOf("(");
    const indexB = b.indexOf("(");

    const substringA = a.slice(indexA);
    const substringB = b.slice(indexB);

    return substringA.localeCompare(substringB);
  });
};
