import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateTimetables, getValidTimetables } from '../generateTimetables';
import { getCourseData } from '../courseData';
import { getTimeSlots } from '../timeSlots';
import { getPinnedComponents } from '../pinnedComponents';

// Mock dependencies
vi.mock('../courseData');
vi.mock('../timeSlots');
vi.mock('../pinnedComponents');

describe('Component Matching and Filtering', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        const emptyTimeSlots = {
            M: Array(28).fill(false),
            T: Array(28).fill(false),
            W: Array(28).fill(false),
            R: Array(28).fill(false),
            F: Array(28).fill(false)
        };
        getTimeSlots.mockReturnValue(emptyTimeSlots);
        getPinnedComponents.mockReturnValue([]);
    });

    it('should respect pinned components', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [
                    {
                        id: '1',
                        schedule: {
                            days: 'M W',
                            time: '0800-0930',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    },
                    {
                        id: '2',
                        schedule: {
                            days: 'T R',
                            time: '0800-0930',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    }
                ],
                labs: [],
                tutorials: [],
                seminars: []
            }
        };
        getCourseData.mockReturnValue(mockCourseData);

        const pinnedComponents = ['COSC 1P02 MAIN 2'];
        getPinnedComponents.mockReturnValue(pinnedComponents);

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables.length).toBeGreaterThan(0);
        
        const hasPinnedTimetable = timetables.some(timetable => {
            const mainComponents = timetable.courses[0].mainComponents;
            return mainComponents.some(component => component.id === '2');
        });
        expect(hasPinnedTimetable).toBe(true);
    });

    it('should filter components by duration when duration is pinned', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [
                    {
                        id: '1',
                        schedule: {
                            days: 'M W',
                            time: '0800-0930',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    },
                    {
                        id: '2',
                        schedule: {
                            days: 'T R',
                            time: '1000-1130',
                            duration: 'D3',
                            startDate: 1,
                            endDate: 60
                        }
                    }
                ],
                labs: [
                    {
                        id: 'LAB1',
                        schedule: {
                            days: 'F',
                            time: '1000-1200',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    },
                    {
                        id: 'LAB2',
                        schedule: {
                            days: 'F',
                            time: '1300-1500',
                            duration: 'D3',
                            startDate: 1,
                            endDate: 60
                        }
                    }
                ],
                tutorials: [],
                seminars: []
            }
        };
        getCourseData.mockReturnValue(mockCourseData);

        getPinnedComponents.mockReturnValue(['COSC 1P02 DURATION D2']);

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables.length).toBeGreaterThan(0);
        
        const validTimetables = timetables.filter(timetable => {
            const course = timetable.courses[0];
            const mainComponentsValid = course.mainComponents.every(component => 
                component.schedule.duration === 'D2'
            );
            const lab = course.secondaryComponents.lab;
            const labValid = lab ? (
                lab.schedule.duration === 'D2' && 
                lab.schedule.duration === course.mainComponents[0].schedule.duration
            ) : true;
            return mainComponentsValid && labValid;
        });

        expect(validTimetables.length).toBeGreaterThan(0);
        expect(validTimetables.length).toBe(1);

        expect(validTimetables.every(timetable => {
            const course = timetable.courses[0];
            const mainComponent = course.mainComponents[0];
            const lab = course.secondaryComponents.lab;
            return mainComponent.id === '1' && (!lab || lab.id === 'LAB1');
        })).toBe(true);
    });

    it('should match secondary components with their correct main sections', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [
                    {
                        id: '1',
                        schedule: {
                            days: 'M W',
                            time: '0800-0930',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    }
                ],
                labs: [
                    {
                        id: 'L1',
                        schedule: {
                            days: 'R',
                            time: '1000-1200',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    },
                    {
                        id: 'L2',
                        schedule: {
                            days: 'R',
                            time: '1300-1500',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    }
                ],
                tutorials: [],
                seminars: []
            }
        };
        getCourseData.mockReturnValue(mockCourseData);

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables.every(timetable => {
            const course = timetable.courses[0];
            const mainSection = course.mainComponents[0];
            const lab = course.secondaryComponents.lab;
            return lab.id.charAt(3) === mainSection.id.charAt(3);
        })).toBe(true);
    });
}); 