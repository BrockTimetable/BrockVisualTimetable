import { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { ChevronDown, Palette, Trash2 } from "lucide-react";
import { CourseColorsContext } from "@/lib/contexts/generator/CourseColorsContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const formatCourseDate = (dateString, subtractDay = false) => {
  if (!dateString) return "N/A";

  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return "N/A";

  const date = new Date(year, month - 1, day - Number(subtractDay));
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function CourseListItemComponent({
  course,
  courseDetail,
  removeCourse,
  dragHandle = null,
  open = false,
  onOpenChange,
  isDragOverlay = false,
}) {
  const {
    courseColors,
    updateCourseColor,
    getDefaultColorForCourse,
    initializeCourseColor,
  } = useContext(CourseColorsContext);
  const courseCode = course.split(" ")[0] + course.split(" ")[1];

  useEffect(() => {
    if (!courseColors[courseCode]) initializeCourseColor(courseCode);
  }, [courseCode, courseColors, initializeCourseColor]);

  const currentColor =
    courseColors[courseCode] || getDefaultColorForCourse(courseCode);
  const courseDates = courseDetail?.startDate
    ? `${formatCourseDate(courseDetail.startDate)} – ${formatCourseDate(courseDetail.endDate, true)}`
    : "N/A";

  return (
    <Card
      className={cn(
        "workspace-course-row overflow-hidden rounded-lg border-border/70 bg-transparent shadow-none transition-colors hover:bg-muted/25",
        isDragOverlay && "shadow-lg ring-1 ring-ring/30",
      )}
    >
      <div className="flex items-stretch">
        {dragHandle}
        <Collapsible
          open={open}
          onOpenChange={onOpenChange}
          className="min-w-0 flex-1"
        >
          <div className="flex min-w-0 items-center gap-2 px-2.5 py-2">
            <div
              className={cn(
                "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/80",
                isDragOverlay
                  ? "pointer-events-none"
                  : "cursor-pointer hover:opacity-80",
              )}
              style={{ backgroundColor: currentColor }}
            >
              <Palette className="h-3 w-3 text-white" />
              {!isDragOverlay && (
                <input
                  type="color"
                  value={currentColor}
                  onChange={(event) =>
                    updateCourseColor(courseCode, event.target.value)
                  }
                  onInput={(event) =>
                    updateCourseColor(courseCode, event.target.value)
                  }
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={`Pick color for ${course}`}
                />
              )}
            </div>
            <CollapsibleTrigger asChild disabled={isDragOverlay}>
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                aria-label={`${open ? "Collapse" : "Expand"} details for ${course}`}
              >
                <span className="min-w-0 flex-1">
                  <span
                    className="workspace-card-title block whitespace-normal break-words"
                    title={course}
                  >
                    {course}
                  </span>
                  {courseDetail?.courseName && (
                    <span
                      className="workspace-body block whitespace-normal break-words text-muted-foreground"
                      title={courseDetail.courseName}
                    >
                      {courseDetail.courseName}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={isDragOverlay}
              onClick={() => removeCourse(course)}
              aria-label={`Remove ${course}`}
            >
              <Trash2 />
            </Button>
          </div>
          <CollapsibleContent className="border-t border-border/60 px-3 py-2.5">
            <dl className="workspace-body grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-2">
              <dt className="text-muted-foreground">Instructor</dt>
              <dd className="min-w-0 whitespace-normal break-words text-foreground">
                {courseDetail?.instructor || "N/A"}
              </dd>
              <dt className="text-muted-foreground">Section</dt>
              <dd className="min-w-0 whitespace-normal break-words text-foreground">
                {courseDetail?.section || "N/A"}
              </dd>
              <dt className="text-muted-foreground">Dates</dt>
              <dd className="min-w-0 whitespace-normal break-words text-foreground">
                {courseDates}
              </dd>
            </dl>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}

CourseListItemComponent.propTypes = {
  course: PropTypes.string.isRequired,
  courseDetail: PropTypes.shape({
    courseName: PropTypes.string,
    instructor: PropTypes.string,
    section: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  removeCourse: PropTypes.func.isRequired,
  dragHandle: PropTypes.node,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  isDragOverlay: PropTypes.bool,
};
