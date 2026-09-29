import {
  addPinnedComponent,
  getPinnedComponents,
  removePinnedComponent,
} from "@/lib/generator/pinnedComponents";
import {
  getTimeBlockEvents,
  addTimeBlockEvent,
  removeTimeBlockEvent,
  updateTimeBlockEventTitle,
} from "@/lib/generator/createCalendarEvents";
import {
  setBlockedTimeSlots,
  setOpenTimeSlots,
} from "@/lib/generator/timeSlots";
import {
  generateTimetables,
  getValidTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";
import {
  getNormalizedSelectionWindow,
  getSelectionDayCodes,
  toSlotRange,
} from "./selectionUtils.js";

// Extract the complex logic for handling course component clicks
export const handleCourseComponentClick = (
  clickInfo,
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
) => {
  const split = clickInfo.event.title.split(" ");
  const courseCode = split[0];

  if (clickInfo.event.extendedProps.isMain) {
    split[1] = "MAIN";
  }

  const pinnedComponents = getPinnedComponents();

  // Extract base component ID by removing suffix extensions
  let baseComponentId = clickInfo.event.id;
  const dashIndex = baseComponentId.indexOf("-");
  if (dashIndex !== -1) {
    baseComponentId = baseComponentId.substring(0, dashIndex);
  }

  const pinString = courseCode + " " + split[1] + " " + baseComponentId;

  if (pinnedComponents.includes(pinString)) {
    removePinnedComponent(pinString);
  } else {
    addPinnedComponent(pinString);
  }

  // Regenerate timetables
  setCurrentTimetableIndex(0);
  generateTimetables(sortOption);
  setTimetables(getValidTimetables());
};

// Extract the complex logic for handling time block removal
export const handleTimeBlockRemoval = (
  clickInfo,
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
  onTimeBlockChange,
) => {
  const blockId = clickInfo.event.id.replace("block-", "");
  const blockEvent = getTimeBlockEvents().find((block) => block.id === blockId);

  if (blockEvent) {
    const slotStart =
      (parseInt(blockEvent.startTime.split(":")[0]) - 8) * 2 +
      parseInt(blockEvent.startTime.split(":")[1]) / 30;
    const slotEnd =
      (parseInt(blockEvent.endTime.split(":")[0]) - 8) * 2 +
      parseInt(blockEvent.endTime.split(":")[1]) / 30;
    const slotsToUnblock = [];

    for (let i = slotStart; i < slotEnd; i++) {
      slotsToUnblock.push(i);
    }

    const unblockedSlots = {
      [blockEvent.daysOfWeek.trim()]: slotsToUnblock,
    };
    setOpenTimeSlots(unblockedSlots);
    removeTimeBlockEvent(blockId);
  }

  // Regenerate timetables
  setCurrentTimetableIndex(0);
  generateTimetables(sortOption);
  setTimetables(getValidTimetables());
  onTimeBlockChange?.();
};

export const handleBlockedSlotRename = (
  blockId,
  newTitle,
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
  onTimeBlockChange,
) => {
  updateTimeBlockEventTitle(blockId, newTitle);

  setCurrentTimetableIndex(0);
  generateTimetables(sortOption);
  setTimetables(getValidTimetables());
  onTimeBlockChange?.();
};

const getSlotFromTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours - 8) * 2 + minutes / 30;
};

const formatTimeFromSlot = (slot) =>
  `${Math.floor(slot / 2) + 8}:${slot % 2 === 0 ? "00" : "30"}`;

const addTimeBlocks = (
  days,
  slotStart,
  slotEnd,
  title = "",
  uniqueIds = false,
) => {
  const newBlockIds = [];

  days.forEach((day) => {
    const existingBlocks = getTimeBlockEvents();
    let combinedSlotStart = slotStart;
    let combinedSlotEnd = slotEnd;
    const blocksToRemove = [];

    for (const block of existingBlocks) {
      if (block.daysOfWeek.trim() !== day) continue;

      const existingSlotStart = getSlotFromTime(block.startTime);
      const existingSlotEnd = getSlotFromTime(block.endTime);
      if (!(slotStart >= existingSlotEnd || slotEnd <= existingSlotStart)) {
        combinedSlotStart = Math.min(combinedSlotStart, existingSlotStart);
        combinedSlotEnd = Math.max(combinedSlotEnd, existingSlotEnd);
        blocksToRemove.push(block.id);
      }
    }

    const slotsToBlock = Array.from(
      { length: combinedSlotEnd - combinedSlotStart },
      (_, index) => combinedSlotStart + index,
    );
    setBlockedTimeSlots({ [day]: slotsToBlock });
    blocksToRemove.forEach(removeTimeBlockEvent);

    const blockId = uniqueIds
      ? `${Date.now()}-${day}-${Math.random().toString(36).slice(2, 8)}`
      : `${Date.now()}-${day}`;
    addTimeBlockEvent({
      id: blockId,
      title,
      daysOfWeek: day,
      startTime: formatTimeFromSlot(combinedSlotStart),
      endTime: formatTimeFromSlot(combinedSlotEnd),
      startRecur: "1970-01-01",
      endRecur: "9999-12-31",
    });
    newBlockIds.push(blockId);
  });

  return newBlockIds;
};

