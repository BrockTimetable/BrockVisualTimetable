import PropTypes from "prop-types";
import CourseList from "./CourseList/CourseList";
import PerformanceMetrics from "./Settings/PerformanceMetrics";
import ExportOptions from "./Settings/ExportOptions";
import Tips from "./Settings/Tips";
import { removeAddedCourse } from "@/lib/generator/courseActions";

export default function InputFormBottomComponent({
  addedCourses,
  setAddedCourses,
  setTimetables,
  timetables,
  durations,
  sortOption,
}) {
  const handleRemoveCourse = (course) => {
    removeAddedCourse(course, {
      addedCourses,
      setAddedCourses,
      setTimetables,
      sortOption,
    });
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
};
