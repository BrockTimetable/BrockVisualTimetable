import { removeCourseData } from "@/lib/generator/courseData";
import { removePinnedComponent } from "@/lib/generator/pinnedComponents";
import {
  generateTimetables,
  getValidTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";

/**
 * Removes an added course (by its display label, e.g. "COSC 1P02 D2"), clears
 * its pinned duration, regenerates timetables and pushes the fresh results.
 * Shared by the course list and the conflict dialog so removal behaves
 * identically wherever it is triggered.
 */
export const removeAddedCourse = (
  courseLabel,
  { addedCourses, setAddedCourses, setTimetables, sortOption },
) => {
  const cleanCourseCode = courseLabel.split(" ").slice(0, 2).join("");
  setAddedCourses(addedCourses.filter((c) => c !== courseLabel));
  removeCourseData(cleanCourseCode);
  removePinnedComponent(
    `${cleanCourseCode} DURATION ${courseLabel.split(" ")[2].substring(1)}`,
  );
  generateTimetables(sortOption);
  setTimetables(getValidTimetables());
};

/**
 * Finds the added-course label (e.g. "COSC 1P02 D2") that corresponds to a bare
 * course code (e.g. "COSC1P02"). Returns undefined if not present.
 */
export const findCourseLabelByCode = (addedCourses, courseCode) =>
  addedCourses.find(
    (label) => label.split(" ").slice(0, 2).join("") === courseCode,
  );
