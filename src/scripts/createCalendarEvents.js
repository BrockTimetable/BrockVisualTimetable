export const createCalendarEvents = (timetable, getDaysOfWeek) => {
    const newEvents = [];
    
    timetable.courses.forEach(course => {
      const mainComponent = course.mainComponent;
      if (mainComponent) {
        newEvents.push({
          id: mainComponent.id,
          title: `${course.courseCode} ${mainComponent.type} ${mainComponent.id}`,
          daysOfWeek: getDaysOfWeek(mainComponent.days),
          startTime: mainComponent.time.split('-')[0],
          endTime: mainComponent.time.split('-')[1],
          startRecur: mainComponent.startDate,
          endRecur: mainComponent.endDate,
          description: mainComponent.instructor
        });
      }
  
      const secondaryComponents = course.secondaryComponents;
      if (secondaryComponents.lab) {
        newEvents.push({
          id: secondaryComponents.lab.id,
          title: `${course.courseCode} LAB ${secondaryComponents.lab.id}`,
          daysOfWeek: getDaysOfWeek(secondaryComponents.lab.days),
          startTime: secondaryComponents.lab.time.split('-')[0],
          endTime: secondaryComponents.lab.time.split('-')[1],
          startRecur: secondaryComponents.lab.startDate,
          endRecur: secondaryComponents.lab.endDate,
          description: secondaryComponents.lab.instructor,
          description: "",
          color: "green"
        });
      }
      if (secondaryComponents.tut) {
        newEvents.push({
          id: secondaryComponents.tut.id,
          title: `${course.courseCode} TUT ${secondaryComponents.tut.id}`,
          daysOfWeek: getDaysOfWeek(secondaryComponents.tut.days),
          startTime: secondaryComponents.tut.time.split('-')[0],
          endTime: secondaryComponents.tut.time.split('-')[1],
          startRecur: secondaryComponents.tut.startDate,
          endRecur: secondaryComponents.tut.endDate,
          description: "",
          color: "red"
        });
      }
      if (secondaryComponents.sem) {
        newEvents.push({
          id: secondaryComponents.sem.id,
          title: `${course.courseCode} SEM ${secondaryComponents.sem.id}`,
          daysOfWeek: getDaysOfWeek(secondaryComponents.sem.days),
          startTime: secondaryComponents.sem.time.split('-')[0],
          endTime: secondaryComponents.sem.time.split('-')[1],
          startRecur: secondaryComponents.sem.startDate,
          endRecur: secondaryComponents.sem.endDate,
          description: "",
          color: "yellow"
        });
      }
    });
  
    return newEvents;
  };


  export const getDaysOfWeek = (days) => {
    const dayMap = {
      'M': '1',
      'T': '2',
      'W': '3',
      'R': '4',
      'F': '5',
      'S': '6',
      'U': '0'
    };
    return days.split('').map(day => dayMap[day]);
  };  