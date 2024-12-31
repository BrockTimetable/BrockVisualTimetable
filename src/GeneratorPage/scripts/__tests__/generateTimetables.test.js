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

describe('Timetable Generation', () => {
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
        // Mock course data with a single course having one section
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

    it('should handle time slot conflicts correctly', () => {
        // Mock course data with multiple sections to trigger truncation
        const mockCourseData = {
            'COSC 1P02': {
                courseCode: 'COSC 1P02',
                sections: Array(100).fill(0).map((_, i) => ({
                    id: `${i}`,
                    schedule: {
                        days: 'M W',
                        time: '0800-0920',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                })),
                labs: Array(100).fill(0).map((_, i) => ({
                    id: `L${i}`,
                    schedule: {
                        days: 'R',
                        time: '1000-1150',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                })),
                tutorials: Array(100).fill(0).map((_, i) => ({
                    id: `T${i}`,
                    schedule: {
                        days: 'F',
                        time: '0900-0950',
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
                        time: '1000-1120',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                })),
                labs: Array(100).fill(0).map((_, i) => ({
                    id: `L${i}`,
                    schedule: {
                        days: 'R',
                        time: '1300-1450',
                        duration: 'D2',
                        startDate: 1,
                        endDate: 60
                    }
                })),
                tutorials: [],
                seminars: []
            }
        };

        // Mock timeSlots to show some slots as blocked
        const blockedTimeSlots = {
            M: Array(28).fill(false).map((_, i) => i < 4), // Block morning slots
            T: Array(28).fill(false),
            W: Array(28).fill(false).map((_, i) => i < 4), // Block morning slots
            R: Array(28).fill(false),
            F: Array(28).fill(false)
        };
        getTimeSlots.mockReturnValue(blockedTimeSlots);

        // Mock getCourseData
        getCourseData.mockReturnValue(mockCourseData);

        generateTimetables();
        const timetables = getValidTimetables();

        // Since some slots are blocked, the code should try to find alternatives
        expect(timetables.length).toBeGreaterThan(0);
        
        // Check all eventBus.emit calls
        const emitCalls = eventBus.emit.mock.calls;
        
        // Verify that the overridden event was emitted at least once
        const overriddenCalls = emitCalls.filter(call => call[0] === 'overridden');
        expect(overriddenCalls.length).toBeGreaterThan(0);
        
        // The first call should be overridden: false
        expect(overriddenCalls[0]).toEqual(['overridden', false]);
        
        // Verify that the truncation event was emitted
        const truncationCalls = emitCalls.filter(call => call[0] === 'truncation');
        expect(truncationCalls.length).toBeGreaterThan(0);
        expect(truncationCalls.some(call => call[1] === true)).toBe(true);
        
        // Verify that a warning snackbar was shown about truncation
        const snackbarCalls = emitCalls.filter(call => 
            call[0] === 'snackbar' && 
            call[1].variant === 'warning' &&
            call[1].message.includes('truncated')
        );
        expect(snackbarCalls.length).toBeGreaterThan(0);
    });

    it('should respect pinned components', () => {
        // Mock course data with multiple sections
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
                            days: 'T R',
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

        // Pin section 2
        const pinnedComponents = ['COSC 1P02 MAIN 2'];
        getPinnedComponents.mockReturnValue(pinnedComponents);

        // Mock empty time slots (all slots available)
        const emptyTimeSlots = {
            M: Array(28).fill(false),
            T: Array(28).fill(false),
            W: Array(28).fill(false),
            R: Array(28).fill(false),
            F: Array(28).fill(false)
        };
        getTimeSlots.mockReturnValue(emptyTimeSlots);

        generateTimetables();
        const timetables = getValidTimetables();

        // The code should generate timetables with the pinned component
        expect(timetables.length).toBeGreaterThan(0);
        
        // At least one timetable should have the pinned component
        const hasPinnedTimetable = timetables.some(timetable => {
            const mainComponents = timetable.courses[0].mainComponents;
            return mainComponents.some(component => component.id === '2');
        });
        expect(hasPinnedTimetable).toBe(true);
    });

    it('should handle courses with labs and tutorials', () => {
        // Mock course data with sections, labs, and tutorials
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
        // Mock course data with different waiting times
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

    it('should filter components by duration when duration is pinned', () => {
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
                            days: 'T R',
                            time: '1000-1120',
                            duration: 'D3',
                            startDate: 1,
                            endDate: 60
                        }
                    }
                ],
                labs: [
                    {
                        id: 'LAB1',  // Should match section 1
                        schedule: {
                            days: 'F',
                            time: '1000-1150',
                            duration: 'D2',  // Matches both pinned duration and section 1's duration
                            startDate: 1,
                            endDate: 60
                        }
                    },
                    {
                        id: 'LAB2',  // Should not match any section (wrong duration)
                        schedule: {
                            days: 'F',
                            time: '1300-1450',
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

        // Pin duration D2
        getPinnedComponents.mockReturnValue(['COSC 1P02 DURATION D2']);

        generateTimetables();
        const timetables = getValidTimetables();

        // Should only include sections with duration D2
        expect(timetables.length).toBeGreaterThan(0);
        
        // Verify that all components have duration D2
        const validTimetables = timetables.filter(timetable => {
            const course = timetable.courses[0];
            // Check main components have D2 duration
            const mainComponentsValid = course.mainComponents.every(component => 
                component.schedule.duration === 'D2'
            );
            // Check lab components match both the pinned duration and their main component's duration
            const lab = course.secondaryComponents.lab;
            const labValid = lab ? (
                lab.schedule.duration === 'D2' && 
                lab.schedule.duration === course.mainComponents[0].schedule.duration
            ) : true;
            return mainComponentsValid && labValid;
        });

        expect(validTimetables.length).toBeGreaterThan(0);
        expect(validTimetables.length).toBe(1); // Only one valid combination

        // Verify that only section 1 and its matching lab are included
        expect(validTimetables.every(timetable => {
            const course = timetable.courses[0];
            const mainComponent = course.mainComponents[0];
            const lab = course.secondaryComponents.lab;
            return mainComponent.id === '1' && (!lab || lab.id === 'LAB1');
        })).toBe(true);
    });

    it('should handle date range conflicts correctly', () => {
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
                        time: '0800-0920',
                        duration: 'D2',
                        startDate: 31,  // No overlap with COSC 1P02
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

        // Should allow courses with same time slots but non-overlapping dates
        expect(timetables.length).toBeGreaterThan(0);
        expect(timetables[0].courses).toHaveLength(2);
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
                            time: '0800-0920',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    }
                ],
                labs: [
                    {
                        id: 'L1',  // Should match section 1
                        schedule: {
                            days: 'R',
                            time: '1000-1150',
                            duration: 'D2',
                            startDate: 1,
                            endDate: 60
                        }
                    },
                    {
                        id: 'L2',  // Should not match section 1
                        schedule: {
                            days: 'R',
                            time: '1300-1450',
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

        // Should only match labs with matching section numbers
        expect(timetables.every(timetable => {
            const course = timetable.courses[0];
            const mainSection = course.mainComponents[0];
            const lab = course.secondaryComponents.lab;
            return lab.id.charAt(3) === mainSection.id.charAt(3);
        })).toBe(true);
    });

    it('should handle empty course data gracefully', () => {
        getCourseData.mockReturnValue({});

        generateTimetables();
        const timetables = getValidTimetables();

        expect(timetables).toHaveLength(1);
        expect(timetables[0].courses).toHaveLength(0);
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

        // Should still generate a timetable
        expect(timetables.length).toBeGreaterThan(0);
        // The invalid time format should be handled without errors
        expect(timetables[0].courses[0].mainComponents[0].schedule.time).toBe('TBA');
    });
}); 