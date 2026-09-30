import { describe, expect, it } from "vitest";
import { getFullCalendarConfig } from "../calendarConfigUtils";

describe("getFullCalendarConfig mobile views", () => {
  it("defaults mobile to the weekly calendar grid", () => {
    const config = getFullCalendarConfig({ isMobile: true });

    expect(config.initialView).toBe("timeGridWeek");
    expect(config.height).toBe(835);
  });

  it("uses the compact schedule layout when selected on mobile", () => {
    const config = getFullCalendarConfig({
      isMobile: true,
      calendarView: "listWeek",
    });

    expect(config.initialView).toBe("timeGridWeek");
    expect(config.height).toBe("auto");

    const content = config.eventContent({
      event: {
        start: new Date("2026-09-28T09:00:00"),
        end: new Date("2026-09-28T10:00:00"),
        title: "Blocked time",
        extendedProps: { isBlocked: true },
      },
      view: { type: "listWeek" },
      timeText: "9:00am - 10:00am",
    });

    expect(content.props.className).toBe("calendar-list-event-content");
  });

  it("clamps mobile calendar event titles to fit their time block", () => {
    const config = getFullCalendarConfig({ isMobile: true });
    const content = config.eventContent({
      event: {
        start: new Date("2026-09-28T09:00:00"),
        end: new Date("2026-09-28T10:00:00"),
        title: "COSC1P02 LEC 1",
        extendedProps: {
          courseName: "Introduction to Computer Science",
          description: "Nishat, Rahnuma Islam",
        },
      },
      view: { type: "timeGridWeek" },
      timeText: "9:00am - 10:00am",
    });

    expect(content.props.className).toBe("calendar-grid-event-content");
    expect(content.props.children.props.className).toContain(
      "calendar-grid-event-title--double",
    );
    expect(content.props.title).toContain("Nishat, Rahnuma Islam");
  });
});
