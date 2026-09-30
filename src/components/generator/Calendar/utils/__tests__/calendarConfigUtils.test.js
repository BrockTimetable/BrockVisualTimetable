import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
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

  it.each([30, 60, 90, 120])(
    "renders %i-minute course events identically on mobile and desktop",
    (duration) => {
      const eventInfo = {
        event: {
          start: new Date("2026-09-28T09:00:00"),
          end: new Date(
            new Date("2026-09-28T09:00:00").getTime() + duration * 60000,
          ),
          title: "COSC1P02 LEC 1",
          extendedProps: {
            courseName: "Introduction to Computer Science",
            description: "Nishat, Rahnuma Islam",
            isPinned: true,
          },
        },
        view: { type: "timeGridWeek" },
        timeText: "9:00am - 10:00am",
      };
      const mobile = renderToStaticMarkup(
        getFullCalendarConfig({ isMobile: true }).eventContent(eventInfo),
      );
      const desktop = renderToStaticMarkup(
        getFullCalendarConfig({ isMobile: false }).eventContent(eventInfo),
      );

      expect(mobile).toBe(desktop);
      expect(mobile).toContain(eventInfo.timeText);
      expect(mobile).toContain(eventInfo.event.title);
      expect(mobile).toContain("lucide-pin");
      expect(mobile.includes(eventInfo.event.extendedProps.courseName)).toBe(
        duration >= 90,
      );
      expect(mobile.includes(eventInfo.event.extendedProps.description)).toBe(
        duration >= 90,
      );
    },
  );

  it.each([30, 90])(
    "renders %i-minute blocked events identically on mobile and desktop",
    (duration) => {
      const eventInfo = {
        event: {
          start: new Date("2026-09-28T09:00:00"),
          end: new Date(
            new Date("2026-09-28T09:00:00").getTime() + duration * 60000,
          ),
          title: "A blocked time label longer than twenty-five characters",
          extendedProps: { isBlocked: true },
        },
        view: { type: "timeGridWeek" },
        timeText: "9:00am - 10:30am",
      };
      const mobile = renderToStaticMarkup(
        getFullCalendarConfig({ isMobile: true }).eventContent(eventInfo),
      );
      const desktop = renderToStaticMarkup(
        getFullCalendarConfig({ isMobile: false }).eventContent(eventInfo),
      );

      expect(mobile).toBe(desktop);
      expect(mobile).toContain("lucide-ban");
      expect(mobile.includes(eventInfo.timeText)).toBe(duration >= 90);
      expect(mobile.includes(`${eventInfo.event.title.slice(0, 25)}...`)).toBe(
        duration >= 90,
      );
    },
  );
});
