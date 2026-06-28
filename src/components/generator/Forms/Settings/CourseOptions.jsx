import PropTypes from "prop-types";
import TimeTableSelectComponent from "../CourseSearch/TimeTableSelectComponent";
import TermSelectComponent from "../CourseSearch/TermSelectComponent";
import CourseSearchComponent from "../CourseSearch/CourseSearchComponent";
import BorderBox from "../../UI/BorderBox";

export default function CourseOptions({
  term,
  timetableType,
  courseOptions,
  courseValue,
  handleTableChange,
  handleTermChange,
  handleCourseCodeChange,
  setCourseValue,
  addCourse,
}) {
  return (
    <BorderBox title="Course Options">
      <div className="space-y-3">
        <TimeTableSelectComponent
          timetable={timetableType}
          onTableChange={handleTableChange}
        />
        <TermSelectComponent term={term} onTermChange={handleTermChange} />
        <CourseSearchComponent
          onCourseCodeChange={handleCourseCodeChange}
          courseOptions={courseOptions}
          onEnterPress={addCourse}
          value={courseValue}
          setValue={setCourseValue}
        />
      </div>
    </BorderBox>
  );
}

CourseOptions.propTypes = {
  term: PropTypes.string.isRequired,
  timetableType: PropTypes.string.isRequired,
  courseOptions: PropTypes.array.isRequired,
  courseValue: PropTypes.string.isRequired,
  handleTableChange: PropTypes.func.isRequired,
  handleTermChange: PropTypes.func.isRequired,
  handleCourseCodeChange: PropTypes.func.isRequired,
  setCourseValue: PropTypes.func.isRequired,
  addCourse: PropTypes.func.isRequired,
};
