let courseData = {};

const replaceSectionId = (sections) => {
  sections.forEach(section => {
    if (section.id === "0") {
      const matchingSection = sections.find(s => 
        s.id !== "0" && 
        s.schedule.duration === section.schedule.duration && 
        s.sectionNumber === section.sectionNumber
      );
      if (matchingSection) {
        section.id = matchingSection.id;
      }
    }
  });
};

export const storeCourseData = (course) => {
  const { courseCode, sections, labs, tutorials, seminars } = course;
  
  if (!courseData[courseCode]) {
    courseData[courseCode] = { sections: [], labs: [], tutorials: [], seminars: [] };
  }

  courseData[courseCode].courseCode = courseCode;
  courseData[courseCode].sections.push(...sections);
  replaceSectionId(courseData[courseCode].sections);
  courseData[courseCode].labs.push(...labs);
  courseData[courseCode].tutorials.push(...tutorials);
  courseData[courseCode].seminars.push(...seminars);
};

export const getCourseData = () => courseData;

export const removeCourseData = (courseCode) => {
  courseCode = courseCode.replace(" ", "");
  delete courseData[courseCode];
};