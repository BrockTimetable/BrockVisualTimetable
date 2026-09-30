/* @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CalendarNavBar from "../CalendarNavBar";

const duration = "1725321600-1732924800-2";

function MobileCalendarNavBar() {
  const [calendarView, setCalendarView] = React.useState("timeGridWeek");

  return (
    <CalendarNavBar
      isTruncated={false}
      noTimetablesGenerated={false}
      timeslotsOverridden={false}
      conflictPresent={false}
      handleFirst={vi.fn()}
      handlePrevious={vi.fn()}
      handleNext={vi.fn()}
      handleLast={vi.fn()}
      currentTimetableIndex={0}
      timetables={[]}
      selectedDuration={duration}
      setSelectedDuration={vi.fn()}
      durations={[duration]}
      sortByBracketContent={(durations) => durations}
      isMobile
      calendarView={calendarView}
      onToggleMobileView={() =>
        setCalendarView((currentView) =>
          currentView === "timeGridWeek" ? "listWeek" : "timeGridWeek",
        )
      }
      onBlockTime={vi.fn()}
    />
  );
}

describe("CalendarNavBar mobile view toggle", () => {
  it("switches between schedule and calendar view icons", async () => {
    render(<MobileCalendarNavBar />);

    const toggle = screen.getByRole("button", {
      name: "Switch to schedule view",
    });
    expect(toggle.querySelector("svg").getAttribute("class")).toContain(
      "lucide-list",
    );

    await userEvent.click(toggle);

    const switchedToggle = screen.getByRole("button", {
      name: "Switch to calendar view",
    });
    expect(switchedToggle.querySelector("svg").getAttribute("class")).toContain(
      "lucide-calendar-days",
    );
  });
});
