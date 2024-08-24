let timeBlockEvents = [];

export const createCalendarEvents = (timetable, getDaysOfWeek) => {
    const newEvents = [];

    /*
    Note: In cases where we have multiple main course components, (such as two LECs)
    the components will have the same ID and as such we have to append an index counter
    to create unique IDs for each calendar event.
    */
    const getUniqueId = (baseId) => {
        let counter = 1;
        let uniqueId = baseId;
        while (newEvents.some((event) => event.id === uniqueId)) {
            uniqueId = `${baseId}-${counter}`;
            counter++;
        }
        return uniqueId;
    };

    const addAllDayEvent = (course, component, color = "default") => {
        const uniqueId = getUniqueId(component.id);
        newEvents.push({
            id: uniqueId,
            title: `${course.courseCode} ${component.type} ${component.sectionNumber} ${component.pinned ? "📌" : ""}`,
            daysOfWeek: getDaysOfWeek("M T W R F"),
            allDay: true,
            startRecur: formatDate(component.schedule.startDate),
            endRecur: formatDate(component.schedule.endDate),
            description: component.instructor,
            color: color,
        });
    };

    const addTimedEvent = (course, component, color = "default") => {
        const uniqueId = getUniqueId(component.id);
        newEvents.push({
            id: uniqueId,
            title: `${course.courseCode} ${component.type} ${component.sectionNumber} ${component.pinned ? "📌" : ""}`,
            daysOfWeek: getDaysOfWeek(component.schedule.days),
            startTime: formatTime(component.schedule.time.split("-")[0]),
            endTime: formatTime(component.schedule.time.split("-")[1]),
            startRecur: formatDate(component.schedule.startDate),
            endRecur: formatDate(component.schedule.endDate),
            description: component.instructor,
            color: color,
        });
    };

    const addTimeBlockEvent = (block) => {
        newEvents.push({
            id: `block-${block.id}`,
            daysOfWeek: getDaysOfWeek(block.daysOfWeek),
            startTime: block.startTime,
            endTime: block.endTime,
            startRecur: block.startRecur,
            endRecur: "9999-12-31",
            color: "grey",
            extendedProps: {
                isBlocked: true,
            },
        });
    };

    timeBlockEvents.forEach((block) => {
        addTimeBlockEvent(block);
    });

    if (!timetable) {
        return newEvents;
    }

    if (!timetable.courses) {
        return newEvents;
    }

    timetable.courses.forEach((course) => {
        const mainComponents = course.mainComponents;
        if (mainComponents) {
            mainComponents.forEach((mainComponent) => {
                /*
                NOTE: Alphabetic character test check is needed as actual times do not contain alphabetic characters
                while project courses and field trip courses do and do not have specific assigned times.
                */
                if (!mainComponent.schedule.time || /[a-zA-Z]/.test(mainComponent.schedule.time)) {
                    addAllDayEvent(course, mainComponent);
                } else {
                    addTimedEvent(course, mainComponent);
                }
            });
        }

        const secondaryComponents = course.secondaryComponents;
        if (secondaryComponents.lab) {
            if (!secondaryComponents.lab.schedule.time) {
                addAllDayEvent(course, secondaryComponents.lab, "green");
            } else {
                addTimedEvent(course, secondaryComponents.lab, "green");
            }
        }
        if (secondaryComponents.tutorial) {
            if (!secondaryComponents.tutorial.schedule.time) {
                addAllDayEvent(course, secondaryComponents.tutorial, "red");
            } else {
                addTimedEvent(course, secondaryComponents.tutorial, "red");
            }
        }
        if (secondaryComponents.seminar) {
            if (!secondaryComponents.seminar.schedule.time) {
                addAllDayEvent(course, secondaryComponents.seminar, "#ABBD39");
            } else {
                addTimedEvent(course, secondaryComponents.seminar, "#ABBD39");
            }
        }
    });

    return newEvents;
};

export const getDaysOfWeek = (days) => {
    const dayMap = {
        M: "1",
        T: "2",
        W: "3",
        R: "4",
        F: "5",
        S: "6",
        U: "0",
    };
    return days.split(" ").map((day) => dayMap[day]);
};

const formatTime = (time) => {
    time = time.trim();
    if (time.length < 4) {
        time = "0" + time;
    }
    if (time.length === 3) {
        time = time.substring(0, 1) + ":" + time.substring(1, 3);
    } else {
        time = time.substring(0, 2) + ":" + time.substring(2, 4);
    }
    return time;
};

const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const year = date.getUTCFullYear();
    const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
    const day = ("0" + date.getUTCDate()).slice(-2);
    return `${year}-${month}-${day}`;
};

export const getTimeBlockEvents = () => {
    return timeBlockEvents;
};

export const addTimeBlockEvent = (block) => {
    timeBlockEvents.push(block);
};

export const removeTimeBlockEvent = (blockId) => {
    timeBlockEvents = timeBlockEvents.filter((block) => block.id !== blockId);
};
