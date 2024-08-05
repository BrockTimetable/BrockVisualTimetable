import { getCourseData } from "./courseData";
import { getTimeSlots } from "./timeSlots";
import { getPinnedComponents } from "./pinnedComponents";
import eventBus from "../../SiteWide/Buses/eventBus";

let validTimetables = [];
const maxComboThreshold = 50000; // Maximum number of possible combinations that can be generated. (Around 25k seems to work well on higher-end machines but more testing needed across different device)
let timeslotOverridden = false;

const timeToSlot = (time) => {
    let hours;
    let minutes = 0;
    if (time.length === 3) {
        hours = parseInt(time.substring(0, 1));
        if (time.substring(1, 2) === "3") {
            minutes = 30;
        }
    } else {
        hours = parseInt(time.substring(0, 2));
        if (time.substring(2, 3) === "3") {
            minutes = 30;
        }
    }
    if (minutes === 30) {
        return (hours - 8) * 2 + 1;
    } else {
        return (hours - 8) * 2;
    }
};

const filterComponentsAgainstTimeSlots = (components, timeSlots) => {
    const isSlotAvailable = (day, startSlot, endSlot, timeSlots) => {
        for (let i = startSlot; i < endSlot; i++) {
            if (timeSlots[day][i]) {
                return false;
            }
        }
        return true;
    };

    const calculateBlockedPercentage = (component, timeSlots) => {
        const { days, time } = component.schedule;
        if (!time) return 0;
        const startSlot = timeToSlot(time.split("-")[0].trim());
        const endSlot = timeToSlot(time.split("-")[1].trim());
        const daysArray = days.replace(/\s/g, "").split("");
        const totalSlots = (endSlot - startSlot) * daysArray.length;

        let blockedCount = 0;
        for (let day of daysArray) {
            for (let i = startSlot; i < endSlot; i++) {
                if (timeSlots[day][i]) {
                    blockedCount++;
                }
            }
        }

        return (blockedCount / totalSlots) * 100;
    };

    const blockedComponents = [];
    const availableComponents = components.filter((component, index, originalComponents) => {
        const { days, time } = component.schedule;
        if (!time) return true;
        const startSlot = timeToSlot(time.split("-")[0].trim());
        const endSlot = timeToSlot(time.split("-")[1].trim());
        const daysArray = days.replace(/\s/g, "").split("");

        let isBlocked = false;
        for (let day of daysArray) {
            if (!isSlotAvailable(day, startSlot, endSlot, timeSlots)) {
                isBlocked = true;
                break;
            }
        }

        if (isBlocked) {
            const blockedPercentage = calculateBlockedPercentage(component, timeSlots);
            blockedComponents.push({ component, blockedPercentage });
            return false;
        }

        return true;
    });

    // If all components are blocked, choose the one with the least percentage of blocked slots
    if (availableComponents.length === 0 && blockedComponents.length > 0) {
        blockedComponents.sort((a, b) => a.blockedPercentage - b.blockedPercentage);
        availableComponents.push(blockedComponents[0].component);
		timeslotOverridden = true;
    }

    return availableComponents;
};

// Cartesian product function with early exit
//https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
const cartesianProduct = (arrays, limit) => {
    let result = [[]];
    for (const array of arrays) {
        const temp = [];
        for (const item of array) {
            for (const combination of result) {
                temp.push([...combination, item]);
                if (temp.length >= limit) {
                    eventBus.emit("truncation", true);
                    eventBus.emit("snackbar", {
                        message:
                            "The generated schedule results are truncated because the input is too broad. To ensure all results are considered pin down some courses!",
                        variant: "warning",
                    });
                    return temp;
                } else {
                    eventBus.emit("truncation", false);
                }
            }
        }
        result = temp;
    }
    return result;
};

const filterPinned = (components, courseCode, componentType) => {
    components.forEach(function (component) {
        component.pinned = false;
    });

    const pinnedComponents = getPinnedComponents();
    const coursePinnedComponents = pinnedComponents.filter((p) => {
        const [course, type] = p.split(" ");
        return course === courseCode && type === componentType;
    });

    if (!coursePinnedComponents.length) {
        return components;
    }

    return components.filter((component) => {
        return coursePinnedComponents.some((pinned) => {
            const [, , id] = pinned.split(" ");
            if (component.id === id) {
                component.pinned = true;
                return true;
            }
            return false;
        });
    });
};

const filterByDuration = (components, duration) => {
    return components.filter((component) => component.schedule.duration === duration);
};

