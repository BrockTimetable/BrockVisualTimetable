import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateTimetables, getValidTimetables } from "../timetableGeneration";
import {
  storeCourseData,
  clearAllCourseData,
} from "@/lib/generator/courseData";
import coscData from "./__mocks__/COSC1P02.json";
import expectedTimetables from "./__expected__/basicGenerationTest.json";

vi.mock("@/lib/generator/timeSlots", () => ({
  getTimeSlots: () => ({
    M: Array(28).fill(false),
    T: Array(28).fill(false),
    W: Array(28).fill(false),
    R: Array(28).fill(false),
    F: Array(28).fill(false),
  }),
}));

vi.mock("@/lib/generator/pinnedComponents", () => ({
  getPinnedComponents: () => ["COSC1P02 DURATION 2"],
}));

describe("Basic COSC-1P02 Timetable Generation Test", () => {
  beforeEach(() => {
    clearAllCourseData();
    storeCourseData(coscData);
  });

  it("matches the expected timetable output", () => {
    generateTimetables("default");
    const actual = getValidTimetables();

    expect(actual).toEqual(expectedTimetables);
  });
});
