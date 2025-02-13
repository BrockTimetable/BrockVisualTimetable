import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateTimetables, getValidTimetables } from '../generateTimetables';
import { getCourseData } from '../courseData';
import { getTimeSlots } from '../timeSlots';
import { getPinnedComponents } from '../pinnedComponents';

// Mock dependencies
vi.mock('../courseData');
vi.mock('../timeSlots');
vi.mock('../pinnedComponents');

describe('Edge Cases and Error Handling', () => {
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

    it('should handle invalid time formats gracefully', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [{
                    id: '1',
                    schedule: {
                        days: 'M W',
                        time: 'TBA',  // Invalid time format
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

        expect(timetables.length).toBeGreaterThan(0);
        expect(timetables[0].courses[0].mainComponents[0].schedule.time).toBe('TBA');
    });

    it('should handle empty course data gracefully', () => {
        getCourseData.mockReturnValue({});

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables).toHaveLength(1);
        expect(timetables[0].courses).toHaveLength(0);
    });

    it('should handle missing schedule properties gracefully', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [{
                    id: '1',
                    schedule: {
                        days: '',  // empty string instead of undefined
                        time: '0800-0930',
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

        // Should still generate a timetable even with missing schedule properties
        expect(timetables.length).toBeGreaterThan(0);
        // Verify the section was included despite empty days
        expect(timetables[0].courses[0].mainComponents).toHaveLength(1);
    });

    it('should handle invalid duration formats gracefully', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [{
                    id: '1',
                    schedule: {
                        days: 'M W',
                        time: '0800-0930',
                        duration: 'INVALID',  // invalid duration
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

        // Should still generate a timetable with invalid duration
        expect(timetables.length).toBeGreaterThan(0);
    });

    it('should handle invalid date ranges gracefully', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [{
                    id: '1',
                    schedule: {
                        days: 'M W',
                        time: '0800-0930',
                        duration: 'D2',
                        startDate: 60,  // start date after end date
                        endDate: 1
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

        // Should still generate a timetable with invalid date range
        expect(timetables.length).toBeGreaterThan(0);
    });
}); 