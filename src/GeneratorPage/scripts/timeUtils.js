// Complete time slot lookup table
const TIME_SLOT_LOOKUP = new Map();

// Initialize the complete lookup table
(() => {
    // Generate all possible time combinations from 8:00 to 22:00
    for (let hour = 8; hour <= 22; hour++) {
        const hourStr = hour.toString().padStart(2, '0');
        TIME_SLOT_LOOKUP.set(`${hourStr}00`, (hour - 8) * 2);
        TIME_SLOT_LOOKUP.set(`${hourStr}30`, (hour - 8) * 2 + 1);
    }
})();

/**
 * Converts a time string to a slot number (0-based, 30-minute intervals)
 * @param {string} time - Time in format "HHMM" (e.g., "0800" for 8:00 AM)
 * @returns {number} Slot number
 */
export const timeToSlot = (time) => {
    // Direct lookup from complete table
    return TIME_SLOT_LOOKUP.get(time) ?? (() => {
        // Fallback calculation for any edge cases
        const [hours, minutes] =
            time.length === 3
                ? [parseInt(time[0]), parseInt(time[1] + "0")]
                : [parseInt(time.slice(0, 2)), parseInt(time.slice(2))];
        return (hours - 8) * 2 + (minutes === 30 ? 1 : 0);
    })();
};

/**
 * Checks if a time string represents an asynchronous or online course
 * @param {string} time - Time string to check
 * @returns {boolean} True if the time represents an async/online course
 */
export const isAsyncOrOnline = (time) => {
    return !time || /[a-zA-Z]/.test(time) || time.toUpperCase().includes('ASYNC') || time.toUpperCase().includes('TBA');
};

/**
 * Checks if two time ranges overlap
 * @param {number} start1 - Start of first range
 * @param {number} end1 - End of first range
 * @param {number} start2 - Start of second range
 * @param {number} end2 - End of second range
 * @returns {boolean} True if the ranges overlap
 */
export const doTimeRangesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
}; 