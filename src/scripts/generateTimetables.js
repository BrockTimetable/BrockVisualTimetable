import { getCourseData } from './courseData';

let validTimetables = [];

export const generateTimetables = () => {
  validTimetables = []; 
  const courseData = getCourseData();
  
  // This is dummy logic (Fake timetable) for testing
  const timetable1 = {
    courses: [
      {
        courseCode: 'COSC1P02',
        mainComponent: { 
          id: '1', 
          days: 'MWF', 
          time: '09:00-10:00', 
          startDate: '2024-09-01', 
          endDate: '2024-09-30', 
          instructor: 'Dr. Smith', 
          type: "LEC"
        },
        secondaryComponents: {
          lab: { 
            id: '2', 
            days: 'T', 
            time: '11:00-12:00', 
            startDate: '2024-09-01', 
            endDate: '2024-09-30', 
            type: "LAB"
          },
          sem: { 
            id: '3', 
            days: 'R', 
            time: '13:00-14:00', 
            startDate: '2024-09-01', 
            endDate: '2024-09-30', 
            type: "SEM"
          },
          tut: { 
            id: '4', 
            days: 'F', 
            time: '15:00-16:00', 
            startDate: '2024-09-01', 
            endDate: '2024-09-30', 
            type: "TUT"
          }
        }
      }
    ]
  };

  const timetable2 = {
    courses: [
      {
        courseCode: 'COSC1P03',
        mainComponent: { 
          id: '2', 
          days: 'TR', 
          time: '11:00-12:30', 
          startDate: '2024-09-01', 
          endDate: '2024-09-30', 
          instructor: 'Dr. Jones', 
          type: "LEC"
        },
        secondaryComponents: {
          lab: null,
          sem: null,
          tut: null
        }
      }
    ]
  };

  validTimetables.push(timetable1, timetable2);

  console.log('Generated timetables:', validTimetables);
};

export const getValidTimetables = () => validTimetables;