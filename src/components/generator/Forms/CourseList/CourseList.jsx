import PropTypes from "prop-types";
import CourseListComponent from "./CourseListComponent";
import BorderBox from "../../UI/BorderBox";

export default function CourseList({
  addedCourses,
  removeCourse,
  setAddedCourses,
}) {
  return (
    <BorderBox title="Course List">
      <CourseListComponent
        courses={addedCourses}
        onRemoveCourse={removeCourse}
        setAddedCourses={setAddedCourses}
      />
    </BorderBox>
  );
}

CourseList.propTypes = {
  addedCourses: PropTypes.arrayOf(PropTypes.string).isRequired,
  removeCourse: PropTypes.func.isRequired,
  setAddedCourses: PropTypes.func.isRequired,
};
