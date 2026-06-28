/* @vitest-environment jsdom */
import React from "react";
import PropTypes from "prop-types";
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
import CalendarComponent from "../CalendarComponent";
import { CourseDetailsContext } from "@/lib/contexts/generator/CourseDetailsContext";
import {
  CourseColorsContext,
  CourseColorsProvider,
} from "@/lib/contexts/generator/CourseColorsContext";
import {
  clearAllPins,
  getPinnedComponents,
} from "@/lib/generator/pinnedComponents";
import {
  getTimeBlockEvents,
  removeTimeBlockEvent,
} from "@/lib/generator/createCalendarEvents";

const mocks = vi.hoisted(() => ({
  enqueueSnackbar: vi.fn(),
}));

vi.mock("notistack", () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mocks.enqueueSnackbar,
  }),
}));

vi.mock("@/lib/generator/timetableGeneration/timetableGeneration", () => ({
  generateTimetables: vi.fn(),
  getValidTimetables: vi.fn(() => []),
}));

vi.mock("@fullcalendar/react", async () => {
  const React = await import("react");

  const MockFullCalendar = React.forwardRef(function MockFullCalendar(
    { events = [], eventClick, datesSet, select },
    ref,
  ) {
    React.useImperativeHandle(ref, () => ({
      getApi: () => ({
        gotoDate: vi.fn(),
      }),
    }));

    React.useEffect(() => {
      datesSet?.({
        start: new Date("2024-09-01T00:00:00"),
        end: new Date("2024-12-31T23:59:59"),
      });
    }, [datesSet]);

    return (
      <div aria-label="Calendar events">
        <button
          type="button"
          onClick={() =>
            select?.({
              startStr: "2024-09-06T14:00:00",
              endStr: "2024-09-06T16:00:00",
              jsEvent: { clientX: 120, clientY: 160 },
            })
          }
        >
          Block Friday afternoon
        </button>
        {events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={(jsEvent) =>
              eventClick?.({
                event,
                jsEvent,
                el: jsEvent.currentTarget,
              })
            }
          >
            {event.title.trim()}
          </button>
        ))}
      </div>
    );
  });

  MockFullCalendar.propTypes = {
    events: PropTypes.array,
    eventClick: PropTypes.func,
    datesSet: PropTypes.func,
    select: PropTypes.func,
  };

  return {
    default: MockFullCalendar,
  };
});

const timetable = {
  courses: [
    {
      courseCode: "COSC1P02",
      courseName: "Introduction to Computer Science",
      duration: "2",
      mainComponents: [
        {
          id: "3591102",
          type: "LEC",
          sectionNumber: "1",
          instructor: "Ada Lovelace",
          schedule: {
            days: "M W",
            time: "0900-1000",
            startDate: 1725321600,
            endDate: 1732924800,
          },
        },
      ],
      secondaryComponents: {
        lab: {
          id: "3591103",
          type: "LAB",
          sectionNumber: "5",
          instructor: "Grace Hopper",
          schedule: {
            days: "F",
            time: "1400-1600",
            startDate: 1725321600,
            endDate: 1732924800,
          },
        },
      },
    },
  ],
};

const duration = "1725321600-1732924800-2";

const alternateTimetable = {
  courses: [
    {
      ...timetable.courses[0],
      mainComponents: [
        {
          ...timetable.courses[0].mainComponents[0],
          id: "3592102",
          sectionNumber: "2",
          schedule: {
            ...timetable.courses[0].mainComponents[0].schedule,
            time: "1000-1100",
          },
        },
      ],
      secondaryComponents: {
        lab: {
          ...timetable.courses[0].secondaryComponents.lab,
          id: "3592103",
          sectionNumber: "6",
          schedule: {
            ...timetable.courses[0].secondaryComponents.lab.schedule,
            time: "1600-1800",
          },
        },
      },
    },
  ],
};

