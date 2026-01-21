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
        <TimeTableSelectComponent onTableChange={handleTableChange} />
        <TermSelectComponent onTermChange={handleTermChange} />
        <CourseSearchComponent
          onCourseCodeChange={handleCourseCodeChange}
          courseOptions={courseOptions}
          timetableType={timetableType}
          term={term}
          onEnterPress={addCourse}
          value={courseValue}
          setValue={setCourseValue}
        />
      </div>
    </BorderBox>
  );
}
