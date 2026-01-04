import { timeToSlot } from "./timeUtils";

export const calculateWaitingTime = (timetable) => {
  let totalWaitingTime = 0;
  const daySlots = {};

  timetable.forEach((course) => {
    const components = [
      ...course.mainComponents,
      course.secondaryComponents.lab,
      course.secondaryComponents.tutorial,
      course.secondaryComponents.seminar,
    ].filter(Boolean);

    components.forEach(({ schedule }) => {
      const { days, time } = schedule;
      if (!time || /[a-zA-Z]/.test(time)) return;

      const [startSlot, endSlot] = time
        .split("-")
        .map((t) => timeToSlot(t.trim()));
      const daysArray = days.includes(" ")
        ? days.split(" ").filter(Boolean)
        : days.replace(/\s/g, "").split("");

      daysArray.forEach((day) => {
        if (!daySlots[day]) daySlots[day] = [];
        daySlots[day].push({ startSlot, endSlot });
      });
    });
  });

  Object.values(daySlots).forEach((slots) => {
    slots.sort((a, b) => a.startSlot - b.startSlot);
    for (let i = 1; i < slots.length; i++) {
      totalWaitingTime += (slots[i].startSlot - slots[i - 1].endSlot) * 30;
    }
  });

  return totalWaitingTime;
};

export const calculateClassDays = (timetable) => {
  const daysWithClasses = new Set();

  timetable.forEach((course) => {
    const components = [
      ...course.mainComponents,
      course.secondaryComponents.lab,
      course.secondaryComponents.tutorial,
      course.secondaryComponents.seminar,
    ].filter(Boolean);

    components.forEach(({ schedule }) => {
      const { days } = schedule;
      if (!days) return;

      const daysArray = days.includes(" ")
        ? days.split(" ").filter(Boolean)
        : days.replace(/\s/g, "").split("");

      daysArray.forEach((day) => daysWithClasses.add(day));
    });
  });

  return daysWithClasses.size;
};
