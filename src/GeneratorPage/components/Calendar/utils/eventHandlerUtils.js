import { toggleComponentPin } from "../../../scripts/pinnedComponents";
import {
  getTimeBlockEvents,
  addTimeBlockEvent,
  removeTimeBlockEvent,
  updateTimeBlockEventTitle,
} from "../../../scripts/createCalendarEvents";
import {
  setBlockedTimeSlots,
  setOpenTimeSlots,
} from "../../../scripts/timeSlots";
import {
  generateTimetables,
  getValidTimetables,
} from "../../../scripts/timetableGeneration/timetableGeneration";
import { getBaseComponentId } from "../../../scripts/timetableGeneration/utils/componentIDUtils";

// Extract the complex logic for handling course component clicks
export const handleCourseComponentClick = (
  clickInfo,
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
) => {
  const { extendedProps, title } = clickInfo.event;
  const isMain = extendedProps.isMain;
  let courseCode = extendedProps.courseCode;
  let componentType = extendedProps.componentType;

  if (!courseCode || !componentType) {
    const titleMatch = title.match(/^([A-Za-z]+\s?\d+[A-Za-z]?\d*)\s+(\S+)/);
    if (!courseCode && titleMatch) {
      courseCode = titleMatch[1];
    }
    if (!componentType && titleMatch) {
      componentType = titleMatch[2];
    }
  }

  if (!courseCode || !componentType) {
    const fallbackParts = title.split(" ");
    courseCode = courseCode || fallbackParts[0] || "UNKNOWN";
    componentType = componentType || fallbackParts[1] || "UNKNOWN";
  }

  if (componentType) {
    componentType = componentType.toUpperCase();
  }

  if (isMain) {
    componentType = "MAIN";
  } else if (componentType) {
    if (componentType.startsWith("LAB")) {
      componentType = "LAB";
    } else if (componentType.startsWith("TUT")) {
      componentType = "TUT";
    } else if (componentType.startsWith("SEM")) {
      componentType = "SEM";
    }
  }

  // Extract base component ID by removing suffix extensions
  const rawComponentId = extendedProps.componentId || clickInfo.event.id || "";
  const baseComponentId = getBaseComponentId(rawComponentId);

  const isPinnedNow = toggleComponentPin(
    courseCode,
    componentType,
    baseComponentId,
  );
  if (clickInfo.event && clickInfo.event.setExtendedProp) {
    clickInfo.event.setExtendedProp("isPinned", isPinnedNow);
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
};

export const handleBlockedSlotRename = (
  blockId,
  newTitle,
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
) => {
  updateTimeBlockEventTitle(blockId, newTitle);

  setCurrentTimetableIndex(0);
  generateTimetables(sortOption);
  setTimetables(getValidTimetables());
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
) => {
  const startDateTime = new Date(selectInfo.startStr);
  const endDateTime = new Date(selectInfo.endStr);
  const startTime =
    startDateTime.getHours() + ":" + (startDateTime.getMinutes() || "00");
  const endTime =
    endDateTime.getHours() + ":" + (endDateTime.getMinutes() || "00");
  const slotStart =
    (startDateTime.getHours() - 8) * 2 + startDateTime.getMinutes() / 30;
  const slotEnd =
    (endDateTime.getHours() - 8) * 2 + endDateTime.getMinutes() / 30;

  const dayMapping = {
    Mon: "M",
    Tue: "T",
    Wed: "W",
    Thu: "R",
    Fri: "F",
    Sat: "S",
    Sun: "U",
  };

  // Get all days between start and end date
  const days = [];
  let currentDate = new Date(startDateTime);
  while (currentDate <= endDateTime) {
    const dayName = currentDate.toLocaleString("en-US", { weekday: "short" });
    if (dayMapping[dayName]) {
      days.push(dayMapping[dayName]);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (days.length > 0) {
    const slotsToBlock = [];
    for (let i = slotStart; i <= slotEnd - 1; i++) {
      slotsToBlock.push(i);
    }

    // Track all newly created block IDs
    const newBlockIds = [];

    // Handle each day separately
    days.forEach((day) => {
      const existingBlocks = getTimeBlockEvents();
      let combinedSlotStart = slotStart;
      let combinedSlotEnd = slotEnd;
      let blocksToRemove = [];

      for (let block of existingBlocks) {
        if (block.daysOfWeek.trim() === day) {
          const existingStartParts = block.startTime.split(":");
          const existingSlotStart =
            (parseInt(existingStartParts[0]) - 8) * 2 +
            parseInt(existingStartParts[1]) / 30;
          const existingEndParts = block.endTime.split(":");
          const existingSlotEnd =
            (parseInt(existingEndParts[0]) - 8) * 2 +
            parseInt(existingEndParts[1]) / 30;

          if (!(slotStart >= existingSlotEnd || slotEnd <= existingSlotStart)) {
            combinedSlotStart = Math.min(combinedSlotStart, existingSlotStart);
            combinedSlotEnd = Math.max(combinedSlotEnd, existingSlotEnd);
            blocksToRemove.push(block.id);
          }
        }
      }

      const combinedSlots = [];
      for (let i = combinedSlotStart; i < combinedSlotEnd; i++) {
        combinedSlots.push(i);
      }

      const combinedSlotsObject = { [day]: combinedSlots };
      setBlockedTimeSlots(combinedSlotsObject);

      for (let blockId of blocksToRemove) {
        removeTimeBlockEvent(blockId);
      }

      const blockId = Date.now().toString() + "-" + day;
      const block = {
        id: blockId,
        title: "", // Empty title initially, will be set by rename dialog
        daysOfWeek: day,
        startTime: `${Math.floor(combinedSlotStart / 2) + 8}:${
          combinedSlotStart % 2 === 0 ? "00" : "30"
        }`,
        endTime: `${Math.floor(combinedSlotEnd / 2) + 8}:${
          combinedSlotEnd % 2 === 0 ? "00" : "30"
        }`,
        startRecur: "1970-01-01",
        endRecur: "9999-12-31",
      };
      addTimeBlockEvent(block);
      newBlockIds.push(blockId);
    });

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
  }
};
