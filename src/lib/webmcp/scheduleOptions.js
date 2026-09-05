const DAY_NAMES = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  R: "Thursday",
  F: "Friday",
  S: "Saturday",
  U: "Sunday",
};

const DAY_CODES = Object.keys(DAY_NAMES);

export const normalizeCourseLabel = (value) => {
  const label = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
  const match = label.match(/^([A-Z]{4})\s*(\d[A-Z]\d{2})\s*(?:D)?(\d+)$/);
  if (!match) return null;
  return `${match[1]} ${match[2]} D${match[3]}`;
};

export const normalizeCourseCode = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/D\d+$/, "");

const toMinutes = (value) => {
  const text = String(value || "").trim();
  if (/^\d{1,2}:\d{2}$/.test(text)) {
    const [hour, minute] = text.split(":").map(Number);
    return hour * 60 + minute;
  }
  if (/^\d{3,4}$/.test(text)) {
    const padded = text.padStart(4, "0");
    return Number(padded.slice(0, 2)) * 60 + Number(padded.slice(2));
  }
  return null;
};

const formatTime = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const componentMeetings = (course) => {
  const components = [
    ...(course.mainComponents || []),
    course.secondaryComponents?.lab,
    course.secondaryComponents?.tutorial,
    course.secondaryComponents?.seminar,
  ].filter(Boolean);

  return components.flatMap((component) => {
    const [start, end] = String(component.schedule?.time || "")
      .replace(/\s/g, "")
      .split("-")
      .map(toMinutes);
    if (
      start == null ||
      end == null ||
      /[A-Z]/i.test(component.schedule?.time || "")
    ) {
      return [];
    }
    return String(component.schedule?.days || "")
      .replace(/\s/g, "")
      .split("")
      .filter((day) => DAY_CODES.includes(day))
      .map((day) => ({
        courseCode: course.courseCode,
        type: component.type,
        sectionId: component.id,
        day,
        start,
        end,
      }));
  });
};

export const getScheduleMetrics = (timetable) => {
  const meetings = (timetable?.courses || []).flatMap(componentMeetings);
  const byDay = new Map();
  meetings.forEach((meeting) => {
    if (!byDay.has(meeting.day)) byDay.set(meeting.day, []);
    byDay.get(meeting.day).push(meeting);
  });

  let largestGapMinutes = 0;
  let totalGapMinutes = 0;
  byDay.forEach((dayMeetings) => {
    dayMeetings.sort((a, b) => a.start - b.start);
    for (let index = 1; index < dayMeetings.length; index += 1) {
      const gap = Math.max(
        0,
        dayMeetings[index].start - dayMeetings[index - 1].end,
      );
      largestGapMinutes = Math.max(largestGapMinutes, gap);
      totalGapMinutes += gap;
    }
  });

  const starts = meetings.map((meeting) => meeting.start);
  const ends = meetings.map((meeting) => meeting.end);
  return {
    meetings,
    daysOnCampus: byDay.size,
    earliestStart: starts.length ? Math.min(...starts) : null,
    latestEnd: ends.length ? Math.max(...ends) : null,
    largestGapMinutes,
    totalGapMinutes,
    days: [...byDay.keys()].sort(
      (a, b) => DAY_CODES.indexOf(a) - DAY_CODES.indexOf(b),
    ),
  };
};

const values = (value) => (Array.isArray(value) ? value : []);

export const matchesHardPreferences = (metrics, preferences = {}) => {
  const hard = preferences.hard || preferences;
  const notBefore = toMinutes(hard.notBefore);
  const notAfter = toMinutes(hard.notAfter);
  const avoidDays = new Set(values(hard.avoidDays));

  if (
    notBefore !== null &&
    metrics.earliestStart !== null &&
    metrics.earliestStart < notBefore
  )
    return false;
  if (
    notAfter !== null &&
    metrics.latestEnd !== null &&
    metrics.latestEnd > notAfter
  )
    return false;
  if (hard.maxCampusDays && metrics.daysOnCampus > hard.maxCampusDays)
    return false;
  if (
    hard.maxGapMinutes !== undefined &&
    metrics.largestGapMinutes > hard.maxGapMinutes
  )
    return false;
  return !metrics.days.some((day) => avoidDays.has(day));
};

