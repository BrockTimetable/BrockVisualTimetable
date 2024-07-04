let timeSlots = {};

const initializeTimeSlots = () => {
    const days = ['M', 'T', 'W', 'R', 'F'];
    const slotsPerDay = (22 - 8) * 2;
  
    for (let day of days) {
      timeSlots[day] = new Array(slotsPerDay).fill(false);
    }
}

export const getTimeSlots = () => timeSlots;

export const setBlockedTimeSlots = (blockedSlots) => {
  for (let day in blockedSlots) {
      if (timeSlots[day]) {
          for (let slot of blockedSlots[day]) {
              if (slot >= 0 && slot < timeSlots[day].length) {
                  timeSlots[day][slot] = true;
              }
          }
      }
  }
};

export const setOpenTimeSlots = (blockedSlots) => {
    for (let day in blockedSlots) {
        if (timeSlots[day]) {
            for (let slot of blockedSlots[day]) {
                if (slot >= 0 && slot < timeSlots[day].length) {
                    timeSlots[day][slot] = false;
                }
            }
        }
    }
  };

initializeTimeSlots();