import { describe, expect, it } from "vitest";
import { sortCoursesByAddedOrder } from "../courseTimelineUtils";

describe("sortCoursesByAddedOrder", () => {
  const courses = [
    { code: "COSC1P02", section: "D2" },
    { code: "MATH1P66", section: "D1" },
    { code: "ABED4F85", section: "D3" },
  ];

  it("orders timeline courses to match the course list", () => {
    const ordered = sortCoursesByAddedOrder(courses, [
      "ABED 4F85 D3",
      "COSC 1P02 D2",
      "MATH 1P66 D1",
    ]);

    expect(ordered.map((course) => course.code)).toEqual([
      "ABED4F85",
      "COSC1P02",
      "MATH1P66",
    ]);
  });

  it("returns the original array when no course labels are provided", () => {
    expect(sortCoursesByAddedOrder(courses, [])).toEqual(courses);
  });
});
