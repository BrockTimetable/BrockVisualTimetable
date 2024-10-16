import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { useSnackbar } from 'notistack';
import ReactGA from 'react-ga4';

import CourseSearchComponent from './InputFormComponents/CourseSearchComponent';
import TermSelectComponent from './InputFormComponents/TermSelectComponent';
import TimeTableSelectComponent from './InputFormComponents/TimeTableSelectComponent';
import AddButtonComponent from './InputFormComponents/AddButtonComponent';
import CourseListComponent from './InputFormComponents/CourseListComponent';
import MultiLineSnackbar from '../../SiteWide/components/MultiLineSnackbar';

import { storeCourseData, removeCourseData } from '../scripts/courseData';
import { getCourse, getNameList } from '../scripts/fetchData';
import { generateTimetables, getValidTimetables } from '../scripts/generateTimetables';
import { addPinnedComponent, clearCoursePins } from '../scripts/pinnedComponents';

export default function InputFormComponent({ setTimetables, setSelectedDuration, setDurations }) {
	const { enqueueSnackbar } = useSnackbar();
	const [term, setTerm] = useState('NOVALUE');
	const [courseCode, setCourseCode] = useState('');
	const [courseInputValue, setCourseInputValue] = useState('');
	const [timetableType, setTimetableType] = useState('NOVALUE');
	const [addedCourses, setAddedCourses] = useState([]);
	const [courseOptions, setCourseOptions] = useState([]);
	let requestBlock = false;

	useEffect(() => {
		const fetchCourseOptions = async () => {
			if (term === 'NOVALUE' || timetableType === 'NOVALUE') return;
			try {
				const courses = await getNameList(timetableType, term);
				setCourseOptions(courses);
			} catch (error) {
				console.error('Error fetching course list:', error);
				enqueueSnackbar(<MultiLineSnackbar message='Error fetching course list.' />, { variant: 'error' });
			}
		};

		fetchCourseOptions();
	}, [term, timetableType, enqueueSnackbar]);

	const handleTableChange = (selectedTable) => setTimetableType(selectedTable);
	const handleTermChange = (selectedTerm) => setTerm(selectedTerm);
	const handleCourseCodeChange = (e, value) => {
		setCourseCode(value.toUpperCase());
		setCourseInputValue(value);
	};

	const addCourse = async () => {
		if (!validateInputs()) return;

		const { cleanCourseCode, duration } = parseCourseCode(courseCode);

		if (isCourseAlreadyAdded(cleanCourseCode)) {
			enqueueSnackbar(<MultiLineSnackbar message='Course already added' />, { variant: 'info' });
			return;
		}

		if (requestBlock) {
			enqueueSnackbar(<MultiLineSnackbar message='Fetching course data... Please Wait!' />, { variant: 'warning' });
			return;
		}

		requestBlock = true;
		try {
			const courseData = await getCourse(cleanCourseCode, timetableType, term);
			handleCourseData(courseData, cleanCourseCode, duration);
			setCourseInputValue(''); // Clear the input value
		} catch (error) {
			console.error('Error fetching course data:', error);
			enqueueSnackbar(<MultiLineSnackbar message='Error fetching course data.' />, { variant: 'error' });
		} finally {
			requestBlock = false;
		}
	};

	const validateInputs = () => {
		if (!timetableType || timetableType === 'NOVALUE') {
			enqueueSnackbar(<MultiLineSnackbar message='Please select a timetable.' />, { variant: 'warning' });
			return false;
		}

		if (!term || term === 'NOVALUE') {
			enqueueSnackbar(<MultiLineSnackbar message='Please select a term.' />, { variant: 'warning' });
			return false;
		}

		if (!isValidCourseCode(courseCode)) {
			enqueueSnackbar(<MultiLineSnackbar message='Invalid course code! Example: "COSC 1P02 D2"' />, { variant: 'warning' });
			return false;
		}

		return true;
	};

	const isValidCourseCode = (code) => {
		const regex = /^[A-Z]{4} \d[A-Z]\d{2} D\d+$/;
		return regex.test(code);
	};

	const parseCourseCode = (code) => {
		const split = code.split(" ");
		const cleanCourseCode = split[0] + split[1];
		const duration = split[2].substring(1);
		return { cleanCourseCode, duration };
	};

	const isCourseAlreadyAdded = (cleanCourseCode) => {
		return addedCourses.some(course => course.startsWith(cleanCourseCode.substring(0, 4) + " " + cleanCourseCode.substring(4)));
	};

	const handleCourseData = (courseData, cleanCourseCode, duration) => {
		storeCourseData(courseData);
		setAddedCourses([...addedCourses, courseCode]);
		addPinnedComponent(`${cleanCourseCode} DURATION ${duration}`);
		generateTimetables();
		setTimetables(getValidTimetables());

		const { durationStartDate, durationEndDate } = getDurationDates(courseData, duration);
		if (durationStartDate && durationEndDate) {
			const durationLabel = `${durationStartDate}-${durationEndDate}-${duration}`;
			updateDurations(durationLabel);
		}

		ReactGA.event({
			category: "Generator Event",
			action: "Added Course",
			label: `${cleanCourseCode} D${duration}`,
		});
	};

	const getDurationDates = (courseData, duration) => {
		for (let key in courseData.sections) {
			let section = courseData.sections[key];
			if (section.schedule.duration === duration) {
				return {
					durationStartDate: section.schedule.startDate,
					durationEndDate: section.schedule.endDate,
				};
			}
		}
		return {};
	};

	const updateDurations = (durationLabel) => {
		setDurations(prevDurations => {
			if (!prevDurations.includes(durationLabel)) {
				return [...prevDurations, durationLabel];
			}
			return prevDurations;
		});
		setSelectedDuration(durationLabel);
	};

	const removeCourse = (course) => {
		const cleanCourseCode = course.split(" ").slice(0, 2).join("");
		setAddedCourses(addedCourses.filter(c => c !== course));
		removeCourseData(cleanCourseCode);
		clearCoursePins(cleanCourseCode);
		generateTimetables();
		setTimetables(getValidTimetables());
	};

	return (
		<Box sx={{ minWidth: 120 }} m={2}>
			<TimeTableSelectComponent onTableChange={handleTableChange} />
			<TermSelectComponent onTermChange={handleTermChange} />
			<CourseSearchComponent
				onCourseCodeChange={handleCourseCodeChange}
				courseOptions={courseOptions}
				timetableType={timetableType}
				term={term}
				onEnterPress={addCourse}
				inputValue={courseInputValue}
				setInputValue={setCourseInputValue}
			/>
			<AddButtonComponent onAddCourse={addCourse} />
			<CourseListComponent courses={addedCourses} onRemoveCourse={removeCourse} />
		</Box>
	);
}
