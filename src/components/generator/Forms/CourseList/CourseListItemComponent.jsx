import React, { useContext, useEffect } from "react";
import { ChevronDown, ChevronUp, Palette, Trash2 } from "lucide-react";
import { CourseColorsContext } from "@/lib/contexts/generator/CourseColorsContext";
import { clearCoursePins } from "@/lib/generator/pinnedComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

export default function CourseListComponent({
  course,
  courseDetail,
  removeCourse,
}) {
  const [open, setOpen] = React.useState(false);
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
  }, [courseCode]);

  const handleRemoveClick = () => {
    setOpen(false);
    removeCourse(course);
    clearCoursePins(course.split(" ")[0] + course.split(" ")[1]);
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
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="transition-none hover:bg-muted/40">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer flex flex-row items-center justify-between space-y-0 py-3">
            <CardTitle className="text-base font-normal uppercase">
              {course}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div
                className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border hover:opacity-80"
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: currentColor }}
              >
                <Palette className="h-4 w-4 text-background" />
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
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="transition-none"
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveClick();
                }}
                aria-label={`Remove ${course}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {open ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <CardContent className="pt-0">
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-start justify-between">
                <span>Course Instructor</span>
                <span className="text-foreground">
                  {courseDetail ? courseDetail.instructor : "N/A"}
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
      </Card>
    </Collapsible>
  );
}
