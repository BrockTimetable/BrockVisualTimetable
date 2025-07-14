import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { renderEventContent } from "./calendarUtils.jsx";

export const getFullCalendarConfig = ({
  calendarRef,
  showWeekends,
  events,
  handleEventClick,
  handleSelect,
  handleSelectAllow,
}) => ({
  ref: calendarRef,
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: "timeGridWeek",
  weekends: showWeekends,
  headerToolbar: false,
  height: 835,
  dayHeaderFormat: { weekday: "short" },
  dayCellClassNames: (arg) =>
    arg.date.getDay() === new Date().getDay() ? "fc-day-today" : "",
  slotMinTime: "08:00:00",
  slotMaxTime: "23:00:00",
  slotDuration: "00:30:00",
  allDaySlot: true,
  allDayText: "ONLINE",
  eventContent: renderEventContent,
  eventClick: handleEventClick,
  selectable: true,
  selectMinDistance: 25,
  select: handleSelect,
  selectAllow: handleSelectAllow,
  longPressDelay: 0,
  selectLongPressDelay: 500,
  firstDay: 1,
  events: events,
});