function renderCalendar(props = {}) {
  const setTimetables = vi.fn();
  const setSelectedDuration = vi.fn();
  const setCourseDetails = vi.fn();
  const setCalendarUpdateHandler = vi.fn();
  const onTimeBlockChange = vi.fn();

  // currentTimetableIndex is owned by the parent (GeneratorPage) now, so the
  // test hosts it in a small stateful harness to drive the navigation buttons.
  function CalendarHarness({ timetables = [timetable], ...rest }) {
    const [currentTimetableIndex, setCurrentTimetableIndex] = React.useState(0);

    return (
      <CalendarComponent
        timetables={timetables}
        setTimetables={setTimetables}
        selectedDuration={duration}
        setSelectedDuration={setSelectedDuration}
        durations={[duration]}
        sortOption="default"
        currentTimetableIndex={currentTimetableIndex}
        setCurrentTimetableIndex={setCurrentTimetableIndex}
        onTimeBlockChange={onTimeBlockChange}
        {...rest}
      />
    );
  }

  CalendarHarness.propTypes = {
    timetables: PropTypes.array,
  };

  render(
    <CourseDetailsContext.Provider
      value={{ courseDetails: [], setCourseDetails }}
    >
      <CourseColorsContext.Provider
        value={{
          courseColors: {},
          updateCourseColor: vi.fn(),
          getDefaultColorForCourse: vi.fn(() => "#E74C3C"),
          initializeCourseColor: vi.fn(),
          setCalendarUpdateHandler,
        }}
      >
        <CalendarHarness {...props} />
      </CourseColorsContext.Provider>
    </CourseDetailsContext.Provider>,
  );

  return {
    setTimetables,
    setSelectedDuration,
    setCalendarUpdateHandler,
    onTimeBlockChange,
  };
}

function CalendarUpdateHandlerProbe() {
  const renderCount = React.useRef(0);
  const { setCalendarUpdateHandler } = React.useContext(CourseColorsContext);

  renderCount.current += 1;
  if (renderCount.current > 10) {
    throw new Error(
      "Course color handler registration caused repeated re-renders",
    );
  }

  React.useEffect(() => {
    setCalendarUpdateHandler(() => vi.fn());
  }, [setCalendarUpdateHandler]);

  return <div>Calendar update handler registered</div>;
}

describe("CalendarComponent user interactions", () => {
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
  });

  beforeEach(() => {
    clearAllPins();
    getTimeBlockEvents().forEach((block) => removeTimeBlockEvent(block.id));
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("pins and unpins a course component when the user clicks its calendar event", async () => {
    renderCalendar();

    const lectureEvent = await screen.findByRole("button", {
      name: "COSC1P02 LEC 1",
    });

    await userEvent.click(lectureEvent);
    expect(getPinnedComponents()).toContain("COSC1P02 MAIN 3591102");

    await userEvent.click(lectureEvent);
    expect(getPinnedComponents()).not.toContain("COSC1P02 MAIN 3591102");
  });

  it("pins secondary course components using their component type and base id", async () => {
    renderCalendar();

    await userEvent.click(
      (await screen.findAllByRole("button", { name: "COSC1P02 LAB 5" }))[0],
    );

    expect(getPinnedComponents()).toEqual(["COSC1P02 LAB 3591103"]);
  });

  it("moves between generated timetable results with the calendar navigation buttons", async () => {
    renderCalendar({
      timetables: [timetable, alternateTimetable],
    });

    expect(await screen.findByText("1 of 2")).toBeTruthy();

    const navButtons = document
      .querySelector("#calendarNavButtons")
      .querySelectorAll("button");

    const nextButton = navButtons[2];
    await userEvent.click(nextButton);
    expect(await screen.findByText("2 of 2")).toBeTruthy();

    const previousButton = navButtons[1];
    await userEvent.click(previousButton);
    await waitFor(() => expect(screen.getByText("1 of 2")).toBeTruthy());
  });

  it("creates a blocked time slot when the user selects time on the calendar", async () => {
    const { setTimetables } = renderCalendar();

    await userEvent.click(
      screen.getByRole("button", { name: "Block Friday afternoon" }),
    );

    expect(getTimeBlockEvents()).toEqual([
      expect.objectContaining({
        daysOfWeek: "F",
        startTime: "14:00",
        endTime: "16:00",
      }),
    ]);
    expect(setTimetables).toHaveBeenCalled();
  });

  it("does not re-render repeatedly when registering the calendar update handler", () => {
    render(
      <CourseColorsProvider>
        <CalendarUpdateHandlerProbe />
      </CourseColorsProvider>,
    );

    expect(screen.getByText("Calendar update handler registered")).toBeTruthy();
  });
});
