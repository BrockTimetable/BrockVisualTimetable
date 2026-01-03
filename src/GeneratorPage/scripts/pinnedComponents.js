import { getBaseComponentId } from "./timetableGeneration/utils/componentIDUtils";

const createEmptyComponentPins = () => ({
  MAIN: new Set(),
  LAB: new Set(),
  TUT: new Set(),
  SEM: new Set(),
});

let pinnedState = {
  durations: new Map(),
  components: new Map(),
};

const normalizeCourseCode = (courseCode) => {
  if (!courseCode) return "";
  return String(courseCode).replace(/\s+/g, "").toUpperCase();
};

const normalizeComponentType = (componentType) => {
  if (!componentType) return "";
  const upper = String(componentType).toUpperCase();
  if (upper.startsWith("LAB")) return "LAB";
  if (upper.startsWith("TUT")) return "TUT";
  if (upper.startsWith("SEM")) return "SEM";
  if (upper === "MAIN") return "MAIN";
  return upper;
};

const getCourseComponentPins = (courseCode, createIfMissing = false) => {
  const key = normalizeCourseCode(courseCode);
  if (!key) return null;
  if (!pinnedState.components.has(key)) {
    if (!createIfMissing) return null;
    pinnedState.components.set(key, createEmptyComponentPins());
  }
  return pinnedState.components.get(key);
};

export const pinCourseDuration = (courseCode, duration) => {
  const key = normalizeCourseCode(courseCode);
  if (!key) return;
  pinnedState.durations.set(key, String(duration));
};

export const clearCourseDuration = (courseCode) => {
  const key = normalizeCourseCode(courseCode);
  if (!key) return;
  pinnedState.durations.delete(key);
};

export const getPinnedDuration = (courseCode) => {
  const key = normalizeCourseCode(courseCode);
  if (!key) return null;
  return pinnedState.durations.get(key) || null;
};

export const pinComponent = (courseCode, componentType, componentId) => {
  const key = normalizeCourseCode(courseCode);
  const normalizedType = normalizeComponentType(componentType);
  if (!key || !normalizedType || !componentId) return;

  const coursePins = getCourseComponentPins(key, true);
  if (!coursePins || !coursePins[normalizedType]) return;

  const baseId = getBaseComponentId(String(componentId));
  coursePins[normalizedType].add(baseId);
};

export const unpinComponent = (courseCode, componentType, componentId) => {
  const key = normalizeCourseCode(courseCode);
  const normalizedType = normalizeComponentType(componentType);
  if (!key || !normalizedType || !componentId) return;

  const coursePins = getCourseComponentPins(key);
  if (!coursePins || !coursePins[normalizedType]) return;

  const baseId = getBaseComponentId(String(componentId));
  coursePins[normalizedType].delete(baseId);
};

export const toggleComponentPin = (courseCode, componentType, componentId) => {
  if (isComponentPinned(courseCode, componentType, componentId)) {
    unpinComponent(courseCode, componentType, componentId);
    return false;
  }
  pinComponent(courseCode, componentType, componentId);
  return true;
};

export const isComponentPinned = (courseCode, componentType, componentId) => {
  const key = normalizeCourseCode(courseCode);
  const normalizedType = normalizeComponentType(componentType);
  if (!key || !normalizedType || !componentId) return false;

  const coursePins = getCourseComponentPins(key);
  if (!coursePins || !coursePins[normalizedType]) return false;

  const baseId = getBaseComponentId(String(componentId));
  return coursePins[normalizedType].has(baseId);
};

export const getPinnedComponentIds = (courseCode, componentType) => {
  const key = normalizeCourseCode(courseCode);
  const normalizedType = normalizeComponentType(componentType);
  if (!key || !normalizedType) return [];

  const coursePins = getCourseComponentPins(key);
  if (!coursePins || !coursePins[normalizedType]) return [];

  return Array.from(coursePins[normalizedType]);
};

export const clearCoursePins = (courseCode) => {
  const key = normalizeCourseCode(courseCode);
  if (!key) return;
  pinnedState.durations.delete(key);
  pinnedState.components.delete(key);
};

export const clearAllPins = () => {
  pinnedState = {
    durations: new Map(),
    components: new Map(),
  };
};
