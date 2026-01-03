import { useContext, useState, useEffect } from "react";
import { ChevronDown, Trash2, Palette } from "lucide-react";
import { CourseColorsContext } from "../../../contexts/CourseColorsContext";
import { Button } from "../../../../components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../components/ui/collapsible";
import { Separator } from "../../../../components/ui/separator";

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
}) {
  const [open, setOpen] = useState(false);
  const {
    courseColors,
    updateCourseColor,
    assignDefaultColorForCourse,
    getPreviewColor,
  } = useContext(CourseColorsContext);
  const courseCode = course.split(" ")[0] + course.split(" ")[1];

  useEffect(() => {
    if (!courseColors[courseCode]) {
      assignDefaultColorForCourse(courseCode);
    }
  }, [courseCode, courseColors, assignDefaultColorForCourse]);

  const handleRemoveClick = () => {
    setOpen(false);
    removeCourse(course);
  };

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    if (newColor && newColor !== courseColors[courseCode]) {
      updateCourseColor(courseCode, newColor);
    }
  };

  // Get the current color, falling back to a safe preview color
  const currentColor = courseColors[courseCode] || getPreviewColor();

  return (
    <li>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="mb-2 overflow-hidden rounded-md border border-border">
          <div className="flex items-center justify-between bg-card px-3 py-2">
            <div className="text-sm font-semibold uppercase">{course}</div>
            <div className="flex items-center gap-2">
              <div
                className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-border"
                style={{ backgroundColor: currentColor }}
                onClick={(event) => event.stopPropagation()}
              >
                <Palette className="h-4 w-4 text-background" />
                <input
                  type="color"
                  value={currentColor}
                  onChange={handleColorChange}
                  onInput={handleColorChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete course"
                onClick={handleRemoveClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle details">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <div className="px-3 py-2 text-sm">
              <div className="py-2">
                <div className="text-xs text-muted-foreground">
                  Course Instructor
                </div>
                <div>{courseDetail ? courseDetail.instructor : "N/A"}</div>
              </div>
              <Separator />
              <div className="py-2">
                <div className="text-xs text-muted-foreground">
                  Section Number
                </div>
                <div>{courseDetail ? courseDetail.section : "N/A"}</div>
              </div>
              <Separator />
              <div className="py-2">
                <div className="text-xs text-muted-foreground">Start Date</div>
                <div>
                  {courseDetail
                    ? parseStartDate(courseDetail.startDate)
                    : "N/A"}
                </div>
              </div>
              <Separator />
              <div className="py-2">
                <div className="text-xs text-muted-foreground">End Date</div>
                <div>
                  {courseDetail ? parseEndDate(courseDetail.endDate) : "N/A"}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </li>
  );
}
