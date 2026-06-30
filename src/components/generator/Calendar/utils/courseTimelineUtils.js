import { getCourseData } from "@/lib/generator/courseData";
import { getPinnedComponents } from "@/lib/generator/pinnedComponents";

const getCourseCodeFromLabel = (label) =>
  label.trim().split(/\s+/).slice(0, 2).join("");

export const sortCoursesByAddedOrder = (courses, addedCourseLabels = []) => {
  if (!addedCourseLabels.length || !courses.length) {
    return courses;
  }

  const orderByCode = new Map();
  addedCourseLabels.forEach((label, index) => {
    const code = getCourseCodeFromLabel(label);
    if (!orderByCode.has(code)) {
      orderByCode.set(code, index);
    }
  });

  return [...courses].sort((a, b) => {
    const orderA = orderByCode.get(a.code) ?? Number.MAX_SAFE_INTEGER;
    const orderB = orderByCode.get(b.code) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
};

export const prepareCoursesForTimeline = (
  timetables,
  currentTimetableIndex,
  addedCourseLabels = [],
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
    const pinnedComponents = getPinnedComponents();

    const pinnedDurations = {};

    pinnedComponents.forEach((pin) => {
      if (pin.includes("DURATION")) {
        const parts = pin.split(" ");
        const courseCode = parts[0];
        const duration = parts[2];
        pinnedDurations[courseCode] = duration;
      }
    });

    if (coursesData && Object.keys(coursesData).length > 0) {
      for (const key of Object.keys(coursesData)) {
        const course = coursesData[key];

        if (course.sections && course.sections.length > 0) {
          const processedOfferings = new Set();

          course.sections.forEach((section) => {
            if (section.schedule) {
              const duration = section.schedule.duration || "";
              const startDate = section.schedule.startDate || "";
              const endDate = section.schedule.endDate || "";
              const sectionNum = section.sectionNumber || "";
              const code = course.courseCode;

              if (pinnedDurations[code] && pinnedDurations[code] !== duration) {
                return;
              }

              const offeringKey = `${code}-${duration}-${startDate}-${endDate}`;

              if (
                !processedOfferings.has(offeringKey) &&
                (startDate || endDate)
              ) {
                const courseStr = `${code} ${sectionNum} (${duration})`;

                const courseObject = {
                  string: courseStr,
                  code: code,
                  section: sectionNum,
                  duration: duration,
                  startDate: startDate,
                  endDate: endDate,
                };

                courses.push(courseObject);
                processedOfferings.add(offeringKey);
              }
            }
          });
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

    return sortCoursesByAddedOrder(courses.filter(Boolean), addedCourseLabels);
  } catch (error) {
    return [];
  }
};
