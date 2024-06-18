let timeSlots = {};

const initializeTimeSlots = () => {
    const days = ['M', 'T', 'W', 'R', 'F'];
    const slotsPerDay = (22 - 8) * 2;
  
    for (let day of days) {
      timeSlots[day] = new Array(slotsPerDay).fill(false);
    }
}

export const getTimeSlots = () => timeSlots;

initializeTimeSlots();