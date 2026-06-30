import { useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";
import { GripVertical } from "lucide-react";
import CourseListItemComponent from "./CourseListItemComponent";
import { CourseDetailsContext } from "@/lib/contexts/generator/CourseDetailsContext";
import { reorderAddedCourses } from "@/lib/generator/courseActions";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/components/ui/sortable";

function CourseDragHandle({ course }) {
  return (
    <SortableItemHandle
      className="flex w-11 shrink-0 self-stretch touch-none items-center justify-center rounded-l-lg text-muted-foreground active:bg-muted hover:bg-muted hover:text-foreground sm:w-7"
      aria-label={`Drag to reorder ${course}`}
    >
      <GripVertical className="h-4 w-4" />
    </SortableItemHandle>
  );
}

CourseDragHandle.propTypes = {
  course: PropTypes.string.isRequired,
};

export default function CourseListComponent({
  courses = [],
  onRemoveCourse,
  setAddedCourses,
}) {
  const { courseDetails } = useContext(CourseDetailsContext);
  const [expandedByCourse, setExpandedByCourse] = useState({});

  const getCourseDetail = useCallback(
    (course) => {
      const courseName = course.split(" ").slice(0, 2).join("").toUpperCase();
      return courseDetails.find((detail) => detail.name === courseName);
    },
    [courseDetails],
  );

  const handleValueChange = useCallback(
    (nextCourses) => {
      reorderAddedCourses(nextCourses, { setAddedCourses });
    },
    [setAddedCourses],
  );

  const handleOpenChange = useCallback((course, open) => {
    setExpandedByCourse((prev) => ({ ...prev, [course]: open }));
  }, []);

  if (courses.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No courses added
      </p>
    );
  }

  return (
    <Sortable value={courses} onValueChange={handleValueChange}>
      <SortableContent className="space-y-3">
        {courses.map((course) => (
          <SortableItem
            key={course}
            value={course}
            asChild
            className="data-[dragging]:pointer-events-none data-[dragging]:!opacity-0"
          >
            <div>
              <CourseListItemComponent
                course={course}
                courseDetail={getCourseDetail(course)}
                removeCourse={onRemoveCourse}
                open={expandedByCourse[course] ?? false}
                onOpenChange={(open) => handleOpenChange(course, open)}
                dragHandle={<CourseDragHandle course={course} />}
              />
            </div>
          </SortableItem>
        ))}
      </SortableContent>
      <SortableOverlay>
        {({ value }) => (
          <SortableItem value={value}>
            <CourseListItemComponent
              course={value}
              courseDetail={getCourseDetail(value)}
              removeCourse={() => {}}
              open={expandedByCourse[value] ?? false}
              isDragOverlay
              dragHandle={
                <div className="flex w-7 shrink-0 self-stretch cursor-grabbing items-center justify-center rounded-l-lg bg-muted/40 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
              }
            />
          </SortableItem>
        )}
      </SortableOverlay>
    </Sortable>
  );
}

CourseListComponent.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.string),
  onRemoveCourse: PropTypes.func.isRequired,
  setAddedCourses: PropTypes.func.isRequired,
};
