import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAllCourseData,
  storeCourseData,
} from "@/lib/generator/courseData";
import { clearAllPins } from "@/lib/generator/pinnedComponents";
import { reinitializeTimeSlots } from "@/lib/generator/timeSlots";
import {
  generateTimetables,
  getValidTimetables,
  previewTimetables,
} from "../timetableGeneration";
import coscData from "./__mocks__/COSC1P02.json";
import biolData from "./__mocks__/BIOL2P02.json";

describe("previewTimetables", () => {
  beforeEach(() => {
    clearAllCourseData();
    clearAllPins();
    reinitializeTimeSlots();
    storeCourseData(coscData);
  });

  it("returns a what-if result without replacing the current timetable results", () => {
    generateTimetables("default");
    const currentResults = getValidTimetables();

    expect(previewTimetables([biolData])).not.toHaveLength(0);
    expect(getValidTimetables()).toBe(currentResults);
  });
});
