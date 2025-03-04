import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { CourseDetailsContext } from '../contexts/CourseDetailsContext';
import { CourseColorsContext } from '../contexts/CourseColorsContext';

// Helper function to format date as Month DD
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (error) {
    return "Unknown";
  }
};

export default function CourseTimelineComponent({ 
  addedCourses = [], 
  setSelectedDuration, 
  durations = [],
  navigateToDate
}) {
  const { courseDetails } = useContext(CourseDetailsContext);
  const { courseColors, getDefaultColorForCourse } = useContext(CourseColorsContext);
  
  // Function to handle click on a course bar
  const handleCourseClick = (course, event) => {
    try {
      // Add navigation animation to the clicked element
      if (event && event.currentTarget) {
        event.currentTarget.classList.add('navigate');
        // Remove the class after animation completes
        setTimeout(() => {
          event.currentTarget.classList.remove('navigate');
        }, 800);
      }
      
      // Navigate to the course's start date + 1 day if available
      if (course.startDate && navigateToDate) {
        // Create a new date object for the next day
        const nextDay = new Date(course.startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        navigateToDate(nextDay.toISOString());
      }
    } catch (error) {
      console.error("Error handling course click:", error);
    }
  };

  // If no courses, return empty component
  if (!addedCourses || addedCourses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 1 }} className="course-timeline-container">
        <Typography variant="caption" color="text.secondary">
          Add courses to see timeline visualization
        </Typography>
      </Box>
    );
  }

  const coursesWithDates = [];
  
  for (const course of addedCourses) {
    try {
      const courseName = course.code?.toUpperCase();
      const courseString = course.string || `${course.code} ${course.section || ''} (${course.duration || ''})`;
      
      let startDate = null;
      let endDate = null;
      
      if (course.startDate && course.endDate) {
        startDate = new Date(course.startDate);
        endDate = new Date(course.endDate);
      }
      
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        const detail = courseDetails?.find(d => d && d.name === courseName);
        
        if (detail && detail.startDate && detail.endDate) {
          startDate = new Date(detail.startDate);
          endDate = new Date(detail.endDate);
        }
      }
      
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        let durationCode = course.duration || "";
        if (!durationCode) {
          const durationMatch = courseString.match(/\(([^)]+)\)/);
          if (durationMatch && durationMatch[1]) {
            durationCode = durationMatch[1];
          }
        }
        
        // Set date ranges based on duration code
        if (durationCode.includes("D1")) {
          // First half of term
          startDate = new Date(2023, 0, 1); // Jan 1
          endDate = new Date(2023, 5, 1);   // June 1
        } else if (durationCode.includes("D2")) {
          // Second half of term
          startDate = new Date(2023, 5, 1);  // June 1
          endDate = new Date(2023, 11, 31);  // Dec 31
        } else if (durationCode.includes("D3")) {
          // Full duration
          startDate = new Date(2023, 0, 1);  // Jan 1
          endDate = new Date(2023, 11, 31);  // Dec 31
        } else {
          // Default duration with staggered dates
          const index = coursesWithDates.length;
          startDate = new Date(2023, 0 + index, 1);
          endDate = new Date(2023, 6 + index, 1);
        }
      }
      
      const color = courseColors[courseName] || getDefaultColorForCourse(courseName);
      
      // Determine term based on dates
      let term = '';
      if (startDate) {
        // Use month to determine term - typically spring is before June, summer is June or later
        const month = startDate.getMonth();
        term = month < 5 ? 'spring' : 'summer'; // 5 = June (0-indexed months)
      }
      
      coursesWithDates.push({
        code: courseName,
        fullName: courseString,
        startDate,
        endDate,
        color,
        // Store the duration for use in click handler
        duration: course.duration || "",
        term: term
      });
    } catch (error) {
      // Even on error, try to add the course with default dates
      try {
        const index = coursesWithDates.length;
        const courseName = course.code?.toUpperCase() || "COURSE" + index;
        const courseString = course.string || `Course ${index}`;
        const color = courseColors[courseName] || getDefaultColorForCourse(courseName);
        
        // Create fallback dates
        const startDate = new Date(2023, 0 + index, 1);
        const endDate = new Date(2023, 6 + index, 1);
        
        // Determine term for fallback dates
        const term = startDate.getMonth() < 5 ? 'spring' : 'summer';
        
        coursesWithDates.push({
          code: courseName,
          fullName: courseString,
          startDate,
          endDate,
          color,
          duration: course.duration || "",
          term
        });
      } catch (innerError) {
        console.error("Failed to add fallback course:", innerError);
      }
    }
  }
  
  if (coursesWithDates.length === 0) {
    // If we still have no courses with dates, create some default ones based on the course names
    if (addedCourses.length > 0) {
      for (let i = 0; i < addedCourses.length; i++) {
        try {
          const course = addedCourses[i];
          const parts = course.split(" ");
          const courseName = parts.length >= 2 ? 
            (parts[0] + parts[1]).toUpperCase() : 
            course.toUpperCase();
          
          const startDate = new Date(2023, 0 + i, 1);
          const endDate = new Date(2023, 3 + i, 1);
          
          const color = courseColors[courseName] || getDefaultColorForCourse(courseName);
          
          coursesWithDates.push({
            code: courseName,
            fullName: course,
            startDate,
            endDate,
            color
          });
        } catch (error) {
          console.error("Error creating fallback course:", error);
        }
      }
    }
    
    // If still no courses, show a message
    if (coursesWithDates.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 1 }} className="course-timeline-container">
          <Typography variant="caption" color="text.secondary">
            No course date information available
          </Typography>
        </Box>
      );
    }
  }

  // Calculate the timeline range
  const startTimes = coursesWithDates.map(c => c.startDate.getTime());
  const endTimes = coursesWithDates.map(c => c.endDate.getTime());
  
  const earliestDate = new Date(Math.min(...startTimes));
  const latestDate = new Date(Math.max(...endTimes));
  const totalDays = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) + 1;

  // Calculate position and width percentages for each course
  coursesWithDates.forEach(course => {
    const startOffset = Math.max(0, (course.startDate - earliestDate) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((course.endDate - course.startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    course.startPercent = (startOffset / totalDays) * 100;
    course.widthPercent = (duration / totalDays) * 100;
  });

  // Generate month markers for the timeline
  const monthMarkers = [];
  const startYear = earliestDate.getFullYear();
  const startMonth = earliestDate.getMonth();
  const endYear = latestDate.getFullYear();
  const endMonth = latestDate.getMonth();
  
  // Calculate the total number of months in the range
  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  
  // Generate markers for each month
  for (let i = 0; i <= totalMonths; i++) {
    const year = startYear + Math.floor((startMonth + i) / 12);
    const month = (startMonth + i) % 12;
    
    // Create date for the 1st of the month
    const monthDate = new Date(year, month, 1);
    
    // Only add if the month starts after or on the earliest date and before or on the latest date
    if (monthDate >= earliestDate && monthDate <= latestDate) {
      const dayOffset = (monthDate - earliestDate) / (1000 * 60 * 60 * 24);
      const position = (dayOffset / totalDays) * 100;
      
      monthMarkers.push({
        date: monthDate,
        position,
        label: monthDate.toLocaleDateString('en-US', { month: 'short' })
      });
    }
  }

  return (
    <Box sx={{ mt: 1, mb: 2 }} className="course-timeline-container">
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 0.5
        }}
      >
        <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
          {formatDate(earliestDate)}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
          Course Timeline
        </Typography>
        <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
          {formatDate(latestDate)}
        </Typography>
      </Box>
      
      {/* Timeline container */}
      <Box 
        sx={{
          position: 'relative',
          height: coursesWithDates.length * 16 + 18,
          width: '100%',
          backgroundColor: 'transparent',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        {/* Background with subtle grid */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: 1
          }}
        />
        
        {/* Month markers */}
        {monthMarkers.map((marker, index) => (
          <React.Fragment key={`month-${index}`}>
            {/* Vertical line */}
            <Box
              sx={{
                position: 'absolute',
                left: `${marker.position}%`,
                top: 0,
                height: '100%',
                width: '1px',
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />
            {/* Month label - only show every other month if there are many months */}
            {(monthMarkers.length <= 12 || index % 2 === 0) && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: `${marker.position}%`,
                  bottom: 2,
                  transform: 'translateX(-50%)',
                  color: theme => theme.palette.text.secondary,
                  fontSize: '0.6rem',
                  opacity: 0.8,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none'
                }}
              >
                {marker.label}
              </Typography>
            )}
          </React.Fragment>
        ))}
        
        {/* Course bars */}
        {coursesWithDates.map((course, index) => (
          <Tooltip 
            key={course.code} 
            title={`${course.fullName}: ${formatDate(course.startDate)} - ${formatDate(course.endDate)}`}
            arrow
            placement="top"
          >
            <Box
              className="course-timeline-bar"
              sx={{
                position: 'absolute',
                left: `${course.startPercent}%`,
                top: 4 + (index * 16),
                width: `${course.widthPercent}%`,
                height: '10px',
                backgroundColor: course.color,
                opacity: 0.85,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1,
                  height: '12px',
                  top: 3 + (index * 16),
                  boxShadow: theme => `0 1px 3px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)'}`
                },
                zIndex: 2
              }}
              onClick={(event) => handleCourseClick(course, event)}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
} 