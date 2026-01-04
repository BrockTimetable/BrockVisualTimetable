import { getCourseData } from "@/lib/generator/courseData";

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
