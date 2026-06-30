import { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { ChevronDown, ChevronUp, Palette, Trash2 } from "lucide-react";
import { CourseColorsContext } from "@/lib/contexts/generator/CourseColorsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Helper function to parse start dates (ISO format YYYY-MM-DD)
const parseStartDate = (dateStr) => {
  if (!dateStr) return "N/A";

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to parse end dates (ISO format YYYY-MM-DD, subtract 1 day since they're stored as exclusive end dates)
const parseEndDate = (dateStr) => {
  if (!dateStr) return "N/A";

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day - 1); // month is 0-indexed, subtract 1 day
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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
    if (!courseColors[courseCode]) {
      initializeCourseColor(courseCode);
    }
  }, [courseCode, courseColors, initializeCourseColor]);

  const handleRemoveClick = () => {
    onOpenChange?.(false);
    removeCourse(course);
  };

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    if (newColor && newColor !== courseColors[courseCode]) {
      updateCourseColor(courseCode, newColor);
    }
  };

  // Get the current color, falling back to the default color system
  const currentColor =
    courseColors[courseCode] || getDefaultColorForCourse(courseCode);

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card
        className={cn(
          "flex flex-row items-stretch overflow-hidden transition-none hover:bg-muted/40",
          isDragOverlay && "shadow-lg ring-1 ring-border",
        )}
      >
        {dragHandle}
        <div className="flex min-w-0 flex-1 flex-col">
          <CollapsibleTrigger asChild disabled={isDragOverlay}>
            <CardHeader className="flex min-w-0 flex-1 cursor-pointer flex-row items-center justify-between gap-2 space-y-0 px-2 py-2.5">
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base font-normal uppercase leading-snug">
                  {course}
                </CardTitle>
                {courseDetail?.courseName && (
                  <p className="truncate text-sm text-muted-foreground">
                    {courseDetail.courseName}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <div
                  className={cn(
                    "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border hover:opacity-80",
                    isDragOverlay ? "pointer-events-none" : "cursor-pointer",
                  )}
                  onClick={(e) => e.stopPropagation()}
                  style={{ backgroundColor: currentColor }}
                >
                  <Palette className="h-3.5 w-3.5 text-background" />
                  {!isDragOverlay && (
                    <input
                      type="color"
                      value={currentColor}
                      onChange={handleColorChange}
                      onInput={handleColorChange}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }}
                      aria-label={`Pick color for ${course}`}
                    />
                  )}
                </div>
                {isDragOverlay ? (
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground"
                    aria-hidden="true"
                  >
                    <Trash2 className="h-4 w-4" />
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 transition-none"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveClick();
                    }}
                    aria-label={`Remove ${course}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {open ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent
            className={cn(
              "overflow-hidden",
              !isDragOverlay &&
                "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
            )}
          >
            <CardContent className="px-3 pb-3 pt-0">
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-start justify-between gap-4">
                  <span>Course Name</span>
                  <span className="text-right text-foreground">
                    {courseDetail?.courseName || "N/A"}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span>Course Instructor</span>
                  <span className="text-foreground">
                    {courseDetail?.instructor || "N/A"}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span>Section Number</span>
                  <span className="text-foreground">
                    {courseDetail ? courseDetail.section : "N/A"}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span>Start Date</span>
                  <span className="text-foreground">
                    {courseDetail
                      ? parseStartDate(courseDetail.startDate)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span>End Date</span>
                  <span className="text-foreground">
                    {courseDetail ? parseEndDate(courseDetail.endDate) : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </div>
      </Card>
    </Collapsible>
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
