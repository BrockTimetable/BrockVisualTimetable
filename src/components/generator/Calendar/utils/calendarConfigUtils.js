import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { renderEventContent } from "./calendarUtils.jsx";

export const getFullCalendarConfig = ({
  calendarRef,
  showWeekends,
  events,
  handleDatesSet,
  handleEventClick,
  handleSelect,
  handleSelectAllow,
  handleUnselect,
  handleEventMouseEnter,
  handleEventMouseLeave,
  isMobile = false,
  calendarView = "timeGridWeek",
}) => ({
  ref: calendarRef,
  plugins: [timeGridPlugin, listPlugin, interactionPlugin],
  initialView: "timeGridWeek",
  weekends: showWeekends,
  headerToolbar: false,
  height: isMobile && calendarView === "listWeek" ? "auto" : 835,
  dayHeaderFormat: { weekday: "short" },
  dayHeaderContent: (arg) => {
    if (arg.view.type === "listWeek") {
      return arg.date.toLocaleDateString(undefined, {
        weekday: "long",
      });
    }
    return arg.text.toUpperCase();
  },
  listDayFormat: { weekday: "long" },
  listDaySideFormat: false,
  noEventsContent: "No classes this week",
  slotMinTime: "08:00:00",
  slotMaxTime: "23:00:00",
  slotDuration: "00:30:00",
  allDaySlot: true,
  allDayText: "ONLINE",
  eventContent: (eventInfo) =>
    renderEventContent(eventInfo, isMobile, eventInfo.view.type === "listWeek"),
  eventClassNames: (arg) => {
    const classes = [];
    if (arg.event.extendedProps?.isPinned) classes.push("fc-event-pinned");
    if (arg.event.extendedProps?.isConflicting)
      classes.push("fc-event-conflict");
    return classes;
  },
  eventDidMount: (arg) => {
    if (isMobile && arg.view.type === "listWeek") {
      const eventColor = arg.event.backgroundColor || arg.event.borderColor;
      if (eventColor) {
        arg.el.style.setProperty("--calendar-list-event-color", eventColor);
      }
      arg.el.classList.add("fc-list-event-mobile");
    }

    if (arg.event.extendedProps?.isPinned) {
      arg.el.style.borderColor = "transparent";
      arg.el.style.borderWidth = "1px";
      arg.el.style.borderStyle = "solid";
    }
  },
  eventClick: handleEventClick,
  eventMouseEnter: handleEventMouseEnter,
  eventMouseLeave: handleEventMouseLeave,
  datesSet: handleDatesSet,
  selectable: !isMobile,
  selectMinDistance: 25,
  select: handleSelect,
  selectAllow: handleSelectAllow,
  unselect: handleUnselect,
  longPressDelay: 0,
  selectLongPressDelay: 500,
  firstDay: 1,
  events: events,
});
