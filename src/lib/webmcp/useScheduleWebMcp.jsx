import { useEffect, useRef } from "react";
import { exportCal, updateExportData } from "@/lib/generator/ExportCal";
import { getCourse, getNameList } from "@/lib/generator/fetchData";
import {
  storeCourseData,
  getCourseData,
  clearAllCourseData,
  removeCourseData,
} from "@/lib/generator/courseData";
import {
  addPinnedComponent,
  clearAllPins,
  clearCoursePins,
  getPinnedComponents,
  removePinnedComponent,
} from "@/lib/generator/pinnedComponents";
import {
  addTimeBlockEvent,
  clearAllTimeBlockEvents,
  getTimeBlockEvents,
} from "@/lib/generator/createCalendarEvents";
import {
  reinitializeTimeSlots,
  setBlockedTimeSlots,
} from "@/lib/generator/timeSlots";
import {
  generateTimetables,
  getValidTimetables,
  previewTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";
import {
  buildDurationLabel,
  parseCourseLabel,
  syncUrlToState,
} from "@/lib/urlState/urlStateUtils";
import {
  calculateNavigationDate,
  getVisibleCandidates,
} from "@/components/generator/Calendar/utils/calendarViewUtils";
import {
  describeOption,
  getScheduleMetrics,
  normalizeCourseCode,
  normalizeCourseLabel,
  normalizeUnavailableBlocks,
  rankScheduleOptions,
  toTimeSlots,
} from "./scheduleOptions";
import {
  trackWebMcpAvailable,
  trackWebMcpToolCompleted,
  trackWebMcpToolFailed,
} from "@/lib/metrics";

const json = (value) => JSON.stringify(value);
const asArray = (value) => (Array.isArray(value) ? value : []);
const resultCount = (result) =>
  [result.totalOptions, result.totalMatches, result.conflictFreeOptions].find(
    Number.isFinite,
  );

const tool = (name, description, inputSchema, execute, annotations = {}) => ({
  name,
  description,
  inputSchema,
  annotations,
  execute: async (input, context) => {
    const startedAt = performance.now();
    try {
      const result = await execute(input || {}, context || {});
      trackWebMcpToolCompleted({
        toolName: name,
        durationMs: Math.round(performance.now() - startedAt),
        resultCount: resultCount(result),
      });
      return json({ ok: true, ...result });
    } catch (error) {
      trackWebMcpToolFailed({
        toolName: name,
        durationMs: Math.round(performance.now() - startedAt),
      });
      return json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete that request.",
      });
    }
  },
});

const courseSchema = {
  type: "array",
  items: { type: "string", description: "Course label such as COSC 1P02 D2." },
  minItems: 1,
};

const preferenceSchema = {
  type: "object",
  description:
    "Use hard constraints to eliminate options and soft preferences to rank them.",
  properties: {
    hard: {
      type: "object",
      properties: {
        notBefore: {
          type: "string",
          description: "Earliest allowed class time, HH:MM.",
        },
        notAfter: {
          type: "string",
          description: "Latest allowed class end time, HH:MM.",
        },
        avoidDays: {
          type: "array",
          items: { type: "string", enum: ["M", "T", "W", "R", "F", "S", "U"] },
        },
        maxCampusDays: { type: "integer", minimum: 1, maximum: 7 },
        maxGapMinutes: { type: "integer", minimum: 0 },
      },
    },
    soft: {
      type: "object",
      properties: {
        avoidBefore: {
          type: "string",
          description: "Prefer schedules without earlier classes, HH:MM.",
        },
        preferAfter: {
          type: "string",
          description: "Prefer later starts, HH:MM.",
        },
        avoidDays: {
          type: "array",
          items: { type: "string", enum: ["M", "T", "W", "R", "F", "S", "U"] },
        },
        preferCompactDays: { type: "boolean" },
        preferFewerDays: { type: "boolean" },
      },
    },
  },
};

const blocksSchema = {
  type: "array",
  items: {
    type: "object",
    required: ["days", "start", "end"],
    properties: {
      days: {
        type: "array",
        items: { type: "string", enum: ["M", "T", "W", "R", "F", "S", "U"] },
      },
      start: { type: "string", description: "HH:MM" },
      end: { type: "string", description: "HH:MM" },
      label: { type: "string" },
    },
  },
};

