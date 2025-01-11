import React, { createContext, useState } from 'react';

// Visually distinguishable colors that work well for both light and dark themes
// Colors are ordered to maximize contrast between consecutive colors
const defaultColors = [
    '#E74C3C', // Bright Red
    '#3498DB', // Bright Blue
    '#F1C40F', // Bright Yellow
    '#9B59B6', // Purple
    '#2ECC71', // Bright Green
    '#E67E22', // Orange
    '#34495E', // Navy Blue
    '#FF6B6B', // Coral Red
    '#1ABC9C', // Emerald
    '#8E44AD', // Deep Purple
    '#D35400', // Burnt Orange
    '#16A085', // Dark Teal
    '#C0392B', // Dark Red
    '#2980B9', // Dark Blue
    '#27AE60', // Dark Green
];

export const CourseColorsContext = createContext();

export const CourseColorsProvider = ({ children }) => {
    const [courseColors, setCourseColors] = useState({});
    const [usedColors, setUsedColors] = useState([]);
    const [timetableHandlers, setTimetableHandlers] = useState(null);

    const setTimetableUpdateHandlers = (handlers) => {
        setTimetableHandlers(handlers);
    };

    const updateTimetables = () => {
        if (timetableHandlers) {
            const { generateTimetables, getValidTimetables, setTimetables, sortOption } = timetableHandlers;
            generateTimetables(sortOption);
            setTimetables(getValidTimetables());
        }
    };

    const getNextColor = () => {
        const availableColors = defaultColors.filter(color => !usedColors.includes(color));
        if (availableColors.length === 0) {
            // If all colors are used, start over with a slight variation
            const colorIndex = usedColors.length % defaultColors.length;
            return defaultColors[colorIndex];
        }
        return availableColors[0];
    };

    const updateCourseColor = (courseCode, color) => {
        setCourseColors(prev => {
            const oldColor = prev[courseCode];
            if (oldColor) {
                setUsedColors(current => current.filter(c => c !== oldColor));
            }
            setUsedColors(current => [...current, color]);
            return {
                ...prev,
                [courseCode]: color
            };
        });
        updateTimetables();
    };

    const getDefaultColorForCourse = (courseCode) => {
        if (courseColors[courseCode]) {
            return courseColors[courseCode];
        }
        const newColor = getNextColor();
        updateCourseColor(courseCode, newColor);
        return newColor;
    };

    return (
        <CourseColorsContext.Provider value={{ 
            courseColors, 
            updateCourseColor, 
            getDefaultColorForCourse,
            setTimetableUpdateHandlers 
        }}>
            {children}
        </CourseColorsContext.Provider>
    );
}; 