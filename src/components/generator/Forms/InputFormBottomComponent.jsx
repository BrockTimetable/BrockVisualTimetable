import CourseList from "./CourseList/CourseList";
import PerformanceMetrics from "./Settings/PerformanceMetrics";
import ExportOptions from "./Settings/ExportOptions";
import { removeCourseData } from "@/lib/generator/courseData";
import { removePinnedComponent } from "@/lib/generator/pinnedComponents";

export default function InputFormBottomComponent({
  addedCourses,
  setAddedCourses,
  setTimetables,
  timetables,
  durations,
  sortOption,
  generateTimetables,
  getValidTimetables,
}) {
  const handleRemoveCourse = (course) => {
    const cleanCourseCode = course.split(" ").slice(0, 2).join("");
    setAddedCourses(addedCourses.filter((c) => c !== course));
    removeCourseData(cleanCourseCode);
    removePinnedComponent(
      `${cleanCourseCode} DURATION ${course.split(" ")[2].substring(1)}`,
    );
    generateTimetables(sortOption);
    setTimetables(getValidTimetables());
  };

  return (
    <div className="space-y-4">
      <CourseList
        addedCourses={addedCourses}
        removeCourse={handleRemoveCourse}
        setTimetables={setTimetables}
        sortOption={sortOption}
      />
      {/* <Tips /> */}
      {process.env.NODE_ENV === "development" && <PerformanceMetrics />}
      <ExportOptions timetables={timetables} durations={durations} />
    </div>
  );
}
