// Converts string time (e.g., "830", "1430") to calendar slot index
export const timeToSlot = (time) => {
  const timeCache = {
    800: 0,
    830: 1,
    900: 2,
    930: 3,
    1000: 4,
    1030: 5,
    1100: 6,
    1130: 7,
    1200: 8,
    1230: 9,
    1300: 10,
    1330: 11,
    1400: 12,
    1430: 13,
    1500: 14,
    1530: 15,
    1600: 16,
    1630: 17,
    1700: 18,
    1730: 19,
    1800: 20,
    1830: 21,
    1900: 22,
    1930: 23,
    2000: 24,
    2030: 25,
    2100: 26,
    2130: 27,
  };

  if (timeCache.hasOwnProperty(time)) {
    return timeCache[time];
  }

  const [hours, minutes] =
    time.length === 3
      ? [parseInt(time[0]), parseInt(time[1] + "0")]
      : [parseInt(time.slice(0, 2)), parseInt(time.slice(2))];

  return (hours - 8) * 2 + (minutes === 30 ? 1 : 0);
};

export const isSlotAvailable = (timeSlots, day, startSlot, endSlot) => {
  const slots = timeSlots[day];
  for (let i = startSlot; i < endSlot; i++) {
    if (slots[i]) return false;
  }
  return true;
};

export const calculateBlockedPercentage = (component, timeSlots) => {
  const { days, time } = component.schedule;
  if (!time || /[a-zA-Z]/.test(time)) return 100;

  const [startSlot, endSlot] = time.split("-").map((t) => timeToSlot(t.trim()));
  const daysArray = days.replace(/\s/g, "").split("");

  let totalSlots = 0;
  let blockedSlots = 0;

  for (const day of daysArray) {
    for (let slot = startSlot; slot < endSlot; slot++) {
      totalSlots++;
      if (timeSlots[day][slot]) {
        blockedSlots++;
      }
    }
  }

  return (blockedSlots / totalSlots) * 100;
};
