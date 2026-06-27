// Derives the highlight keys and user-facing summary for a single timetable's
// set of conflicting component pairs.
const buildConflictData = (conflicts) => {
  const conflictKeys = new Set();
  const involvedCoursesMap = new Map();
  const pinTargetMap = new Map();
  const pairs = [];

  const componentKey = (comp) => `${comp.courseCode}|${comp.componentId}`;
  const trackCourse = (comp) => {
    conflictKeys.add(componentKey(comp));
    if (!involvedCoursesMap.has(comp.courseCode)) {
      involvedCoursesMap.set(comp.courseCode, {
        courseCode: comp.courseCode,
        courseName: comp.courseName || "",
      });
    }
    // "COSC1P02 MAIN 3591102" — pins the exact conflicting section so the
    // arrangement is locked and shows a pin icon when the user ignores it.
    const pin = `${comp.courseCode} ${comp.pinType} ${comp.baseComponentId}`;
    pinTargetMap.set(pin, pin);
  };

  for (const { a, b } of conflicts) {
    trackCourse(a);
    trackCourse(b);
    pairs.push({
      a: { courseCode: a.courseCode, type: a.type, days: a.days, time: a.time },
      b: { courseCode: b.courseCode, type: b.type, days: b.days, time: b.time },
    });
  }

  return {
    conflictKeys,
    involvedCourses: Array.from(involvedCoursesMap.values()),
    pairs,
    pinTargets: Array.from(pinTargetMap.values()),
  };
};

/**
 * Builds the "least-conflicting" fallback shown when no conflict-free timetable
 * exists. Returns *every* timetable tied for the fewest cross-course conflicts
 * so the user can still page through the variations that don't affect the
 * unavoidable clash (e.g. different seminars), plus the data the UI needs to
 * highlight the clashing components and explain them.
 *
 * Returns null when there is nothing meaningful to surface (no candidates, or
 * the best candidates have no cross-course conflicts to report).
 */
export const buildConflictFallback = (allPossibleTimetables, findConflicts) => {
  let minConflictCount = Infinity;
  let bestGroup = [];

  for (const timetable of allPossibleTimetables) {
    const conflicts = findConflicts(timetable);
    if (conflicts.length === 0) continue; // unreachable for a valid timetable
    if (conflicts.length < minConflictCount) {
      minConflictCount = conflicts.length;
      bestGroup = [{ timetable, conflicts }];
    } else if (conflicts.length === minConflictCount) {
      bestGroup.push({ timetable, conflicts });
    }
  }

  if (bestGroup.length === 0) {
    return null;
  }

  // The summary/pins shown in the dialog are taken from a representative
  // candidate; tied candidates share the same unavoidable clash.
  const representative = buildConflictData(bestGroup[0].conflicts);

  return {
    timetables: bestGroup.map(({ timetable, conflicts }) => ({
      timetable,
      conflictKeys: buildConflictData(conflicts).conflictKeys,
    })),
    conflictInfo: {
      involvedCourses: representative.involvedCourses,
      pairs: representative.pairs,
      pinTargets: representative.pinTargets,
    },
  };
};
