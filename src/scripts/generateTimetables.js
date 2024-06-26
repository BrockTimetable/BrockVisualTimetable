import { getCourseData } from './courseData';
import { getTimeSlots } from './timeSlots';
import { getPinnedComponents } from './pinnedComponents';

let validTimetables = [];

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

const isSlotAvailable = (day, startSlot, endSlot, timeSlots) => {
  for (let i = startSlot; i < endSlot; i++) {
    if (timeSlots[day][i]) {
      return false;
    }
  }
  return true;
};

const filterComponentsAgainstTimeSlots = (components, timeSlots) => {
  return components.filter(component => {
    const { days, time } = component.schedule;
    if (!time) return true;
    const startSlot = timeToSlot(time.split("-")[0].trim());
    const endSlot = timeToSlot(time.split("-")[1].trim());
    const daysArray = days.split(' ').filter(day => day);

    for (let day of daysArray) {
      if (!isSlotAvailable(day, startSlot, endSlot, timeSlots)) {
        return false;
      }
    }
    return true;
  });
};

// Cartesian product function
//https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
const cartesianProduct = (arrays) => {
  return arrays.reduce((acc, curr) => {
    return acc.flatMap(d => curr.length > 0 ? curr.map(e => [...d, e]) : [d]);
  }, [[]]);
};

const filterPinned = (components, courseCode, componentType) => {
  const pinnedComponents = getPinnedComponents();
  const coursePinnedComponents = pinnedComponents.filter(p => {
    const [course, type, id] = p.split(" ");
    return course === courseCode && type === componentType;
  });

  if (!coursePinnedComponents.length) {
    return components;
  }

  return components.filter(component => {
    return coursePinnedComponents.some(pinned => {
      const [, , id] = pinned.split(" ");
      return component.id === id;
    });
  });
};

const filterByDuration = (components, duration) => {
  return components.filter(component => component.schedule.duration === duration);
};

const generateSingleCourseCombinations = (course, timeSlots) => {
  const pinnedComponents = getPinnedComponents();
  let validMainComponents = filterComponentsAgainstTimeSlots(course.sections, timeSlots);

  const durationFilter = pinnedComponents.find(p => {
    const [pinnedCourse, type, value] = p.split(" ");
    return pinnedCourse === course.courseCode && type === "DURATION";
  });

  if (durationFilter) {
    const duration = durationFilter.split(" ")[2];
    validMainComponents = filterByDuration(validMainComponents, duration);
    console.log(`Duration Filter for ${course.courseCode}: ${duration}`);
  }

  console.log(`Valid Main Components before pinning for ${course.courseCode}:`, validMainComponents);

  validMainComponents = filterPinned(validMainComponents, course.courseCode, "MAIN");
  const validLabs = filterPinned(filterComponentsAgainstTimeSlots(course.labs, timeSlots), course.courseCode, "LAB");
  const validTutorials = filterPinned(filterComponentsAgainstTimeSlots(course.tutorials, timeSlots), course.courseCode, "TUT");
  const validSeminars = filterPinned(filterComponentsAgainstTimeSlots(course.seminars, timeSlots), course.courseCode, "SEM");

  console.log(`Valid Main Components for ${course.courseCode}:`, validMainComponents);
  console.log(`Valid Labs for ${course.courseCode}:`, validLabs);
  console.log(`Valid Tutorials for ${course.courseCode}:`, validTutorials);
  console.log(`Valid Seminars for ${course.courseCode}:`, validSeminars);

  const singleCourseCombinations = [];

  validMainComponents.forEach(mainComponent => {
    const mainComponentDuration = mainComponent.schedule.duration;
    const validLabsForMainComponent = validLabs.filter(lab => lab.schedule.duration === mainComponentDuration);
    const validTutorialsForMainComponent = validTutorials.filter(tutorial => tutorial.schedule.duration === mainComponentDuration);
    const validSeminarsForMainComponent = validSeminars.filter(seminar => seminar.schedule.duration === mainComponentDuration);

    if (course.labs.length > 0 && validLabsForMainComponent.length === 0) return;
    if (course.tutorials.length > 0 && validTutorialsForMainComponent.length === 0) return;
    if (course.seminars.length > 0 && validSeminarsForMainComponent.length === 0) return;

    const combinations = cartesianProduct([
      validLabsForMainComponent.length > 0 ? validLabsForMainComponent : [null],
      validTutorialsForMainComponent.length > 0 ? validTutorialsForMainComponent : [null],
      validSeminarsForMainComponent.length > 0 ? validSeminarsForMainComponent : [null]
    ]);

    combinations.forEach(([lab, tutorial, seminar]) => {
      singleCourseCombinations.push({
        courseCode: course.courseCode,
        mainComponent: mainComponent,
        secondaryComponents: { lab, tutorial, seminar }
      });
    });
  });

  return singleCourseCombinations;
};

const isTimetableValid = (timetable) => {
  const occupiedSlots = {};

  const overlap = (start1, end1, start2, end2) => {
    return (start1 < end2 && start2 < end1);
  };

  for (const course of timetable) {
    const components = [course.mainComponent, course.secondaryComponents.lab, course.secondaryComponents.tutorial, course.secondaryComponents.seminar].filter(Boolean);
    for (const component of components) {
      const { days, time, startDate, endDate } = component.schedule;
      if (!time) continue;
      const startSlot = timeToSlot(time.split("-")[0].trim());
      const endSlot = timeToSlot(time.split("-")[1].trim());
      const daysArray = days.split(' ').filter(day => day);

      for (const day of daysArray) {
        for (let i = startSlot; i < endSlot; i++) {
          if (!occupiedSlots[day]) occupiedSlots[day] = {};
          for (const [existingStartDate, existingEndDate] of Object.keys(occupiedSlots[day]).map(d => d.split('-').map(Number))) {
            if (overlap(startDate, endDate, existingStartDate, existingEndDate) && occupiedSlots[day][`${existingStartDate}-${existingEndDate}`].includes(i)) {
              return false;
            }
          }
          if (!occupiedSlots[day][`${startDate}-${endDate}`]) occupiedSlots[day][`${startDate}-${endDate}`] = [];
          occupiedSlots[day][`${startDate}-${endDate}`].push(i);
        }
      }
    }
  }

  return true;
};

export const generateTimetables = () => {
  validTimetables = [];
  const courseData = getCourseData();
  const courses = Object.values(courseData);
  const timeSlots = getTimeSlots();

  const allCourseCombinations = courses.map(course => generateSingleCourseCombinations(course, timeSlots));
  console.log('All valid single course combinations:', allCourseCombinations);

  if (allCourseCombinations.some(combinations => combinations.length === 0)) {
    console.log('No valid timetable found due to missing combinations for some courses.');
    validTimetables.push({ courses: [] });
    return
  }

  const allPossibleTimetables = cartesianProduct(allCourseCombinations);
  console.log('All possible timetables before validation:', allPossibleTimetables);

  allPossibleTimetables.forEach(timetable => {
    if (isTimetableValid(timetable)) {
      validTimetables.push({ courses: timetable });
    }
  });

  console.log('Generated timetables:', validTimetables);
};

export const getValidTimetables = () => validTimetables;