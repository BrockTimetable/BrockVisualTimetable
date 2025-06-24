let timeBlockEvents = [];
import { updateExportData } from "./ExportCal";

export const createCalendarEvents = (timetable, getDaysOfWeek, courseColors = {}) => {
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
    const createEvent = (course, component, defaultColor, isAllDay, courseColors) => {
        const uniqueId = getUniqueId(component.id);
        const customColor = courseColors[course.courseCode] || defaultColor;
        
        let title = `${course.courseCode} ${component.type}`;
        if (component.sectionNumber && component.sectionNumber !== component.type) {
            title += ` ${component.sectionNumber}`;
        }
        
        const event = {
            id: uniqueId,
            title: title,
            daysOfWeek: getDaysOfWeek(component.schedule.days || "M T W R F"),
            startRecur: formatDate(component.schedule.startDate, false),
            endRecur: formatDate(component.schedule.endDate, true),
            description: component.instructor,
            color: customColor,
            isPinned: component.pinned,
        };

        if (isAllDay) {
            event.allDay = true;
        } else {
            const [startTime, endTime] = component.schedule.time.split("-");
            event.startTime = formatTime(startTime);
            event.endTime = formatTime(endTime);
        }

        newEvents.push(event);
    };

    const addAllDayEvent = (course, component, color = "default", courseColors) => {
        createEvent(course, component, color, true, courseColors);
    };

    const addTimedEvent = (course, component, color = "default", courseColors) => {
        createEvent(course, component, color, false, courseColors);
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

    timeBlockEvents.forEach(addTimeBlockEvent);

    if (!timetable || !timetable.courses) {
        return newEvents;
    }

    timetable.courses.forEach((course) => {
        const { mainComponents, secondaryComponents } = course;

        if (mainComponents) {
            mainComponents.forEach((mainComponent) => {
                // Handle both SYN and HYF formats
                const isSynchronousOnline = 
                    mainComponent.type.startsWith('SYN') || 
                    mainComponent.type.startsWith('HYF');

                if (!mainComponent.schedule.time) {
                    addAllDayEvent(course, mainComponent, "default", courseColors);
                } else if (isSynchronousOnline) {
                    // Clean up the time string by removing spaces
                    const cleanTime = mainComponent.schedule.time.replace(/\s+/g, '');
                    
                    // For HYF/SYN events, use the time directly if it's in the correct format
                    if (/^\d{3,4}-\d{3,4}$/.test(cleanTime)) {
                        const modifiedComponent = { ...mainComponent };
                        modifiedComponent.schedule = { ...mainComponent.schedule, time: cleanTime };
                        // Ensure days are properly formatted
                        if (modifiedComponent.schedule.days && !modifiedComponent.schedule.days.includes(' ')) {
                            modifiedComponent.schedule.days = modifiedComponent.schedule.days.split('').join(' ');
                        }
                        addTimedEvent(course, modifiedComponent, "default", courseColors);
                    } else {
                        // Try to extract time if it's in the "SYN time" or "HYF time" format
                        const timeMatch = mainComponent.schedule.time.match(/(SYN|HYF)\s*(\d{3,4}\s*-\s*\d{3,4})/);
                        if (timeMatch) {
                            const modifiedComponent = { ...mainComponent };
                            const extractedTime = timeMatch[2].replace(/\s+/g, '');
                            modifiedComponent.schedule = { ...mainComponent.schedule, time: extractedTime };
                            // Ensure days are properly formatted
                            if (modifiedComponent.schedule.days && !modifiedComponent.schedule.days.includes(' ')) {
                                modifiedComponent.schedule.days = modifiedComponent.schedule.days.split('').join(' ');
                            }
                            addTimedEvent(course, modifiedComponent, "default", courseColors);
                        } else {
                            addAllDayEvent(course, mainComponent, "default", courseColors);
                        }
                    }
                } else if (/[a-zA-Z]/.test(mainComponent.schedule.time)) {
                    addAllDayEvent(course, mainComponent, "default", courseColors);
                } else {
                    // Clean up the time string for regular events too
                    const cleanTime = mainComponent.schedule.time.replace(/\s+/g, '');
                    const modifiedComponent = { ...mainComponent };
                    modifiedComponent.schedule = { ...mainComponent.schedule, time: cleanTime };
                    addTimedEvent(course, modifiedComponent, "default", courseColors);
                }
            });
        }

        if (secondaryComponents) {
            const { lab, tutorial, seminar } = secondaryComponents;

            const handleComponent = (component) => {
                if (!component) return;

                const isSynchronousOnline = 
                    component.type.startsWith('SYN') || 
                    component.type.startsWith('HYF');

                if (!component.schedule.time) {
                    addAllDayEvent(course, component, "default", courseColors);
                } else if (isSynchronousOnline) {
                    // Clean up the time string by removing spaces
                    const cleanTime = component.schedule.time.replace(/\s+/g, '');
                    
                    // For HYF/SYN events, use the time directly if it's in the correct format
                    if (/^\d{3,4}-\d{3,4}$/.test(cleanTime)) {
                        const modifiedComponent = { ...component };
                        modifiedComponent.schedule = { ...component.schedule, time: cleanTime };
                        addTimedEvent(course, modifiedComponent, "default", courseColors);
                    } else {
                        // Try to extract time if it's in the "SYN time" or "HYF time" format
                        const timeMatch = component.schedule.time.match(/(SYN|HYF)\s*(\d{3,4}\s*-\s*\d{3,4})/);
                        if (timeMatch) {
                            const modifiedComponent = { ...component };
                            const extractedTime = timeMatch[2].replace(/\s+/g, '');
                            modifiedComponent.schedule = { ...component.schedule, time: extractedTime };
                            addTimedEvent(course, modifiedComponent, "default", courseColors);
                        } else {
                            addAllDayEvent(course, component, "default", courseColors);
                        }
                    }
                } else if (/[a-zA-Z]/.test(component.schedule.time)) {
                    addAllDayEvent(course, component, "default", courseColors);
                } else {
                    // Clean up the time string for regular events too
                    const cleanTime = component.schedule.time.replace(/\s+/g, '');
                    const modifiedComponent = { ...component };
                    modifiedComponent.schedule = { ...component.schedule, time: cleanTime };
                    addTimedEvent(course, modifiedComponent, "default", courseColors);
                }
            };

            handleComponent(lab);
            handleComponent(tutorial);
            handleComponent(seminar);
        }
    });

    updateExportData(timetable);
    return newEvents;
};

export const getDaysOfWeek = (days) => {
    const dayMap = {
        M: "1", T: "2", W: "3", R: "4", F: "5", S: "6", U: "0",
    };

    return days
        .replace(/\s+/g, "")
        .split("")
        .map(day => dayMap[day])
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

const formatDate = (timestamp, isEndDate) => {
    const date = new Date(timestamp * 1000);
    // Always add one day to end dates to make them inclusive
    if (isEndDate) {
        date.setDate(date.getDate() + 1);
    }
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
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

export const isEventPinned = (event) => {
    return event.extendedProps && event.extendedProps.isPinned;
};