export function useScheduleWebMcp({
  timetables,
  setTimetables,
  addedCourses,
  setAddedCourses,
  timetableType,
  setTimetableType,
  term,
  setTerm,
  sortOption,
  selectedDuration,
  setSelectedDuration,
  setDurations,
  setCurrentTimetableIndex,
  onTimeBlockChange,
  courseColors,
}) {
  const stateRef = useRef({
    timetables,
    addedCourses,
    timetableType,
    term,
    sortOption,
    selectedDuration,
  });
  const preferencesRef = useRef({ hard: {}, soft: {} });
  const candidatesRef = useRef([]);
  const scheduleVersionRef = useRef(0);
  const selectedIdRef = useRef(null);
  const courseColorsRef = useRef(courseColors);

  stateRef.current = {
    timetables,
    addedCourses,
    timetableType,
    term,
    sortOption,
    selectedDuration,
  };
  courseColorsRef.current = courseColors;

  const rebuildDurations = (labels) => {
    const seen = new Set();
    const durations = labels.flatMap((label) => {
      const { cleanCourseCode, duration } = parseCourseLabel(label);
      const durationLabel = buildDurationLabel(
        getCourseData()[cleanCourseCode],
        duration,
      );
      return durationLabel && !seen.has(durationLabel)
        ? (seen.add(durationLabel), [durationLabel])
        : [];
    });
    stateRef.current.selectedDuration = durations[durations.length - 1] || "";
    setDurations(durations);
    setSelectedDuration(durations[durations.length - 1] || "");
  };

  const commitCourses = (nextCourses) => {
    stateRef.current.addedCourses = nextCourses;
    setAddedCourses(nextCourses);
    rebuildDurations(nextCourses);
  };

  const optionId = (index) => `${scheduleVersionRef.current}:${index}`;

  const calendarViewRange = () => {
    const start = Number(
      String(stateRef.current.selectedDuration || "").split("-")[0],
    );
    if (!Number.isFinite(start) || start <= 0) return null;
    const rangeStart = calculateNavigationDate(new Date(start * 1000));
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 7);
    return { start: rangeStart, end: rangeEnd };
  };

  const visibleCandidates = (candidates) =>
    getVisibleCandidates(candidates, calendarViewRange());

  const rankVisibleCandidates = (candidates, preferences) =>
    visibleCandidates(rankScheduleOptions(candidates, preferences));

  const syncSelectedTimetable = (currentTimetableIndex) => {
    syncUrlToState({
      addedCourses: stateRef.current.addedCourses,
      sortOption: stateRef.current.sortOption,
      currentTimetableIndex,
      timetableType: stateRef.current.timetableType,
      term: stateRef.current.term,
      timeBlockEvents: getTimeBlockEvents(),
      selectedDuration: stateRef.current.selectedDuration,
      courseColors: courseColorsRef.current,
    });
  };

  const publishCandidates = () => {
    const ranked = rankVisibleCandidates(
      candidatesRef.current,
      preferencesRef.current,
    );
    const visible = ranked.map((candidate) => candidate.timetable);
    stateRef.current.timetables = visible;
    setTimetables(visible);
    setCurrentTimetableIndex(0);
    selectedIdRef.current = ranked[0]?.id || null;
    if (ranked[0]) syncSelectedTimetable(0);
    return ranked;
  };

  const regenerate = () => {
    generateTimetables(stateRef.current.sortOption);
    scheduleVersionRef.current += 1;
    candidatesRef.current = getValidTimetables().map((timetable, index) => ({
      id: optionId(index),
      timetable,
      metrics: getScheduleMetrics(timetable),
    }));
    return publishCandidates();
  };

  const candidateById = (id) =>
    candidatesRef.current.find((candidate) => candidate.id === id);

  const ensureCandidates = () => {
    if (candidatesRef.current.length) return;
    scheduleVersionRef.current += 1;
    candidatesRef.current = stateRef.current.timetables.map(
      (timetable, index) => ({
        id: optionId(index),
        timetable,
        metrics: getScheduleMetrics(timetable),
      }),
    );
    selectedIdRef.current = candidatesRef.current[0]?.id || null;
  };

  const addCourses = async (courseValues, override = {}, preloadedCourses) => {
    const labels = courseValues.map(normalizeCourseLabel);
    if (labels.some((label) => !label))
      throw new Error("Courses must use a label such as COSC 1P02 D2.");
    const existing = new Set(stateRef.current.addedCourses);
    const uniqueLabels = [...new Set(labels)].filter(
      (label) => !existing.has(label),
    );
    if (!uniqueLabels.length)
      throw new Error("Those courses are already in the schedule.");
    const nextType = override.timetableType || stateRef.current.timetableType;
    const nextTerm = override.term || stateRef.current.term;
    const loaded =
      preloadedCourses ||
      (await Promise.all(
        uniqueLabels.map(async (label) => {
          const { cleanCourseCode } = parseCourseLabel(label);
          return {
            label,
            course: await getCourse(cleanCourseCode, nextType, nextTerm),
          };
        }),
      ));
    loaded.forEach(({ label, course }) => {
      const { cleanCourseCode, duration } = parseCourseLabel(label);
      storeCourseData(course);
      addPinnedComponent(`${cleanCourseCode} DURATION ${duration}`);
    });
    const nextCourses = [...stateRef.current.addedCourses, ...uniqueLabels];
    commitCourses(nextCourses);
    const ranked = regenerate();
    return { addedCourses: uniqueLabels, schedule: scheduleResult(ranked) };
  };

  const scheduleResult = (ranked) => ({
    scheduleVersion: scheduleVersionRef.current,
    totalOptions: ranked.length,
    generatedCombinations: candidatesRef.current.length,
    matchingCombinations: rankScheduleOptions(
      candidatesRef.current,
      preferencesRef.current,
    ).length,
    selectedOptionId: selectedIdRef.current,
    options: ranked
      .slice(0, 5)
      .map((candidate) =>
        describeOption(
          candidate.id,
          candidate.timetable,
          preferencesRef.current,
          candidate.metrics,
        ),
      ),
    message: ranked.length
      ? undefined
      : "No generated timetable satisfies the current hard constraints.",
  });

  const getDetails = (candidate) => {
    if (!candidate)
      throw new Error(
        "That schedule option is no longer available. Search again.",
      );
    const metrics =
      candidate.metrics || getScheduleMetrics(candidate.timetable);
    return {
      option: describeOption(
        candidate.id,
        candidate.timetable,
        preferencesRef.current,
      ),
      meetings: metrics.meetings.map((meeting) => ({
        ...meeting,
        start: `${String(Math.floor(meeting.start / 60)).padStart(2, "0")}:${String(meeting.start % 60).padStart(2, "0")}`,
        end: `${String(Math.floor(meeting.end / 60)).padStart(2, "0")}:${String(meeting.end % 60).padStart(2, "0")}`,
      })),
      courses: (candidate.timetable.courses || []).map((course) => ({
        code: course.courseCode,
        name: course.courseName,
      })),
    };
  };

  const describePreviewOption = (candidate, preferences) => {
    const metrics =
      candidate.metrics || getScheduleMetrics(candidate.timetable);
    return {
      ...describeOption(
        candidate.id,
        candidate.timetable,
        preferences,
        metrics,
      ),
      meetings: metrics.meetings.map((meeting) => ({
        ...meeting,
        start: `${String(Math.floor(meeting.start / 60)).padStart(2, "0")}:${String(meeting.start % 60).padStart(2, "0")}`,
        end: `${String(Math.floor(meeting.end / 60)).padStart(2, "0")}:${String(meeting.end % 60).padStart(2, "0")}`,
      })),
    };
  };

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext?.registerTool) return undefined;
    trackWebMcpAvailable();

    const tools = [
      tool(
        "searchCourses",
        "Search the selected Brock timetable for course offerings. This does not change the schedule.",
        {
          type: "object",
          required: ["query"],
          properties: {
            query: { type: "string" },
            timetableType: { type: "string", enum: ["UG", "AD", "PS", "GR"] },
            term: { type: "string", enum: ["FW", "SP", "SU"] },
            limit: { type: "integer", minimum: 1, maximum: 30 },
          },
        },
        async ({
          query,
          timetableType: requestedType,
          term: requestedTerm,
          limit = 10,
        }) => {
          const results = await getNameList(
            requestedType || stateRef.current.timetableType,
            requestedTerm || stateRef.current.term,
          );
          const normalizedQuery = String(query)
            .toUpperCase()
            .replace(/\s+/g, "");
          return {
            courses: results
              .filter((course) =>
                `${course.label || course.value || course} ${course.courseName || ""}`
                  .toUpperCase()
                  .replace(/\s+/g, "")
                  .includes(normalizedQuery),
              )
              .slice(0, limit)
              .map((course) =>
                typeof course === "string"
                  ? { label: course }
                  : {
                      label: course.label || course.value,
                      courseCode: course.courseCode,
                      duration: course.duration,
                      courseName: course.courseName,
                    },
              ),
          };
        },
        { readOnlyHint: true },
      ),

      tool(
        "createSchedule",
        "Replace the current schedule with the requested courses and generate the best options.",
        {
          type: "object",
          required: ["courses", "timetableType", "term"],
          properties: {
            courses: courseSchema,
            timetableType: { type: "string", enum: ["UG", "AD", "PS", "GR"] },
            term: { type: "string", enum: ["FW", "SP", "SU"] },
            preferences: preferenceSchema,
            unavailableTimes: blocksSchema,
          },
        },
        async ({
          courses,
          timetableType: nextType,
          term: nextTerm,
          preferences,
          unavailableTimes,
        }) => {
          const labels = courses.map(normalizeCourseLabel);
          if (labels.some((label) => !label))
            throw new Error("Courses must use a label such as COSC 1P02 D2.");
          const uniqueLabels = [...new Set(labels)];
          // Fetch before replacing live state: a typo or unavailable offering must
          // never erase the user's current timetable.
          const loaded = await Promise.all(
            uniqueLabels.map(async (label) => {
              const { cleanCourseCode } = parseCourseLabel(label);
              return {
                label,
                course: await getCourse(cleanCourseCode, nextType, nextTerm),
              };
            }),
          );
          clearAllCourseData();
          clearAllPins();
          clearAllTimeBlockEvents();
          reinitializeTimeSlots();
          stateRef.current.timetableType = nextType;
          stateRef.current.term = nextTerm;
          stateRef.current.addedCourses = [];
          setTimetableType(nextType);
          setTerm(nextTerm);
          setAddedCourses([]);
          preferencesRef.current = preferences || { hard: {}, soft: {} };
          if (unavailableTimes) {
            const blocks = normalizeUnavailableBlocks(unavailableTimes);
            blocks.forEach(addTimeBlockEvent);
            setBlockedTimeSlots(toTimeSlots(unavailableTimes));
            onTimeBlockChange?.();
          }
          return addCourses(
            uniqueLabels,
            { timetableType: nextType, term: nextTerm },
            loaded,
          );
        },
      ),

      tool(
        "addCourses",
        "Add courses to the current schedule and regenerate its options.",
        {
          type: "object",
          required: ["courses"],
          properties: { courses: courseSchema },
        },
        async ({ courses }) => addCourses(courses),
      ),

      tool(
        "previewCourseAddition",
        "Read-only what-if: test adding courses to the current schedule without changing it.",
        {
          type: "object",
          required: ["courses"],
          properties: {
            courses: courseSchema,
            preferences: preferenceSchema,
            limit: { type: "integer", minimum: 1, maximum: 20 },
          },
        },
        async ({ courses, preferences, limit = 5 }) => {
          const labels = courses.map(normalizeCourseLabel);
          if (labels.some((label) => !label))
            throw new Error("Courses must use a label such as COSC 1P02 D2.");
          if (
            labels.some((label) =>
              stateRef.current.addedCourses.includes(label),
            )
          )
            throw new Error(
              "Preview courses must not already be in the schedule.",
            );
          const loaded = await Promise.all(
            [...new Set(labels)].map(async (label) => {
              const { cleanCourseCode } = parseCourseLabel(label);
              return getCourse(
                cleanCourseCode,
                stateRef.current.timetableType,
                stateRef.current.term,
              );
            }),
          );
          const previewPreferences = preferences
            ? {
                hard: {
                  ...preferencesRef.current.hard,
                  ...(preferences.hard || {}),
                },
                soft: {
                  ...preferencesRef.current.soft,
                  ...(preferences.soft || {}),
                },
              }
            : preferencesRef.current;
          ensureCandidates();
          const currentOptions = rankVisibleCandidates(
            candidatesRef.current,
            previewPreferences,
          ).length;
          const durationPins = labels.map((label) => {
            const { cleanCourseCode, duration } = parseCourseLabel(label);
            return `${cleanCourseCode} DURATION ${duration}`;
          });
          const candidates = previewTimetables(loaded, durationPins).map(
            (timetable, index) => ({
              id: `preview:${index}`,
              timetable,
              metrics: getScheduleMetrics(timetable),
            }),
          );
          const ranked = rankVisibleCandidates(candidates, previewPreferences);
          const matchingCandidates = rankScheduleOptions(
            candidates,
            previewPreferences,
          );
          const bestAvailable = rankVisibleCandidates(candidates, {
            ...previewPreferences,
            hard: {},
          })[0];
          const conflictFreeCandidates = visibleCandidates(candidates);
          return {
            previewOnly: true,
            previewCourses: labels,
            currentOptions,
            generatedCombinations: candidates.length,
            matchingCombinations: matchingCandidates.length,
            conflictFreeOptions: conflictFreeCandidates.length,
            totalOptions: ranked.length,
            optionChange: ranked.length - currentOptions,
            excludedByHardPreferences:
              conflictFreeCandidates.length - ranked.length,
            options: ranked
              .slice(0, limit)
              .map((candidate) =>
                describePreviewOption(candidate, previewPreferences),
              ),
            bestAvailableOption:
              ranked.length || !bestAvailable
                ? undefined
                : describePreviewOption(bestAvailable, previewPreferences),
            message: ranked.length
              ? undefined
              : conflictFreeCandidates.length
                ? `${conflictFreeCandidates.length} conflict-free timetable(s) exist, but none satisfy the hard preferences.`
                : "No conflict-free timetable exists with these courses.",
          };
        },
        { readOnlyHint: true },
      ),

      tool(
        "removeCourses",
        "Remove course labels or course codes from the current schedule and regenerate.",
        {
          type: "object",
          required: ["courses"],
          properties: { courses: courseSchema },
        },
        async ({ courses }) => {
          const requested = new Set(courses.map(normalizeCourseCode));
          const removed = stateRef.current.addedCourses.filter((label) =>
            requested.has(normalizeCourseCode(label)),
          );
          if (!removed.length)
            throw new Error(
              "None of those courses are in the current schedule.",
            );
          removed.forEach((label) => {
            const { cleanCourseCode } = parseCourseLabel(label);
            removeCourseData(cleanCourseCode);
            clearCoursePins(cleanCourseCode);
          });
          commitCourses(
            stateRef.current.addedCourses.filter(
              (label) => !removed.includes(label),
            ),
          );
          return {
            removedCourses: removed,
            schedule: scheduleResult(regenerate()),
          };
        },
      ),

      tool(
        "setSchedulePreferences",
        "Set hard requirements and soft timetable preferences, then regenerate and rank options.",
        {
          type: "object",
          required: ["preferences"],
          properties: {
            preferences: preferenceSchema,
            replace: { type: "boolean" },
          },
        },
        async ({ preferences, replace = false }) => {
          preferencesRef.current = replace
            ? preferences
            : {
                hard: {
                  ...preferencesRef.current.hard,
                  ...(preferences.hard || {}),
                },
                soft: {
                  ...preferencesRef.current.soft,
                  ...(preferences.soft || {}),
                },
              };
          return {
            preferences: preferencesRef.current,
            schedule: scheduleResult(publishCandidates()),
          };
        },
      ),

      tool(
        "setUnavailableTimes",
        "Replace or add recurring unavailable class times, then regenerate. Days use M, T, W, R, F, S, U.",
        {
          type: "object",
          required: ["blocks"],
          properties: { blocks: blocksSchema, replace: { type: "boolean" } },
        },
        async ({ blocks, replace = true }) => {
          if (replace) {
            clearAllTimeBlockEvents();
            reinitializeTimeSlots();
          }
          const normalizedBlocks = normalizeUnavailableBlocks(blocks);
          normalizedBlocks.forEach(addTimeBlockEvent);
          setBlockedTimeSlots(toTimeSlots(blocks));
          onTimeBlockChange?.();
          return {
            unavailableTimes: normalizedBlocks,
            schedule: scheduleResult(regenerate()),
          };
        },
      ),

      tool(
        "pinSections",
        "Require specific course sections in generated schedules.",
        {
          type: "object",
          required: ["sections"],
          properties: {
            sections: {
              type: "array",
              items: {
                type: "object",
                required: ["courseCode", "type", "id"],
                properties: {
                  courseCode: { type: "string" },
                  type: { type: "string", enum: ["MAIN", "LAB", "TUT", "SEM"] },
                  id: { type: "string" },
                },
              },
            },
          },
        },
        async ({ sections }) => {
          asArray(sections).forEach(({ courseCode, type, id }) =>
            addPinnedComponent(
              `${normalizeCourseCode(courseCode)} ${type} ${id}`,
            ),
          );
          return {
            pinnedSections: getPinnedComponents(),
            schedule: scheduleResult(regenerate()),
          };
        },
      ),

      tool(
        "unpinSections",
        "Remove requirements for specific course sections and regenerate.",
        {
          type: "object",
          required: ["sections"],
          properties: {
            sections: {
              type: "array",
              items: {
                type: "object",
                required: ["courseCode", "type", "id"],
                properties: {
                  courseCode: { type: "string" },
                  type: { type: "string", enum: ["MAIN", "LAB", "TUT", "SEM"] },
                  id: { type: "string" },
                },
              },
            },
          },
        },
        async ({ sections }) => {
          asArray(sections).forEach(({ courseCode, type, id }) =>
            removePinnedComponent(
              `${normalizeCourseCode(courseCode)} ${type} ${id}`,
            ),
          );
          return {
            pinnedSections: getPinnedComponents(),
            schedule: scheduleResult(regenerate()),
          };
        },
      ),

      tool(
        "searchScheduleOptions",
        "Search and rank generated schedule options without changing the selected option.",
        {
          type: "object",
          properties: {
            preferences: preferenceSchema,
            limit: { type: "integer", minimum: 1, maximum: 20 },
            cursor: { type: "integer", minimum: 0 },
          },
        },
        async ({ preferences = {}, limit = 10, cursor = 0 }) => {
          ensureCandidates();
          const merged = {
            hard: {
              ...preferencesRef.current.hard,
              ...(preferences.hard || {}),
            },
            soft: {
              ...preferencesRef.current.soft,
              ...(preferences.soft || {}),
            },
          };
          const matchingCandidates = rankScheduleOptions(
            candidatesRef.current,
            merged,
          );
          const ranked = visibleCandidates(matchingCandidates);
          return {
            scheduleVersion: scheduleVersionRef.current,
            totalMatches: ranked.length,
            generatedCombinations: candidatesRef.current.length,
            matchingCombinations: matchingCandidates.length,
            nextCursor: cursor + limit < ranked.length ? cursor + limit : null,
            options: ranked
              .slice(cursor, cursor + limit)
              .map((candidate) =>
                describeOption(
                  candidate.id,
                  candidate.timetable,
                  merged,
                  candidate.metrics,
                ),
              ),
          };
        },
        { readOnlyHint: true },
      ),

      tool(
        "getScheduleOptionDetails",
        "Get meeting-by-meeting details for a generated schedule option.",
        {
          type: "object",
          required: ["optionId"],
          properties: { optionId: { type: "string" } },
        },
        async ({ optionId }) => getDetails(candidateById(optionId)),
        { readOnlyHint: true },
      ),

      tool(
        "compareScheduleOptions",
        "Compare two to five generated schedule options.",
        {
          type: "object",
          required: ["optionIds"],
          properties: {
            optionIds: {
              type: "array",
              minItems: 2,
              maxItems: 5,
              items: { type: "string" },
            },
          },
        },
        async ({ optionIds }) => ({
          options: asArray(optionIds)
            .map(candidateById)
            .map((candidate) => getDetails(candidate).option),
        }),
        { readOnlyHint: true },
      ),

      tool(
        "selectScheduleOption",
        "Make a generated timetable option the visible selected schedule.",
        {
          type: "object",
          required: ["optionId"],
          properties: { optionId: { type: "string" } },
        },
        async ({ optionId }) => {
          const candidate = candidateById(optionId);
          if (!candidate)
            throw new Error(
              "That schedule option is no longer available. Search again.",
            );
          const visible = rankVisibleCandidates(
            candidatesRef.current,
            preferencesRef.current,
          );
          const visibleIndex = visible.findIndex(
            (option) => option.id === optionId,
          );
          if (visibleIndex < 0)
            throw new Error(
              "That option is not distinct in the current calendar view. Search again.",
            );
          selectedIdRef.current = optionId;
          stateRef.current.timetables = visible.map(
            (option) => option.timetable,
          );
          setTimetables(stateRef.current.timetables);
          setCurrentTimetableIndex(visibleIndex);
          syncSelectedTimetable(visibleIndex);
          return {
            selectedOption: describeOption(
              optionId,
              candidate.timetable,
              preferencesRef.current,
              candidate.metrics,
            ),
          };
        },
      ),

      tool(
        "getCurrentSchedule",
        "Read the current schedule, preferences, and selected option.",
        { type: "object", properties: {} },
        async () => {
          ensureCandidates();
          const selected =
            candidateById(selectedIdRef.current) || candidatesRef.current[0];
          return {
            courses: stateRef.current.addedCourses,
            timetableType: stateRef.current.timetableType,
            term: stateRef.current.term,
            preferences: preferencesRef.current,
            selected: selected
              ? describeOption(
                  selected.id,
                  selected.timetable,
                  preferencesRef.current,
                  selected.metrics,
                )
              : null,
            scheduleVersion: scheduleVersionRef.current,
          };
        },
        { readOnlyHint: true },
      ),

      tool(
        "exportSchedule",
        "Download the selected schedule as an iCalendar (.ics) file or return its share link.",
        {
          type: "object",
          properties: {
            optionId: { type: "string" },
            format: { type: "string", enum: ["ics", "shareLink"] },
          },
        },
        async ({ optionId, format = "ics" }) => {
          ensureCandidates();
          const candidate =
            candidateById(optionId || selectedIdRef.current) ||
            candidatesRef.current[0];
          if (!candidate) throw new Error("There is no schedule to export.");
          if (format === "shareLink") {
            const visible = rankVisibleCandidates(
              candidatesRef.current,
              preferencesRef.current,
            );
            const visibleIndex = visible.findIndex(
              (option) => option.id === candidate.id,
            );
            if (visibleIndex < 0)
              throw new Error(
                "That option is not distinct in the current calendar view. Search again.",
              );
            stateRef.current.timetables = visible.map(
              (option) => option.timetable,
            );
            setTimetables(stateRef.current.timetables);
            setCurrentTimetableIndex(visibleIndex);
            selectedIdRef.current = candidate.id;
            syncSelectedTimetable(visibleIndex);
            return {
              exportedOptionId: candidate.id,
              shareLink: window.location.href,
            };
          }
          updateExportData(candidate.timetable);
          exportCal({ durationCount: stateRef.current.timetables.length });
          return {
            exportedOptionId: candidate.id,
            filename: "BrockTimetable.ics",
          };
        },
        { consequentialHint: true },
      ),
    ];

    const controller = new AbortController();
    Promise.all(
      tools.map((definition) =>
        modelContext.registerTool(definition, { signal: controller.signal }),
      ),
    ).catch((error) => {
      console.warn("Unable to register WebMCP schedule tools:", error);
    });
    return () => controller.abort();
    // Tool callbacks intentionally read ref-backed live state; re-registering
    // on every timetable change would withdraw tools during agent execution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onTimeBlockChange,
    setAddedCourses,
    setCurrentTimetableIndex,
    setDurations,
    setSelectedDuration,
    setTerm,
    setTimetableType,
    setTimetables,
  ]);
}
