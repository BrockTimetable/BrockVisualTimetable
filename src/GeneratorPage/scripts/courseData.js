let courseData = {};

export const storeCourseData = (course) => {
  const { courseCode, sections, labs, tutorials, seminars } = course;
  if (!courseData[courseCode]) {
    courseData[courseCode] = { sections: [], labs: [], tutorials: [], seminars: [] };
  }
  courseData[courseCode].courseCode = courseCode;
  courseData[courseCode].sections.push(...sections);
  courseData[courseCode].labs.push(...labs);
  courseData[courseCode].tutorials.push(...tutorials);
  courseData[courseCode].seminars.push(...seminars);
};

export const getCourseData = () => courseData;

export const removeCourseData = (courseCode) => {
  courseCode = courseCode.replace(" ", "");
  delete courseData[courseCode];
};