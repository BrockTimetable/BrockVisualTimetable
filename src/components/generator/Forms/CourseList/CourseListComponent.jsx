import { useContext } from "react";
import CourseListItemComponent from "./CourseListItemComponent";
import { CourseDetailsContext } from "@/lib/contexts/generator/CourseDetailsContext";

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
    <div className="space-y-3">
      {courses.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No courses added
        </p>
      )}
      {courses.map((course) => (
        <CourseListItemComponent
          course={course}
          courseDetail={getCourseDetail(course)}
          removeCourse={onRemoveCourse}
          setTimetables={setTimetables}
          sortOption={sortOption}
          key={course}
        />
      ))}
    </div>
  );
}
