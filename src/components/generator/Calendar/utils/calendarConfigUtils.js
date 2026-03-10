import timeGridPlugin from "@fullcalendar/timegrid";
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
}) => ({
  ref: calendarRef,
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: "timeGridWeek",
  weekends: showWeekends,
  headerToolbar: false,
  height: 835,
  dayHeaderFormat: { weekday: "short" },
  dayHeaderContent: (arg) => arg.text.toUpperCase(),
  slotMinTime: "08:00:00",
  slotMaxTime: "23:00:00",
  slotDuration: "00:30:00",
  allDaySlot: true,
  allDayText: "ONLINE",
  eventContent: (eventInfo) => renderEventContent(eventInfo, isMobile),
  eventClassNames: (arg) =>
    arg.event.extendedProps?.isPinned ? ["fc-event-pinned"] : [],
  eventDidMount: (arg) => {
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
  selectable: true,
  selectMinDistance: 25,
  select: handleSelect,
  selectAllow: handleSelectAllow,
  unselect: handleUnselect,
  longPressDelay: 0,
  selectLongPressDelay: 500,
  firstDay: 1,
  events: events,
});
