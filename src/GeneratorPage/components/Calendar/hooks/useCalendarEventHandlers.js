import { useCallback } from "react";
import {
  addPinnedComponent,
  getPinnedComponents,
  removePinnedComponent,
} from "../../../scripts/pinnedComponents";
import {
  getTimeBlockEvents,
  addTimeBlockEvent,
  removeTimeBlockEvent,
} from "../../../scripts/createCalendarEvents";
import {
  setBlockedTimeSlots,
  setOpenTimeSlots,
} from "../../../scripts/timeSlots";
import {
  generateTimetables,
  getValidTimetables,
} from "../../../scripts/timetableGeneration/timetableGeneration";

export const useCalendarEventHandlers = ({
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
}) => {
  const handleEventClick = useCallback(
    (clickInfo) => {
      if (!clickInfo.event.extendedProps.isBlocked) {
        // Handle course component pinning/unpinning
        const split = clickInfo.event.title.split(" ");
        const courseCode = split[0];

        console.log(clickInfo.event.extendedProps);
        console.log(clickInfo.event.extendedProps.isMain);

        if (clickInfo.event.extendedProps.isMain) {
          split[1] = "MAIN";
        }

        const pinnedComponents = getPinnedComponents();

        // Extract base component ID by removing suffix extensions
        // Course IDs can be 6 or 7 digits long. If there are multiple main components
        // (such as two LECs) the additional main components will have an index counter
        // extension (e.g., "-1", "-2") which we need to strip for pinning.
        let baseComponentId = clickInfo.event.id;
        const dashIndex = baseComponentId.indexOf("-");
        if (dashIndex !== -1) {
          baseComponentId = baseComponentId.substring(0, dashIndex);
        }

        const pinString = courseCode + " " + split[1] + " " + baseComponentId;

        if (pinnedComponents.includes(pinString)) {
          removePinnedComponent(pinString);
        } else {
          console.log(pinString);
          addPinnedComponent(pinString);
        }
      } else {
        // Handle time block removal
        const blockId = clickInfo.event.id.replace("block-", "");
        const blockEvent = getTimeBlockEvents().find(
          (block) => block.id === blockId
        );

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
      }

      // Regenerate timetables after pinning/unpinning or unblocking
      setCurrentTimetableIndex(0);
      generateTimetables(sortOption);
      setTimetables(getValidTimetables());
    },
    [setCurrentTimetableIndex, setTimetables, sortOption]
  );

  const handleSelect = useCallback(
    (selectInfo) => {
      const startDateTime = new Date(selectInfo.startStr);
      const endDateTime = new Date(selectInfo.endStr);
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
        const dayName = currentDate.toLocaleString("en-US", {
          weekday: "short",
        });
        if (dayMapping[dayName]) {
          days.push(dayMapping[dayName]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (days.length > 0) {
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

              if (
                !(slotStart >= existingSlotEnd || slotEnd <= existingSlotStart)
              ) {
                combinedSlotStart = Math.min(
                  combinedSlotStart,
                  existingSlotStart
                );
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
        });

        setCurrentTimetableIndex(0);
        generateTimetables(sortOption);
        setTimetables(getValidTimetables());
      }
    },
    [setCurrentTimetableIndex, setTimetables, sortOption]
  );

  const handleSelectAllow = useCallback(() => {
    return true;
  }, []);

  return {
    handleEventClick,
    handleSelect,
    handleSelectAllow,
  };
};
