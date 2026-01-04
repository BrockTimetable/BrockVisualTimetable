import {
  getTimeBlockEvents,
  addTimeBlockEvent,
  removeTimeBlockEvent,
} from "@/lib/generator/createCalendarEvents";
import {
  setBlockedTimeSlots,
  setOpenTimeSlots,
} from "@/lib/generator/timeSlots";
import {
  generateTimetables,
  getValidTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";

export const useCalendarEventHandlers = ({
  setCurrentTimetableIndex,
  setTimetables,
  sortOption,
}) => {
  const handleSelect = (selectInfo) => {
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
                existingSlotStart,
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
  };

  const handleSelectAllow = () => {
    return true;
  };

  return {
    handleSelect,
    handleSelectAllow,
  };
};
