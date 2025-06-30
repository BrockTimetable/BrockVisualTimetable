import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateTimetables, getValidTimetables } from "../timetableGeneration";
import { storeCourseData, clearAllCourseData } from "../../courseData";
import coscData from "./__mocks__/COSC1P02.json";
import expectedTimetables from "./__expected__/pinTest.json";

vi.mock("../../timeSlots", () => ({
  getTimeSlots: () => ({
    M: Array(28).fill(false),
    T: Array(28).fill(false),
    W: Array(28).fill(false),
    R: Array(28).fill(false),
    F: Array(28).fill(false),
  }),
}));

vi.mock("../../pinnedComponents", () => ({
  getPinnedComponents: () => ["COSC1P02 DURATION 2", "COSC1P02 LAB 2417405"],
}));

describe("COSC-1P02 Timetable Generation Test Lab 5 Pinned", () => {
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
