import React, { createContext, useState } from 'react';

export const CourseDetailsContext = createContext();

export const CourseDetailsProvider = ({ children }) => {
    const [courseDetails, setCourseDetails] = useState([]);

    return (
        <CourseDetailsContext.Provider value={{ courseDetails, setCourseDetails }}>
            {children}
        </CourseDetailsContext.Provider>
    );
};
