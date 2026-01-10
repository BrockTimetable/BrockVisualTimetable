import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateTimetables, getValidTimetables } from "../timetableGeneration";
import {
  storeCourseData,
  clearAllCourseData,
} from "@/lib/generator/courseData";
import coscData from "./__mocks__/COSC1P02.json";
import expectedTimetables from "./__expected__/timeBlockTest.json";

vi.mock("@/lib/generator/timeSlots", () => ({
  getTimeSlots: () => ({
    M: Array(28).fill(false),
    T: [
      false,
      false,
      false,
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    W: [
      false,
      false,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      true,
      true,
      true,
      true,
    ],
    R: [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    F: Array(28).fill(false),
    S: Array(28).fill(false),
    U: Array(28).fill(false),
  }),
}));

vi.mock("@/lib/generator/pinnedComponents", () => ({
  getPinnedComponents: () => ["COSC1P02 DURATION 2"],
}));

describe("COSC-1P02 Timetable Generation Test (All Labs Blocked Except Lab 7", () => {
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