export const scoreSchedule = (metrics, preferences = {}) => {
  const soft = preferences.soft || preferences;
  let score = 100;
  const avoidBefore = toMinutes(soft.avoidBefore);
  const preferAfter = toMinutes(soft.preferAfter);
  const avoidDays = new Set(values(soft.avoidDays));

  if (
    avoidBefore !== null &&
    metrics.earliestStart !== null &&
    metrics.earliestStart < avoidBefore
  ) {
    score -= Math.ceil((avoidBefore - metrics.earliestStart) / 15) * 3;
  }
  if (
    preferAfter !== null &&
    metrics.earliestStart !== null &&
    metrics.earliestStart < preferAfter
  ) {
    score -= Math.ceil((preferAfter - metrics.earliestStart) / 30);
  }
  score -= metrics.days.filter((day) => avoidDays.has(day)).length * 25;
  if (soft.preferCompactDays) score -= Math.round(metrics.totalGapMinutes / 15);
  if (soft.preferFewerDays) score -= metrics.daysOnCampus * 8;
  return score;
};

export const describeOption = (id, timetable, preferences, cachedMetrics) => {
  const metrics = cachedMetrics || getScheduleMetrics(timetable);
  const dayNames =
    metrics.days.map((day) => DAY_NAMES[day]).join(", ") || "No timed meetings";
  return {
    id,
    score: scoreSchedule(metrics, preferences),
    hasConflicts: Boolean(timetable?.hasConflicts),
    courseCount: timetable?.courses?.length || 0,
    daysOnCampus: metrics.daysOnCampus,
    earliestStart:
      metrics.earliestStart === null ? null : formatTime(metrics.earliestStart),
    latestEnd:
      metrics.latestEnd === null ? null : formatTime(metrics.latestEnd),
    largestGapMinutes: metrics.largestGapMinutes,
    totalGapMinutes: metrics.totalGapMinutes,
    days: metrics.days,
    summary: `${dayNames}; ${metrics.earliestStart === null ? "no timed meetings" : `${formatTime(metrics.earliestStart)}–${formatTime(metrics.latestEnd)}`}`,
  };
};

export const rankScheduleOptions = (candidates, preferences = {}) =>
  candidates
    .map((candidate) => ({
      ...candidate,
      // Agent searches repeatedly rank the same generated candidates. Keep the
      // expensive meeting/gap calculation produced at generation time.
      metrics: candidate.metrics || getScheduleMetrics(candidate.timetable),
    }))
    .filter((candidate) =>
      matchesHardPreferences(candidate.metrics, preferences.hard || {}),
    )
    .sort((a, b) => {
      const scoreDifference =
        scoreSchedule(b.metrics, preferences) -
        scoreSchedule(a.metrics, preferences);
      if (scoreDifference !== 0) return scoreDifference;
      return a.metrics.totalGapMinutes - b.metrics.totalGapMinutes;
    });

export const toTimeSlots = (blocks) => {
  const slots = {};
  for (const block of blocks) {
    const start = toMinutes(block.start);
    const end = toMinutes(block.end);
    if (start === null || end === null || end <= start) continue;
    for (const day of values(block.days)) {
      if (!DAY_CODES.includes(day)) continue;
      const startSlot = Math.max(0, Math.floor((start - 8 * 60) / 30));
      const endSlot = Math.min(28, Math.ceil((end - 8 * 60) / 30));
      if (endSlot <= startSlot) continue;
      slots[day] = [
        ...(slots[day] || []),
        ...Array.from({ length: endSlot - startSlot }, (_, i) => startSlot + i),
      ];
    }
  }
  return Object.fromEntries(
    Object.entries(slots).map(([day, daySlots]) => [
      day,
      [...new Set(daySlots)],
    ]),
  );
};

export const normalizeUnavailableBlocks = (blocks) =>
  values(blocks).flatMap((block, blockIndex) => {
    const start = toMinutes(block.start);
    const end = toMinutes(block.end);
    if (start === null || end === null || end <= start) return [];
    return values(block.days)
      .filter((day) => DAY_CODES.includes(day))
      .map((day, dayIndex) => ({
        id: `agent-${Date.now()}-${blockIndex}-${dayIndex}-${day}`,
        title: String(block.label || "Unavailable"),
        daysOfWeek: day,
        startTime: formatTime(start),
        endTime: formatTime(end),
        startRecur: "1970-01-01",
        endRecur: "9999-12-31",
      }));
  });
