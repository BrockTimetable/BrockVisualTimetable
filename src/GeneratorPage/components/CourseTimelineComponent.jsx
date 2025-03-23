import React, { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import { alpha } from '@mui/material/styles';
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
  const [hoveredCourse, setHoveredCourse] = useState(null);
  
  // Function to handle click on a course bar
  const handleCourseClick = (course, event) => {
    try {
      // First, check if we have both setSelectedDuration and durations available
      if (setSelectedDuration && durations && durations.length > 0 && course.duration) {
        // Get the duration code (D1, D2, D3, etc.) and course dates
        const durationCode = course.duration;
        
        // Convert start and end dates to Unix timestamps
        const startTimestamp = Math.floor(course.startDate.getTime() / 1000);
        const endTimestamp = Math.floor(course.endDate.getTime() / 1000);
        
        // Try to find an exact match in the durations array
        let matchedDuration = durations.find(d => {
          const [durStartUnix, durEndUnix, durCode] = d.split("-");
          return durCode === durationCode && 
                 // Allow some flexibility in date matching (within 2 weeks)
                 Math.abs(parseInt(durStartUnix) - startTimestamp) < 1209600 && 
                 Math.abs(parseInt(durEndUnix) - endTimestamp) < 1209600;
        });
        
        // If no exact match, try to find by duration code only
        if (!matchedDuration) {
          matchedDuration = durations.find(d => {
            const [_, __, durCode] = d.split("-");
            return durCode === durationCode;
          });
        }
        
        // If still no match, just use the date range to find the most appropriate duration
        if (!matchedDuration) {
          // Find the duration with closest date range
          let closestMatch = null;
          let smallestDiff = Infinity;
          
          durations.forEach(d => {
            const [durStartUnix, durEndUnix] = d.split("-");
            const startDiff = Math.abs(parseInt(durStartUnix) - startTimestamp);
            const endDiff = Math.abs(parseInt(durEndUnix) - endTimestamp);
            const totalDiff = startDiff + endDiff;
            
            if (totalDiff < smallestDiff) {
              smallestDiff = totalDiff;
              closestMatch = d;
            }
          });
          
          if (closestMatch) {
            matchedDuration = closestMatch;
          }
        }
        
        // If we found a matching duration, set it
        if (matchedDuration) {
          setSelectedDuration(matchedDuration);
        }
      }
      
      // Additionally, navigate to the course's start date + 1 day if available
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
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 1.5,
          px: 2,
          borderRadius: 1,
          backgroundColor: 'transparent',
          border: '1px solid',
          borderColor: 'var(--calendar-grid-color-light)',
          '.dark-mode &': {
            borderColor: 'var(--calendar-grid-color-dark)'
          }
        }}
      >
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
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 1.5,
            px: 2,
            borderRadius: 1,
            backgroundColor: 'transparent',
            border: '1px solid',
            borderColor: 'var(--calendar-grid-color-light)',
            '.dark-mode &': {
              borderColor: 'var(--calendar-grid-color-dark)'
            }
          }}
        >
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
    <Box 
      sx={{ 
        mt: 1.5, 
        mb: 2.5,
        px: 0.5
      }}
    >
      {/* Timeline container */}
      <Box 
        sx={{
          position: 'relative',
          height: coursesWithDates.length * 24 + 20,
          width: '100%',
          backgroundColor: 'transparent',
          borderRadius: 1.5,
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
          mt: 1.5 // Add top margin for labels
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
            backgroundColor: 'transparent',
            border: '1px solid',
            borderColor: 'var(--calendar-grid-color-light)',
            '.dark-mode &': {
              borderColor: 'var(--calendar-grid-color-dark)'
            },
            borderRadius: 1.5,
            transition: 'all 0.2s ease-in-out'
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
                backgroundColor: 'var(--calendar-grid-color-light)',
                '.dark-mode &': {
                  backgroundColor: 'var(--calendar-grid-color-dark)'
                },
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
                  color: theme => alpha(theme.palette.text.secondary, 0.9),
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  textShadow: theme => theme.palette.mode === 'dark'
                    ? '0 1px 2px rgba(0,0,0,0.3)'
                    : '0 1px 0 rgba(255,255,255,0.8)'
                }}
              >
                {marker.label}
              </Typography>
            )}
          </React.Fragment>
        ))}
        
        {/* Course bars with labels */}
        {coursesWithDates.map((course, index) => (
          <React.Fragment key={course.code}>
            {/* Course label */}
            <Tooltip 
              title={`${course.fullName}: ${formatDate(course.startDate)} - ${formatDate(course.endDate)}`}
              arrow
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 300 }}
            >
              <Typography
                variant="caption"
                onClick={(event) => handleCourseClick(course, event)}
                onMouseEnter={() => setHoveredCourse(course.code)}
                onMouseLeave={() => setHoveredCourse(null)}
                sx={{
                  position: 'absolute',
                  left: `${course.startPercent}%`,
                  top: 12 + (index * 24),
                  height: '12px',
                  transform: 'translateY(-50%)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: theme => theme.palette.text.primary,
                  whiteSpace: 'nowrap',
                  marginLeft: '4px',
                  zIndex: 4,
                  display: 'flex',
                  alignItems: 'center',
                  textShadow: theme => theme.palette.mode === 'dark'
                    ? '0 1px 2px rgba(0,0,0,0.5)'
                    : '0 1px 0 rgba(255,255,255,0.9)',
                  backgroundColor: theme => alpha(theme.palette.background.paper, 0.85),
                  padding: '0 4px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: hoveredCourse === course.code 
                    ? '0 1px 2px rgba(0,0,0,0.1)'
                    : 'none',
                  '&:hover': {
                    backgroundColor: theme => alpha(theme.palette.background.paper, 0.95),
                  },
                  '&:active': {
                    transform: 'translateY(-45%) scale(0.98)',
                  }
                }}
              >
                {course.code}
              </Typography>
            </Tooltip>
            
            {/* Course bar */}
            <Tooltip 
              title={`${course.fullName}: ${formatDate(course.startDate)} - ${formatDate(course.endDate)}`}
              arrow
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 300 }}
            >
              <Box
                onMouseEnter={() => setHoveredCourse(course.code)}
                onMouseLeave={() => setHoveredCourse(null)}
                onClick={(event) => handleCourseClick(course, event)}
                sx={{
                  position: 'absolute',
                  left: `${course.startPercent}%`,
                  top: 12 + (index * 24),
                  width: `${course.widthPercent}%`,
                  height: '12px',
                  backgroundColor: course.color,
                  opacity: hoveredCourse === course.code ? 1 : 0.85,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredCourse === course.code ? 'translateY(-1px)' : 'none',
                  boxShadow: hoveredCourse === course.code 
                    ? theme => `0 2px 4px ${alpha(course.color, 0.4)}, 0 0 1px ${alpha(theme.palette.common.black, 0.2)}`
                    : 'none',
                  '&:hover': {
                    opacity: 1,
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0px) scale(0.98)',
                    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  zIndex: hoveredCourse === course.code ? 3 : 2
                }}
              />
            </Tooltip>
          </React.Fragment>
        ))}
      </Box>
      
      {/* Date range indicators at the bottom */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 0.5
        }}
      >
        <Typography variant="caption" color="text.secondary" fontSize="0.7rem" sx={{ fontWeight: 500 }}>
          {formatDate(earliestDate)}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontSize="0.7rem" sx={{ fontWeight: 500 }}>
          {formatDate(latestDate)}
        </Typography>
      </Box>
    </Box>
  );
} 