/*
NOTE: This code manages the availability of time slots for a weekly schedule (Monday to Sunday) between 8 AM and 10 PM.

The timeSlots object is a JavaScript object where each key (representing a day, like 'M' for Monday) maps to a 1D array. 
Each array contains boolean values indicating whether a time slot is open (false) or blocked (true).
*/
let timeSlots = {};

const initializeTimeSlots = () => {
    const days = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];
    const slotsPerDay = (22 - 8) * 2; // Each hour has 2 slots (30 minutes each)

    days.forEach(day => {
        timeSlots[day] = Array(slotsPerDay).fill(false);
    });
};

export const getTimeSlots = () => timeSlots;

const updateSlots = (slots, value) => {
    for (let day in slots) {
        if (timeSlots[day]) {
            slots[day].forEach(slot => {
                if (slot >= 0 && slot < timeSlots[day].length) {
                    timeSlots[day][slot] = value;
                }
            });
        }
    }
};

export const setBlockedTimeSlots = (blockedSlots) => {
    updateSlots(blockedSlots, true);
};

export const setOpenTimeSlots = (blockedSlots) => {
    updateSlots(blockedSlots, false);
};

initializeTimeSlots();