const generateSingleCourseCombinations = (course, timeSlots) => {
    const pinnedComponents = getPinnedComponents();

    const durationFilter = pinnedComponents.find((p) => {
        const [pinnedCourse, type, value] = p.split(" ");
        return pinnedCourse === course.courseCode && type === "DURATION";
    });

    let validMainComponents = course.sections;
    if (durationFilter) {
        const duration = durationFilter.split(" ")[2];
        validMainComponents = filterByDuration(validMainComponents, duration);
    }

    validMainComponents = filterComponentsAgainstTimeSlots(validMainComponents, timeSlots);

    validMainComponents = filterPinned(validMainComponents, course.courseCode, "MAIN");

    const validLabs = filterPinned(
        filterComponentsAgainstTimeSlots(
            durationFilter ? filterByDuration(course.labs, durationFilter.split(" ")[2]) : course.labs,
            timeSlots
        ),
        course.courseCode,
        "LAB"
    );

    const validTutorials = filterPinned(
        filterComponentsAgainstTimeSlots(
            durationFilter ? filterByDuration(course.tutorials, durationFilter.split(" ")[2]) : course.tutorials,
            timeSlots
        ),
        course.courseCode,
        "TUT"
    );

    const validSeminars = filterPinned(
        filterComponentsAgainstTimeSlots(
            durationFilter ? filterByDuration(course.seminars, durationFilter.split(" ")[2]) : course.seminars,
            timeSlots
        ),
        course.courseCode,
        "SEM"
    );

    const singleCourseCombinations = [];

    validMainComponents.forEach((mainComponent) => {
        const mainComponentDuration = mainComponent.schedule.duration;
        const validLabsForMainComponent = validLabs.filter((lab) => lab.schedule.duration === mainComponentDuration);
        const validTutorialsForMainComponent = validTutorials.filter(
            (tutorial) => tutorial.schedule.duration === mainComponentDuration
        );
        const validSeminarsForMainComponent = validSeminars.filter(
            (seminar) => seminar.schedule.duration === mainComponentDuration
        );

        if (course.labs.length > 0 && validLabsForMainComponent.length === 0) return;
        if (course.tutorials.length > 0 && validTutorialsForMainComponent.length === 0) return;
        if (course.seminars.length > 0 && validSeminarsForMainComponent.length === 0) return;

        const combinations = cartesianProduct(
            [
                validLabsForMainComponent.length > 0 ? validLabsForMainComponent : [null],
                validTutorialsForMainComponent.length > 0 ? validTutorialsForMainComponent : [null],
                validSeminarsForMainComponent.length > 0 ? validSeminarsForMainComponent : [null],
            ],
            maxComboThreshold
        );

        combinations.forEach(([lab, tutorial, seminar]) => {
            singleCourseCombinations.push({
                courseCode: course.courseCode,
                mainComponent: mainComponent,
                secondaryComponents: { lab, tutorial, seminar },
            });
        });
    });

    return singleCourseCombinations;
};

const isTimetableValid = (timetable) => {
    const occupiedSlots = {};

    const overlap = (start1, end1, start2, end2) => {
        return start1 < end2 && start2 < end1;
    };

    for (const course of timetable) {
        const components = [
            course.mainComponent,
            course.secondaryComponents.lab,
            course.secondaryComponents.tutorial,
            course.secondaryComponents.seminar,
        ].filter(Boolean);
        for (const component of components) {
            const { days, time, startDate, endDate } = component.schedule;
            if (!time) continue;
            const startSlot = timeToSlot(time.split("-")[0].trim());
            const endSlot = timeToSlot(time.split("-")[1].trim());
            const daysArray = days.split(" ").filter((day) => day);

            for (const day of daysArray) {
                for (let i = startSlot; i < endSlot; i++) {
                    if (!occupiedSlots[day]) occupiedSlots[day] = {};
                    for (const [existingStartDate, existingEndDate] of Object.keys(occupiedSlots[day]).map((d) =>
                        d.split("-").map(Number)
                    )) {
                        if (
                            overlap(startDate, endDate, existingStartDate, existingEndDate) &&
                            occupiedSlots[day][`${existingStartDate}-${existingEndDate}`].includes(i)
                        ) {
                            return false;
                        }
                    }
                    if (!occupiedSlots[day][`${startDate}-${endDate}`])
                        occupiedSlots[day][`${startDate}-${endDate}`] = [];
                    occupiedSlots[day][`${startDate}-${endDate}`].push(i);
                }
            }
        }
    }

    return true;
};

const generateCombinationsIteratively = (courseCombinations, maxCombinations) => {
    let results = [];
    let count = 0;

    const generate = (prefix, arrays) => {
        if (arrays.length === 0) {
            results.push(prefix);
            count++;
            if (count >= maxCombinations) {
                eventBus.emit("truncation", true);
                eventBus.emit("snackbar", {
                    message:
                        "The generated schedule results are truncated! Click the yellow '!' icon for more information!",
                    variant: "warning",
                });
                return false;
            }
            eventBus.emit("truncation", false);
            return true;
        }

        const [first, ...rest] = arrays;
        for (const item of first) {
            if (!generate([...prefix, item], rest)) {
                return false;
            }
        }
        return true;
    };

    generate([], courseCombinations);
    return results;
};

export const generateTimetables = () => {
	eventBus.emit("overridden", false);
	timeslotOverridden = false;
    validTimetables = [];
    const courseData = getCourseData();
    const courses = Object.values(courseData);
    const timeSlots = getTimeSlots();

    const allCourseCombinations = courses.map((course) => generateSingleCourseCombinations(course, timeSlots));
    //console.log('All valid single course combinations:', allCourseCombinations);

    if (allCourseCombinations.some((combinations) => combinations.length === 0)) {
        //console.log('No valid timetable found due to missing combinations for some courses.');
        validTimetables.push({ courses: [] });
        return;
    }

    let allPossibleTimetables = generateCombinationsIteratively(allCourseCombinations, maxComboThreshold);
    //console.log('All possible timetables before validation:', allPossibleTimetables);

    allPossibleTimetables.forEach((timetable) => {
        if (isTimetableValid(timetable)) {
            validTimetables.push({ courses: timetable });
        }
    });

	if (timeslotOverridden) {
		eventBus.emit("overridden", true);
		eventBus.emit("snackbar", {
			message:
				"All available options for this component are partially blocked by your time constraints. The best available option with the least overlap has been selected.",
			variant: "warning",
		});
	}

};

export const getValidTimetables = () => validTimetables;
