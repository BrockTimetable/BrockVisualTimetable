import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const CourseDetailsContext = createContext();

export const CourseDetailsProvider = ({ children }) => {
  const [courseDetails, setCourseDetails] = useState([]);

  return (
    <CourseDetailsContext.Provider value={{ courseDetails, setCourseDetails }}>
      {children}
    </CourseDetailsContext.Provider>
  );
};

CourseDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
