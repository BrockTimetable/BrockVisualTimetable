// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useScheduleWebMcp } from "../useScheduleWebMcp";

const setters = {
  setTimetables: vi.fn(),
  setAddedCourses: vi.fn(),
  setTimetableType: vi.fn(),
  setTerm: vi.fn(),
  setSelectedDuration: vi.fn(),
  setDurations: vi.fn(),
  setCurrentTimetableIndex: vi.fn(),
  onTimeBlockChange: vi.fn(),
};

function Harness() {
  useScheduleWebMcp({
    timetables: [],
    addedCourses: [],
    timetableType: "UG",
    term: "FW",
    sortOption: "default",
    courseColors: {},
    ...setters,
  });
  return null;
}

afterEach(() => {
  delete document.modelContext;
  vi.clearAllMocks();
});

describe("useScheduleWebMcp", () => {
  it("registers the complete schedule-management tool surface when WebMCP is available", async () => {
    const registerTool = vi.fn(() => Promise.resolve());
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: { registerTool },
    });

    const { unmount } = render(<Harness />);
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(15));

    expect(
      registerTool.mock.calls.map(([definition]) => definition.name),
    ).toEqual([
      "searchCourses",
      "createSchedule",
      "addCourses",
      "previewCourseAddition",
      "removeCourses",
      "setSchedulePreferences",
      "setUnavailableTimes",
      "pinSections",
      "unpinSections",
      "searchScheduleOptions",
      "getScheduleOptionDetails",
      "compareScheduleOptions",
      "selectScheduleOption",
      "getCurrentSchedule",
      "exportSchedule",
    ]);

    unmount();
    expect(
      registerTool.mock.calls.every(([, options]) => options.signal.aborted),
    ).toBe(true);
  });
});
