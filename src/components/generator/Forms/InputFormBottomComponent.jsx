import PropTypes from "prop-types";
import CourseList from "./CourseList/CourseList";
import PerformanceMetrics from "./Settings/PerformanceMetrics";
import ExportOptions from "./Settings/ExportOptions";
import Tips from "./Settings/Tips";
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
      <Tips />
      {import.meta.env.DEV && <PerformanceMetrics />}
      <ExportOptions timetables={timetables} durations={durations} />
    </div>
  );
}

InputFormBottomComponent.propTypes = {
  addedCourses: PropTypes.arrayOf(PropTypes.string).isRequired,
  setAddedCourses: PropTypes.func.isRequired,
  setTimetables: PropTypes.func.isRequired,
  timetables: PropTypes.array.isRequired,
  durations: PropTypes.arrayOf(PropTypes.string).isRequired,
  sortOption: PropTypes.string.isRequired,
  generateTimetables: PropTypes.func.isRequired,
  getValidTimetables: PropTypes.func.isRequired,
};
