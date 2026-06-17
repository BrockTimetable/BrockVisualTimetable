/* @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import InputFormTop from "../InputFormTopComponent";
import InputFormBottom from "../InputFormBottomComponent";
import CourseSearchComponent from "../CourseSearch/CourseSearchComponent";
import ExportCalendarButton from "../../Export/ExportCalendarButton";

const mocks = vi.hoisted(() => ({
  enqueueSnackbar: vi.fn(),
  getCourse: vi.fn(),
  getNameList: vi.fn(),
  storeCourseData: vi.fn(),
  removeCourseData: vi.fn(),
  generateTimetables: vi.fn(),
  getValidTimetables: vi.fn(),
  getGenerationPerformance: vi.fn(),
  addPinnedComponent: vi.fn(),
  removePinnedComponent: vi.fn(),
  exportCal: vi.fn(),
  trackCourseAddResult: vi.fn(),
  trackScheduleGenerated: vi.fn(),
}));

vi.mock("notistack", () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mocks.enqueueSnackbar,
  }),
}));

vi.mock("@/lib/generator/fetchData", () => ({
  getCourse: mocks.getCourse,
  getNameList: mocks.getNameList,
}));

vi.mock("@/lib/generator/courseData", () => ({
  storeCourseData: mocks.storeCourseData,
  removeCourseData: mocks.removeCourseData,
}));

vi.mock("@/lib/generator/timetableGeneration/timetableGeneration", () => ({
  generateTimetables: mocks.generateTimetables,
  getValidTimetables: mocks.getValidTimetables,
  getGenerationPerformance: mocks.getGenerationPerformance,
}));

vi.mock("@/lib/generator/pinnedComponents", () => ({
  addPinnedComponent: mocks.addPinnedComponent,
  removePinnedComponent: mocks.removePinnedComponent,
}));

vi.mock("@/lib/generator/ExportCal.js", () => ({
  exportCal: mocks.exportCal,
}));

vi.mock("@/lib/metrics", () => ({
  trackCourseAddResult: mocks.trackCourseAddResult,
  trackScheduleGenerated: mocks.trackScheduleGenerated,
}));

vi.mock("../Settings/CourseOptions", async () => {
  const React = await import("react");

  return {
    default: function MockCourseOptions({ addCourse }) {
      return React.createElement(
        "button",
        {
          type: "button",
          onClick: () => addCourse("COSC 1P02 D2"),
        },
        "Add COSC 1P02 D2",
      );
    },
  };
});

vi.mock("../Settings/SortOptions", async () => {
  const React = await import("react");

  return {
    default: function MockSortOptions({ handleSortChange }) {
      return React.createElement(
        "button",
        {
          type: "button",
          onClick: () => handleSortChange("minimizeClassDays"),
        },
        "Minimize class days",
      );
    },
  };
});

vi.mock("../CourseList/CourseList", async () => {
  const React = await import("react");

  return {
    default: function MockCourseList({ removeCourse }) {
      return React.createElement(
        "button",
        {
          type: "button",
          onClick: () => removeCourse("COSC 1P02 D2"),
        },
        "Remove COSC 1P02 D2",
      );
    },
  };
});

vi.mock("../Settings/ExportOptions", async () => {
  const React = await import("react");

  return {
    default: function MockExportOptions() {
      return React.createElement("div", null, "Export options");
    },
  };
});

const courseData = {
  courseCode: "COSC1P02",
  courseName: "Introduction to Computer Science",
  sections: [
    {
      id: "3591102",
      sectionNumber: "1",
      schedule: {
        duration: "2",
        startDate: 1725321600,
        endDate: 1732924800,
      },
    },
  ],
  labs: [],
  tutorials: [],
  seminars: [],
};

const generatedTimetables = [{ courses: [{ courseCode: "COSC1P02" }] }];
const duration = "1725321600-1732924800-2";

describe("generator feature interactions", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    window.ResizeObserver = ResizeObserver;
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getNameList.mockResolvedValue([]);
    mocks.getCourse.mockResolvedValue(courseData);
    mocks.getValidTimetables.mockReturnValue(generatedTimetables);
    mocks.getGenerationPerformance.mockReturnValue({
      generationStartTime: 0,
      generationEndTime: 0,
      totalCombinationsProcessed: 0,
      validTimetablesFound: 0,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("adds a searched course, pins its duration, and generates timetables", async () => {
    const setTimetables = vi.fn();
    const setSelectedDuration = vi.fn();
    const setDurations = vi.fn((update) => update([]));
    const setSortOption = vi.fn();
    const setAddedCourses = vi.fn();

    render(
      <InputFormTop
        setTimetables={setTimetables}
        setSelectedDuration={setSelectedDuration}
        setDurations={setDurations}
        setSortOption={setSortOption}
        addedCourses={[]}
        setAddedCourses={setAddedCourses}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Add COSC 1P02 D2" }),
    );

    await waitFor(() => {
      expect(mocks.storeCourseData).toHaveBeenCalledWith(courseData);
    });
    expect(setAddedCourses).toHaveBeenCalledWith(["COSC 1P02 D2"]);
    expect(mocks.addPinnedComponent).toHaveBeenCalledWith(
      "COSC1P02 DURATION 2",
    );
    expect(mocks.generateTimetables).toHaveBeenCalledWith("default");
    expect(setTimetables).toHaveBeenCalledWith(generatedTimetables);
    expect(setSelectedDuration).toHaveBeenCalledWith(duration);
  });

  it("removes a course and regenerates the timetable results", async () => {
    const setAddedCourses = vi.fn();
    const setTimetables = vi.fn();
    const generateTimetables = vi.fn();
    const getValidTimetables = vi.fn(() => generatedTimetables);

    render(
      <InputFormBottom
        addedCourses={["COSC 1P02 D2"]}
        setAddedCourses={setAddedCourses}
        setTimetables={setTimetables}
        timetables={generatedTimetables}
        durations={[duration]}
        sortOption="default"
        generateTimetables={generateTimetables}
        getValidTimetables={getValidTimetables}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Remove COSC 1P02 D2" }),
    );

    expect(setAddedCourses).toHaveBeenCalledWith([]);
    expect(mocks.removeCourseData).toHaveBeenCalledWith("COSC1P02");
    expect(mocks.removePinnedComponent).toHaveBeenCalledWith(
      "COSC1P02 DURATION 2",
    );
    expect(generateTimetables).toHaveBeenCalledWith("default");
    expect(setTimetables).toHaveBeenCalledWith(generatedTimetables);
  });

  it("regenerates results when the user changes the sort option", async () => {
    const setTimetables = vi.fn();
    const setSortOption = vi.fn();

    render(
      <InputFormTop
        setTimetables={setTimetables}
        setSelectedDuration={vi.fn()}
        setDurations={vi.fn()}
        setSortOption={setSortOption}
        addedCourses={[]}
        setAddedCourses={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Minimize class days" }),
    );

    expect(setSortOption).toHaveBeenCalledWith("minimizeClassDays");
    expect(mocks.generateTimetables).toHaveBeenCalledWith("minimizeClassDays");
    expect(setTimetables).toHaveBeenCalledWith(generatedTimetables);
  });

  it("searches course options and selects the first match with Enter", async () => {
    const onCourseCodeChange = vi.fn();
    const onEnterPress = vi.fn();

    function SearchHarness() {
      const [value, setValue] = React.useState("");

      return (
        <CourseSearchComponent
          onCourseCodeChange={onCourseCodeChange}
          courseOptions={[
            {
              label: "DATA 1P98 D2",
              courseCode: "DATA1P98",
              duration: "2",
              courseName: "Practical Data Analysis",
            },
          ]}
          onEnterPress={onEnterPress}
          value={value}
          setValue={setValue}
        />
      );
    }

    render(<SearchHarness />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.type(
      await screen.findByPlaceholderText("Search courses..."),
      "data",
    );
    await userEvent.keyboard("{Enter}");

    expect(onCourseCodeChange).toHaveBeenLastCalledWith(null, "DATA 1P98 D2");
    expect(onEnterPress).toHaveBeenCalledWith("DATA 1P98 D2");
  });

  it("exports the current calendar when there is a single timetable variant", async () => {
    render(
      <ExportCalendarButton
        timetables={generatedTimetables}
        durations={[duration]}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Export Calendar" }),
    );

    expect(mocks.exportCal).toHaveBeenCalledWith({ durationCount: 1 });
  });
});
