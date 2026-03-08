const MINUTES_PER_DAY = 24 * 60;
const SLOT_MINUTES = 30;
const DAY_CODES = ["U", "M", "T", "W", "R", "F", "S"];

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export const getMinutesOfDay = (date) =>
  date.getHours() * 60 + date.getMinutes();

export const getNormalizedSelectionWindow = (start, end) => {
  if (!start || !end) return null;

  const chronologicalStart = start <= end ? start : end;
  const chronologicalEnd = start <= end ? end : start;

  const startMinutes = getMinutesOfDay(start);
  const endMinutes = getMinutesOfDay(end);
  const isReverseVerticalDrag = startMinutes > endMinutes;
  const spansMultipleDays =
    chronologicalStart.toDateString() !== chronologicalEnd.toDateString();

  let selectionStartMinutes = Math.min(startMinutes, endMinutes);
  let selectionEndMinutes = Math.max(startMinutes, endMinutes);

  if (isReverseVerticalDrag) {
    selectionEndMinutes = clamp(
      selectionEndMinutes + SLOT_MINUTES,
      0,
      MINUTES_PER_DAY,
    );
    if (spansMultipleDays) {
      selectionStartMinutes = clamp(
        selectionStartMinutes - SLOT_MINUTES,
        0,
        MINUTES_PER_DAY,
      );
    }
  }

  return {
    chronologicalStart,
    chronologicalEnd,
    selectionStartMinutes,
    selectionEndMinutes,
  };
};

export const getDateRangeInclusive = (start, end) => {
  const window = getNormalizedSelectionWindow(start, end);
  if (!window) return [];

  const currentDate = new Date(window.chronologicalStart);
  currentDate.setHours(0, 0, 0, 0);
  const lastDate = new Date(window.chronologicalEnd);
  lastDate.setHours(0, 0, 0, 0);

  const dates = [];
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export const getSelectionDayCodes = (start, end) =>
  getDateRangeInclusive(start, end).map((date) => DAY_CODES[date.getDay()]);

export const toSlotRange = (
  selectionStartMinutes,
  selectionEndMinutes,
  dayStartMinutes = 8 * 60,
) => ({
  slotStart: (selectionStartMinutes - dayStartMinutes) / SLOT_MINUTES,
  slotEnd: (selectionEndMinutes - dayStartMinutes) / SLOT_MINUTES,
});

export const buildSelectionPreviewEvents = (start, end) => {
  const window = getNormalizedSelectionWindow(start, end);
  if (!window || window.selectionEndMinutes <= window.selectionStartMinutes) {
    return [];
  }

  const dates = getDateRangeInclusive(start, end);
  return dates.map((date) => {
    const eventStart = new Date(date);
    eventStart.setHours(
      Math.floor(window.selectionStartMinutes / 60),
      window.selectionStartMinutes % 60,
      0,
      0,
    );

    const eventEnd = new Date(date);
    eventEnd.setHours(
      Math.floor(window.selectionEndMinutes / 60),
      window.selectionEndMinutes % 60,
      0,
      0,
    );

    return {
      id: `selection-preview-${eventStart.toISOString()}`,
      start: eventStart,
      end: eventEnd,
      display: "background",
      classNames: ["fc-block-selection-preview"],
    };
  });
};