export const handleTimeBlockCreation = (
  { days, startTime, endTime, title = "" },
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
  onTimeBlockChange,
) => {
  const slotStart = getSlotFromTime(startTime);
  const slotEnd = getSlotFromTime(endTime);
  if (
    !days?.length ||
    !Number.isFinite(slotStart) ||
    !Number.isFinite(slotEnd) ||
    slotStart < 0 ||
    slotEnd > 28 ||
    slotEnd <= slotStart
  ) {
    return;
  }

  addTimeBlocks(days, slotStart, slotEnd, title.trim(), true);
  setCurrentTimetableIndex(0);
  generateTimetables(sortOption);
  setTimetables(getValidTimetables());
  onTimeBlockChange?.();
};

export const handleTimeBlockUpdate = (
  blockId,
  { days, startTime, endTime, title = "" },
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
  onTimeBlockChange,
) => {
  const block = getTimeBlockEvents().find(
    (timeBlock) => timeBlock.id === blockId,
  );
  const slotStart = getSlotFromTime(startTime);
  const slotEnd = getSlotFromTime(endTime);
  if (
    !block ||
    !days?.length ||
    !Number.isFinite(slotStart) ||
    !Number.isFinite(slotEnd) ||
    slotStart < 0 ||
    slotEnd > 28 ||
    slotEnd <= slotStart
  ) {
    return;
  }

  const previousStart = getSlotFromTime(block.startTime);
  const previousEnd = getSlotFromTime(block.endTime);
  setOpenTimeSlots({
    [block.daysOfWeek.trim()]: Array.from(
      { length: previousEnd - previousStart },
      (_, index) => previousStart + index,
    ),
  });
  removeTimeBlockEvent(blockId);
  addTimeBlocks(days, slotStart, slotEnd, title.trim(), true);

  setCurrentTimetableIndex(0);
  generateTimetables(sortOption);
  setTimetables(getValidTimetables());
  onTimeBlockChange?.();
};

// Extract the complex logic for handling calendar selection
export const handleCalendarSelection = (
  selectInfo,
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
  setRenameDialogOpen,
  setBlockToRename,
  setRenameAnchorEl,
  setRenameAnchorPosition,
  onTimeBlockChange,
) => {
  const startDateTime = new Date(selectInfo.startStr);
  const endDateTime = new Date(selectInfo.endStr);
  const normalizedWindow = getNormalizedSelectionWindow(
    startDateTime,
    endDateTime,
  );
  if (!normalizedWindow) return;

  const { slotStart, slotEnd } = toSlotRange(
    normalizedWindow.selectionStartMinutes,
    normalizedWindow.selectionEndMinutes,
  );
  if (slotEnd <= slotStart) return;

  const days = getSelectionDayCodes(startDateTime, endDateTime);

  if (days.length > 0) {
    const newBlockIds = addTimeBlocks(days, slotStart, slotEnd);

    // Show rename dialog once for all newly created blocks
    if (newBlockIds.length > 0) {
      setBlockToRename({
        ids: newBlockIds,
        title: "",
        isMultipleBlocks: newBlockIds.length > 1,
      });

      let anchorPosition = { top: 200, left: window.innerWidth / 2 };

      if (selectInfo.jsEvent) {
        const clickX = selectInfo.jsEvent.clientX;
        const clickY = selectInfo.jsEvent.clientY;

        anchorPosition = {
          top: clickY + 20,
          left: Math.max(20, Math.min(clickX, window.innerWidth - 320)),
        };
      }

      setRenameAnchorEl(document.querySelector(".fc-view-harness"));
      setRenameAnchorPosition(anchorPosition);
      setRenameDialogOpen(true);
    }

    setCurrentTimetableIndex(0);
    generateTimetables(sortOption);
    setTimetables(getValidTimetables());
    onTimeBlockChange?.();
  }
};
