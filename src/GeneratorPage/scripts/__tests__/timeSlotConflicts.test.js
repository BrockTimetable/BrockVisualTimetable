import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateTimetables, getValidTimetables } from '../generateTimetables';
import { getCourseData } from '../courseData';
import { getTimeSlots } from '../timeSlots';
import { getPinnedComponents } from '../pinnedComponents';
import eventBus from '../../../SiteWide/Buses/eventBus';

// Mock dependencies
vi.mock('../courseData');
vi.mock('../timeSlots');
vi.mock('../pinnedComponents');
vi.mock('../../../SiteWide/Buses/eventBus', () => ({
    default: {
        emit: vi.fn()
    }
}));

describe('Time Slot Conflict Handling', () => {
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

    it('should handle time slot conflicts correctly', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: Array(100).fill(0).map((_, i) => ({
                    id: `${i}`,
                    schedule: {
                        days: 'M W',
                        time: '0800-0930',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                })),
                labs: Array(100).fill(0).map((_, i) => ({
                    id: `L${i}`,
                    schedule: {
                        days: 'R',
                        time: '1000-1200',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                })),
                tutorials: Array(100).fill(0).map((_, i) => ({
                    id: `T${i}`,
                    schedule: {
                        days: 'F',
                        time: '0900-1000',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                })),
                seminars: []
            },
            'MATH 1P01': {
                courseCode: 'MATH 1P01',
                sections: Array(100).fill(0).map((_, i) => ({
                    id: `${i}`,
                    schedule: {
                        days: 'M W',
                        time: '1000-1130',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                })),
                labs: Array(100).fill(0).map((_, i) => ({
                    id: `L${i}`,
                    schedule: {
                        days: 'R',
                        time: '1300-1500',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                })),
                tutorials: [],
                seminars: []
            }
        };
        getCourseData.mockReturnValue(mockCourseData);

        const blockedTimeSlots = {
            M: Array(28).fill(false).map((_, i) => i < 4),
            T: Array(28).fill(false),
            W: Array(28).fill(false).map((_, i) => i < 4),
            R: Array(28).fill(false),
            F: Array(28).fill(false)
        };
        getTimeSlots.mockReturnValue(blockedTimeSlots);

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables.length).toBeGreaterThan(0);
        
        const emitCalls = eventBus.emit.mock.calls;
        const overriddenCalls = emitCalls.filter(call => call[0] === 'overridden');
        expect(overriddenCalls.length).toBeGreaterThan(0);
        expect(overriddenCalls[0]).toEqual(['overridden', false]);
        
        const truncationCalls = emitCalls.filter(call => call[0] === 'truncation');
        expect(truncationCalls.length).toBeGreaterThan(0);
        expect(truncationCalls.some(call => call[1] === true)).toBe(true);
        
        const snackbarCalls = emitCalls.filter(call => 
            call[0] === 'snackbar' && 
            call[1].variant === 'warning' &&
            call[1].message.includes('truncated')
        );
        expect(snackbarCalls.length).toBeGreaterThan(0);
    });

    it('should handle date range conflicts correctly', () => {
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: [{
                    id: '1',
                    schedule: {
                        days: 'M W',
                        time: '0800-0930',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 30
                    }
                }],
                labs: [],
                tutorials: [],
                seminars: []
            },
            'MATH 1P01': {
                courseCode: 'MATH 1P01',
                sections: [{
                    id: '1',
                    schedule: {
                        days: 'M W',
                        time: '0800-0930',
                        duration: 'D2',
                        startDate: 31,
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
        expect(timetables[0].courses).toHaveLength(2);
    });

    it('should avoid blocked time slots when alternative sections are available', () => {
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
                            days: 'M W',
                            time: '1000-1130',
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

        const blockedTimeSlots = {
            M: Array(28).fill(false).map((_, i) => i < 4),
            T: Array(28).fill(false),
            W: Array(28).fill(false).map((_, i) => i < 4),
            R: Array(28).fill(false),
            F: Array(28).fill(false)
        };
        getTimeSlots.mockReturnValue(blockedTimeSlots);

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables.length).toBeGreaterThan(0);

        timetables.forEach(timetable => {
            const section = timetable.courses[0].mainComponents[0];
            expect(section.id).toBe('2');
            expect(section.schedule.time).toBe('1000-1130');
        });
    });
}); 