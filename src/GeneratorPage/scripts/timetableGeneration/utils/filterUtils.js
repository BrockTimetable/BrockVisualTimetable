import { getBaseComponentId } from "./componentIDUtils";
import {
  timeToSlot,
  isSlotAvailable,
  calculateBlockedPercentage,
} from "./timeUtils";
import { getPinnedComponents } from "../../pinnedComponents";
import { emitTimetableOverridden } from "./notifierUtils";

export const filterComponentsAgainstTimeSlots = (
  components,
  timeSlots,
  enableFallback = false
) => {
  const timeRegex = /[a-zA-Z]/;
  const groupedComponents = new Map();
  const blockedComponents = [];
  const availableGroups = [];

  for (const component of components) {
    const groupId = getBaseComponentId(component.id);
    if (!groupedComponents.has(groupId)) {
      groupedComponents.set(groupId, []);
    }
    groupedComponents.get(groupId).push(component);
  }

  for (const [, group] of groupedComponents) {
    let isGroupBlocked = false;
    let blockedPercentage = 0;

    for (const component of group) {
      const { days, time } = component.schedule;
      if (!time || timeRegex.test(time)) continue;

      const [startSlot, endSlot] = time
        .split("-")
        .map((t) => timeToSlot(t.trim()));
      const daysArray = days.replace(/\s/g, "").split("");

      for (const day of daysArray) {
        if (!isSlotAvailable(timeSlots, day, startSlot, endSlot)) {
          isGroupBlocked = true;
          blockedPercentage += calculateBlockedPercentage(component, timeSlots);
          break;
        }
      }

      if (isGroupBlocked) break;
    }

    if (isGroupBlocked) {
      blockedComponents.push({ group, blockedPercentage });
    } else {
      availableGroups.push(group);
    }
  }

  if (
    enableFallback &&
    availableGroups.length === 0 &&
    blockedComponents.length > 0
  ) {
    emitTimetableOverridden();
    blockedComponents.sort((a, b) => a.blockedPercentage - b.blockedPercentage);
    availableGroups.push(blockedComponents[0].group);
    return {
      availableGroups: availableGroups.flat(),
      blockedComponents,
      fallbackTriggered: true,
    };
  }

  return {
    availableGroups: availableGroups.flat(),
    blockedComponents,
    fallbackTriggered: false,
  };
};

export const filterPinned = (components, courseCode, componentType) => {
  components.forEach((component) => (component.pinned = false));
  const pinnedComponents = getPinnedComponents();

  const coursePinnedComponents = pinnedComponents.filter((p) => {
    const [course, type] = p.split(" ");
    return course === courseCode && type === componentType;
  });

  if (!coursePinnedComponents.length) return components;

  return components.filter((component) => {
    return coursePinnedComponents.some((pinned) => {
      const [, , id] = pinned.split(" ");
      const baseComponentId = getBaseComponentId(component.id);
      if (baseComponentId === id) {
        component.pinned = true;
        return true;
      }
      return false;
    });
  });
};

export const filterByDuration = (components, duration) => {
  return components.filter(
    (component) => component.schedule.duration === duration
  );
};
