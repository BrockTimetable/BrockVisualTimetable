import { encodeState } from "./urlEncoder";
import { defaultColorForIndex } from "@/lib/contexts/generator/courseColorPalette";
import { getPinnedComponents } from "@/lib/generator/pinnedComponents";

/*
Helpers that bridge the live generator state (singletons + React) and the URL
codec. Shared links preserve the user's constraints and selected timetable
position, allowing the recipient to browse the same sorted set of options.
*/

// Persist only explicit section pins. Course duration requirements are already
// represented by the course labels (e.g. "COSC 1P02 D2").
export function extractPinnedSectionIds(
  pinnedComponents = getPinnedComponents(),
) {
  const sectionPinTypes = new Set(["MAIN", "LAB", "TUT", "SEM"]);
  const ids = new Set();
  pinnedComponents.forEach((pin) => {
    const [, type, id] = pin.trim().split(/\s+/);
    if (sectionPinTypes.has(type) && /^\d+$/.test(id || "")) ids.add(id);
  });
  return [...ids];
}

// Reconstruct full pin strings ("COSC1P02 MAIN 3591102") from bare section IDs
// by looking each one up in the already-fetched course data. allFound is false
// if any ID is missing (course no longer offers that section).
export function buildPinStringsFromIds(sectionIds, courseData) {
  const idMap = {};
  Object.values(courseData).forEach((course) => {
    const cc = course.courseCode;
    course.sections?.forEach((s) => {
      idMap[s.id] = { courseCode: cc, type: "MAIN" };
    });
    course.labs?.forEach((s) => {
      idMap[s.id] = { courseCode: cc, type: "LAB" };
    });
    course.tutorials?.forEach((s) => {
      idMap[s.id] = { courseCode: cc, type: "TUT" };
    });
    course.seminars?.forEach((s) => {
      idMap[s.id] = { courseCode: cc, type: "SEM" };
    });
  });

  const pinStrings = [];
  let allFound = true;
  sectionIds.forEach((id) => {
    if (idMap[id]) {
      const { courseCode, type } = idMap[id];
      pinStrings.push(`${courseCode} ${type} ${id}`);
    } else {
      allFound = false;
    }
  });
  return { pinStrings, allFound };
}

// "COSC 1P02 D2" -> { cleanCourseCode: "COSC1P02", duration: "2" }
export function parseCourseLabel(label) {
  const parts = label.trim().split(" ");
  return {
    cleanCourseCode: parts[0] + parts[1],
    duration: parts[2].substring(1),
  };
}

// Builds the "<startUnix>-<endUnix>-<code>" duration label for a freshly fetched
// course, matching how InputFormTopComponent derives it on a normal add. Returns
// null if the course has no section for that duration code.
export function buildDurationLabel(courseData, durationCode) {
  for (const key in courseData.sections) {
    const section = courseData.sections[key];
    if (section.schedule.duration === durationCode) {
      return `${section.schedule.startDate}-${section.schedule.endDate}-${durationCode}`;
    }
  }
  return null;
}

// Encode the current state and silently replace the URL. Clears ?s= when there
// are no courses. Uses history.replaceState (never pushState) so the back button
// never walks through timetable states.
export function syncUrlToState({
  addedCourses,
  sortOption,
  currentTimetableIndex,
  timetableType,
  term,
  timeBlockEvents,
  selectedDuration,
  courseColors,
}) {
  const url = new URL(window.location.href);

  if (!addedCourses.length) {
    url.searchParams.delete("s");
    history.replaceState(null, "", url);
    return;
  }

  const sortMap = { sortByWaitingTime: "w", minimizeClassDays: "d" };

  // Only the duration *code* is stored; the date range is rebuilt from course
  // data on restore. "1725321600-1732924800-2" -> "2".
  const durationCode = selectedDuration
    ? selectedDuration.split("-")[2] || ""
    : "";

  // Only persist colors the user actually changed: default palette colors are
  // re-derived from course order on restore, so they cost nothing here.
  const colorOverrides = {};
  addedCourses.forEach((label, i) => {
    const code = label.trim().split(/\s+/).slice(0, 2).join("");
    const actual = (courseColors || {})[code];
    if (
      actual &&
      actual.toUpperCase() !== defaultColorForIndex(i).toUpperCase()
    ) {
      colorOverrides[code] = actual;
    }
  });

  const state = {
    v: 3,
    tt: timetableType,
    term,
    c: addedCourses,
    p: extractPinnedSectionIds(),
    i: currentTimetableIndex,
    sort: sortMap[sortOption],
    tb: timeBlockEvents.map((b) => ({
      d: b.daysOfWeek.trim(),
      s: b.startTime,
      e: b.endTime,
      n: b.title || "",
    })),
    sd: durationCode,
    col: colorOverrides,
  };

  try {
    url.searchParams.set("s", encodeState(state));
    history.replaceState(null, "", url);
  } catch (e) {
    // Non-fatal — URL just won't update.
    console.warn("URL state sync failed", e);
  }
}
