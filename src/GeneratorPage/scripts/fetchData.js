import axios from "axios";

const API_BASE_URL = "https://api.brocktimetable.com/api";

const fetchData = async (endpoint, params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

export const getCourse = async (courseCode, timetableType, session) => {
  return fetchData("getCourse", { courseCode, timetableType, session });
};

export const getNameList = (timetableType, session) => {
  return fetchData("getNameList", { timetableType, session });
};
