// Use Map for O(1) lookups and better memory management
let courseData = new Map();

// Cache for frequently accessed section combinations
const sectionCombinationCache = new Map();

/*
Note: In cases where we have multiple main course components, (such as two LECs)
the additional components by default have a section ID of "0". In order to associate
the two components together the "0" id is replaced with the primary main course component ID.
*/
const replaceSectionId = (sections) => {
    const sectionMap = new Map();
    
    // First pass: build lookup map
    sections.forEach(section => {
        const key = `${section.schedule.duration}-${section.sectionNumber}`;
        if (!sectionMap.has(key)) {
            sectionMap.set(key, []);
        }
        sectionMap.get(key).push(section);
    });
    
    // Second pass: replace IDs
    sections.forEach(section => {
        if (section.id === "0") {
            const key = `${section.schedule.duration}-${section.sectionNumber}`;
            const matches = sectionMap.get(key);
            const matchingSection = matches?.find(s => s.id !== "0");
            if (matchingSection) {
                section.id = matchingSection.id;
            }
        }
    });
};

const initializeCourseData = (courseCode) => {
    if (!courseData.has(courseCode)) {
        courseData.set(courseCode, {
            sections: [],
            labs: [],
            tutorials: [],
            seminars: [],
            courseCode
        });
    }
};

export const storeCourseData = (course) => {
    const { courseCode, sections, labs, tutorials, seminars } = course;
    
    initializeCourseData(courseCode);
    const courseEntry = courseData.get(courseCode);
    
    // Clear existing data
    courseEntry.sections = [];
    courseEntry.labs = [];
    courseEntry.tutorials = [];
    courseEntry.seminars = [];
    
    // Add new data
    courseEntry.sections.push(...sections);
    replaceSectionId(courseEntry.sections);
    courseEntry.labs.push(...labs);
    courseEntry.tutorials.push(...tutorials);
    courseEntry.seminars.push(...seminars);
    
    // Clear cache for this course
    clearCombinationCache(courseCode);
};

export const getCourseData = () => {
    // Convert Map to plain object for compatibility
    const result = {};
    for (const [key, value] of courseData) {
        result[key] = value;
    }
    return result;
};

export const removeCourseData = (courseCode) => {
    const sanitizedCourseCode = courseCode.replace(" ", "");
    courseData.delete(sanitizedCourseCode);
    clearCombinationCache(sanitizedCourseCode);
};

export const clearAllCourseData = () => {
    courseData.clear();
    sectionCombinationCache.clear();
};

// Helper functions for caching
const getCombinationCacheKey = (courseCode, type) => `${courseCode}-${type}`;

const clearCombinationCache = (courseCode) => {
    for (const key of sectionCombinationCache.keys()) {
        if (key.startsWith(courseCode)) {
            sectionCombinationCache.delete(key);
        }
    }
};

export const getCachedCombinations = (courseCode, type) => {
    const key = getCombinationCacheKey(courseCode, type);
    return sectionCombinationCache.get(key);
};

export const storeCachedCombinations = (courseCode, type, combinations) => {
    const key = getCombinationCacheKey(courseCode, type);
    sectionCombinationCache.set(key, combinations);
};