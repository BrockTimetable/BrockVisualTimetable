import { describe, expect, it } from "vitest";
import { getVisibleCandidates } from "../calendarViewUtils";

const timetable = (id) => ({
  courses: [
    {
      courseCode: "COSC1P02",
      mainComponents: [
        { id, schedule: { duration: "2", startDate: 100, endDate: 200 } },
      ],
      secondaryComponents: {},
    },
  ],
});

describe("getVisibleCandidates", () => {
  it("keeps one representative for visually identical timetable candidates", () => {
    const first = { id: "first", timetable: timetable("100-1") };
    const duplicate = { id: "duplicate", timetable: timetable("100-2") };
    const distinct = { id: "distinct", timetable: timetable("101-1") };

    expect(
      getVisibleCandidates([first, duplicate, distinct], {
        start: new Date(100_000),
        end: new Date(201_000),
      }),
    ).toEqual([first, distinct]);
  });
});
