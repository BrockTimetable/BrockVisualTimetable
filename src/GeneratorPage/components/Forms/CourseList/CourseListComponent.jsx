import { useContext } from "react";
import CourseListItemComponent from "./CourseListItemComponent";
import { CourseDetailsContext } from "../../../contexts/CourseDetailsContext";

export default function CourseListComponent({
  courses = [],
  onRemoveCourse,
  setTimetables,
  sortOption,
}) {
  const { courseDetails } = useContext(CourseDetailsContext);

  const getCourseDetail = (course) => {
    const courseName = course.split(" ").slice(0, 2).join("").toUpperCase();
    return courseDetails.find((detail) => detail.name === courseName);
  };

  return (
    <div>
      {courses.length === 0 && (
        <div className="flex h-12 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          No courses added
        </div>
      )}
      {courses.length > 0 && (
        <ul aria-labelledby="nested-list-subheader" className="space-y-2">
          {courses.map((course) => (
            <CourseListItemComponent
              course={course}
              courseDetail={getCourseDetail(course)}
              removeCourse={onRemoveCourse}
              key={course}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
