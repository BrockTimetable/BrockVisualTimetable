import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateTimetables, getValidTimetables } from "../timetableGeneration";
import { storeCourseData, clearAllCourseData } from "../../courseData";
import cosc1p02Data from "./__mocks__/COSC1P02.json";
import cosc1p50Data from "./__mocks__/COSC1P50.json";
import biol2p02Data from "./__mocks__/BIOL2P02.json";
import hist4p29Data from "./__mocks__/HIST4P29.json";
import expectedTimetables from "./__expected__/complexGenerationTest.json";

vi.mock("../../timeSlots", () => ({
  getTimeSlots: () => ({
    M: Array(28).fill(false),
    T: Array(28).fill(false),
    W: [
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
      true,
      true,
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
    ],
    F: Array(28).fill(false),
    S: Array(28).fill(false),
    U: Array(28).fill(false),
  }),
}));

vi.mock("../../pinnedComponents", () => ({
  getPinnedComponents: () => [
    "BIOL2P02 DURATION 2",
    "HIST4P29 DURATION 2",
    "COSC1P02 DURATION 2",
    "COSC1P50 DURATION 2",
    "COSC1P50 SEM 2422204",
  ],
}));

describe("Complex Timetable Generation Test", () => {
  beforeEach(() => {
    clearAllCourseData();
    storeCourseData(biol2p02Data);
    storeCourseData(hist4p29Data);
    storeCourseData(cosc1p02Data);
    storeCourseData(cosc1p50Data);
  });

  it("matches the expected timetable output", () => {
    generateTimetables("default");
    const actual = getValidTimetables();

    expect(actual).toEqual(expectedTimetables);
  });
});
