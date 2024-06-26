export const createCalendarEvents = (timetable, getDaysOfWeek) => {
    const newEvents = [];

    const addAllDayEvent = (course, component, color = 'default') => {
        newEvents.push({
            id: component.id,
            title: `${course.courseCode} ${component.type} ${component.sectionNumber}`,
            daysOfWeek: getDaysOfWeek("M T W R F"),
            allDay: true,
            startRecur: formatDate(component.schedule.startDate),
            endRecur: formatDate(component.schedule.endDate),
            description: component.instructor,
            color: color
        });
    };

    const addTimedEvent = (course, component, color = 'default') => {
        console.log(component)
        newEvents.push({
            id: component.id,
            title: `${course.courseCode} ${component.type} ${component.sectionNumber} ${component.pinned ? '📍' : ''}`,
            daysOfWeek: getDaysOfWeek(component.schedule.days),
            startTime: formatTime(component.schedule.time.split('-')[0]),
            endTime: formatTime(component.schedule.time.split('-')[1]),
            startRecur: formatDate(component.schedule.startDate),
            endRecur: formatDate(component.schedule.endDate),
            description: component.instructor,
            color: color
        });
    };

    timetable.courses.forEach(course => {
        const mainComponent = course.mainComponent;
        if (mainComponent) {
            if (!mainComponent.schedule.time) {
                addAllDayEvent(course, mainComponent);
            } else {
                addTimedEvent(course, mainComponent);
            }
        }

        const secondaryComponents = course.secondaryComponents;
        if (secondaryComponents.lab) {
            if (!secondaryComponents.lab.schedule.time) {
                addAllDayEvent(course, secondaryComponents.lab, 'green');
            } else {
                addTimedEvent(course, secondaryComponents.lab, 'green');
            }
        }
        if (secondaryComponents.tutorial) {
            if (!secondaryComponents.tutorial.schedule.time) {
                addAllDayEvent(course, secondaryComponents.tutorial, 'red');
            } else {
                addTimedEvent(course, secondaryComponents.tutorial, 'red');
            }
        }
        if (secondaryComponents.seminar) {
            if (!secondaryComponents.seminar.schedule.time) {
                addAllDayEvent(course, secondaryComponents.seminar, '#ABBD39');
            } else {
                addTimedEvent(course, secondaryComponents.seminar, '#ABBD39');
            }
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
  return days.split(' ').map(day => dayMap[day]);
};

const formatTime = (time) => {
  time = time.trim();
  if (time.length < 4) {
      time = '0' + time;
  }
  if (time.length === 3) {
      time = time.substring(0, 1) + ':' + time.substring(1, 3);
  } else {
      time = time.substring(0, 2) + ':' + time.substring(2, 4);
  }
  return time;
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const year = date.getUTCFullYear();
  const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
  const day = ('0' + date.getUTCDate()).slice(-2);
  return `${year}-${month}-${day}`;
};