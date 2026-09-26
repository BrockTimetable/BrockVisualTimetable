import PropTypes from "prop-types";
import CourseList from "./CourseList/CourseList";
import ExportOptions from "./Settings/ExportOptions";
import { removeAddedCourse } from "@/lib/generator/courseActions";

export default function InputFormBottomComponent({
  addedCourses,
  setAddedCourses,
  setTimetables,
  timetables,
  durations,
  sortOption,
  showCourses = true,
  showExportOptions = true,
  onShareComplete,
  onExportComplete,
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
      {showCourses && addedCourses.length > 0 && (
        <CourseList
          addedCourses={addedCourses}
          removeCourse={handleRemoveCourse}
          setAddedCourses={setAddedCourses}
        />
      )}
      {showExportOptions && addedCourses.length > 0 && (
        <ExportOptions
          timetables={timetables}
          durations={durations}
          onShareComplete={onShareComplete}
          onExportComplete={onExportComplete}
        />
      )}
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
  showCourses: PropTypes.bool,
  showExportOptions: PropTypes.bool,
  onShareComplete: PropTypes.func,
  onExportComplete: PropTypes.func,
};
