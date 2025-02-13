import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateTimetables, getValidTimetables } from '../generateTimetables';
import { getCourseData } from '../courseData';
import { getTimeSlots } from '../timeSlots';
import { getPinnedComponents } from '../pinnedComponents';

// Mock dependencies
vi.mock('../courseData');
vi.mock('../timeSlots');
vi.mock('../pinnedComponents');

describe('Basic Timetable Generation', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
        
        // Setup default time slots (all slots available)
        const emptyTimeSlots = {
            M: Array(28).fill(false),
            T: Array(28).fill(false),
            W: Array(28).fill(false),
            R: Array(28).fill(false),
            F: Array(28).fill(false)
        };
        getTimeSlots.mockReturnValue(emptyTimeSlots);
        
        // Default no pinned components
        getPinnedComponents.mockReturnValue([]);
    });

    it('should generate valid timetables for a single course with one section', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [{
                    id: '1',
                    schedule: {
                        days: 'M W',
                        time: '0800-0920',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                }],
                labs: [],
                tutorials: [],
                seminars: []
            }
        };
        getCourseData.mockReturnValue(mockCourseData);

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables).toHaveLength(1);
        expect(timetables[0].courses).toHaveLength(1);
        expect(timetables[0].courses[0].courseCode).toBe('COSC 1P02');
    });

    it('should handle courses with labs and tutorials', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [{
                    id: '1',
                    schedule: {
                        days: 'M W',
                        time: '0800-0920',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                }],
                labs: [{
                    id: 'L1',
                    schedule: {
                        days: 'R',
                        time: '1000-1150',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                }],
                tutorials: [{
                    id: 'T1',
                    schedule: {
                        days: 'F',
                        time: '0900-0950',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                }],
                seminars: []
            }
        };
        getCourseData.mockReturnValue(mockCourseData);

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables).toHaveLength(1);
        expect(timetables[0].courses[0].secondaryComponents.lab).toBeTruthy();
        expect(timetables[0].courses[0].secondaryComponents.tutorial).toBeTruthy();
    });

    it('should sort timetables by waiting time when specified', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [
                    {
                        id: '1',
                        schedule: {
                            days: 'M W',
                            time: '0800-0920',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    },
                    {
                        id: '2',
                        schedule: {
                            days: 'M',
                            time: '0800-0920',
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

        generateTimetables('sortByWaitingTime');
        const timetables = getValidTimetables();

        expect(timetables).toHaveLength(2);
        // The timetable with less waiting time (one day) should be first
        expect(timetables[0].courses[0].mainComponents[0].schedule.days).toBe('M');
    });

    it('should handle empty course data gracefully', () => {
        getCourseData.mockReturnValue({});

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables).toHaveLength(1);
        expect(timetables[0].courses).toHaveLength(0);
    });
}); 