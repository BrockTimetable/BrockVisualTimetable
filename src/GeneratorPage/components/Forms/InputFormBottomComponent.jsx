import CourseList from "./CourseList/CourseList";
import SourceCode from "../UI/SourceCode";
import PerformanceMetrics from "./Settings/PerformanceMetrics";
import Tips from "./Settings/Tips";
import ExportOptions from "./Settings/ExportOptions";
import { removeCourseData } from "../../scripts/courseData";
import { clearCoursePins } from "../../scripts/pinnedComponents";

export default function InputFormBottomComponent({
  addedCourses,
  setAddedCourses,
  setTimetables,
  sortOption,
  generateTimetables,
  getValidTimetables,
}) {
  const isDev = import.meta.env.DEV;

  const handleRemoveCourse = (course) => {
    const cleanCourseCode = course.split(" ").slice(0, 2).join("");
    setAddedCourses(addedCourses.filter((c) => c !== course));
    removeCourseData(cleanCourseCode);
    clearCoursePins(cleanCourseCode);
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
      <Tips />
      {isDev && <PerformanceMetrics />}
      <ExportOptions />
      <SourceCode />
    </div>
  );
}
