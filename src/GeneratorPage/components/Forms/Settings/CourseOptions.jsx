import TimeTableSelectComponent from "../CourseSearch/TimeTableSelectComponent";
import TermSelectComponent from "../CourseSearch/TermSelectComponent";
import CourseSearchComponent from "../CourseSearch/CourseSearchComponent";
import AddButtonComponent from "../CourseSearch/AddButtonComponent";
import BorderBox from "../../UI/BorderBox";

export default function CourseOptions({
  term,
  timetableType,
  courseOptions,
  courseInputValue,
  handleTableChange,
  handleTermChange,
  handleCourseCodeChange,
  addCourse,
  setCourseInputValue,
}) {
  return (
    <BorderBox title="Course Options">
      <div className="space-y-4">
        <TimeTableSelectComponent onTableChange={handleTableChange} />
        <TermSelectComponent onTermChange={handleTermChange} />
        <CourseSearchComponent
          onCourseCodeChange={handleCourseCodeChange}
          courseOptions={courseOptions}
          timetableType={timetableType}
          term={term}
          onEnterPress={addCourse}
          inputValue={courseInputValue}
          setInputValue={setCourseInputValue}
        />
        <AddButtonComponent onAddCourse={addCourse} />
      </div>
    </BorderBox>
  );
}
