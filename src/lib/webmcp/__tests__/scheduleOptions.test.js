import { describe, expect, it } from "vitest";
import {
  normalizeCourseLabel,
  rankScheduleOptions,
  toTimeSlots,
} from "../scheduleOptions";

const schedule = (time, days = "MW") => ({
  courses: [
    {
      courseCode: "COSC1P02",
      mainComponents: [{ id: "lec-1", type: "LEC", schedule: { time, days } }],
      secondaryComponents: {},
    },
  ],
});

describe("schedule WebMCP helpers", () => {
  it("normalizes an agent-supplied course label", () => {
    expect(normalizeCourseLabel(" cosc1p02 d2 ")).toBe("COSC 1P02 D2");
    expect(normalizeCourseLabel("not a course")).toBeNull();
  });

  it("removes schedules that violate hard start-time requirements", () => {
    const ranked = rankScheduleOptions(
      [
        { id: "early", timetable: schedule("0800-0900") },
        { id: "late", timetable: schedule("1000-1100") },
      ],
      { hard: { notBefore: "09:00" }, soft: {} },
    );

    expect(ranked.map((option) => option.id)).toEqual(["late"]);
  });

  it("ranks later classes first when avoiding early starts is a soft preference", () => {
    const ranked = rankScheduleOptions(
      [
        { id: "early", timetable: schedule("0800-0900") },
        { id: "late", timetable: schedule("1000-1100") },
      ],
      { hard: {}, soft: { avoidBefore: "09:00" } },
    );

    expect(ranked.map((option) => option.id)).toEqual(["late", "early"]);
  });

  it("turns unavailable time windows into the generator slot grid", () => {
    expect(
      toTimeSlots([{ days: ["M"], start: "09:00", end: "10:00" }]),
    ).toEqual({
      M: [2, 3],
    });
  });
});
