/**
 * Manages time slots for course scheduling using TypedArrays for efficient memory usage and operations.
 * Handles a week's worth of 30-minute time slots from 8am to 10pm.
 */
class TimeSlotManager {
    constructor() {
        // 5 days (M-F) x 28 slots per day (8am-10pm in 30min increments)
        this.slots = new Uint8Array(5 * 28);
        this.daysMap = { 'M': 0, 'T': 1, 'W': 2, 'R': 3, 'F': 4 };
    }

    isSlotAvailable(day, startSlot, endSlot) {
        const dayOffset = this.daysMap[day] * 28;
        const slotView = new Uint8Array(this.slots.buffer, dayOffset, endSlot - startSlot);
        return !slotView.some(slot => slot === 1);
    }

    markSlots(day, startSlot, endSlot, value = 1) {
        const dayOffset = this.daysMap[day] * 28;
        for (let i = startSlot; i < endSlot; i++) {
            this.slots[dayOffset + i] = value;
        }
    }

    clear() {
        this.slots.fill(0);
    }
}

// Export singleton instance
export const timeSlotManager = new TimeSlotManager(); 