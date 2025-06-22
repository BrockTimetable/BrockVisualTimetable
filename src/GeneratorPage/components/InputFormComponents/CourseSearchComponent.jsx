import React from "react";
import "../../css/DepartmentSearch.css";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import FormHelperText from "@mui/material/FormHelperText";
import ListSubheader from "@mui/material/ListSubheader";

export default function CourseSearchComponent({
  onCourseCodeChange,
  courseOptions,
  onEnterPress,
  timetableType,
  term,
  inputValue,
  setInputValue,
}) {
  const courseCodeChangeHandler = (e, newValue) => {
    onCourseCodeChange(e, newValue);
  };

  const filterOptions = createFilterOptions({
    ignoreCase: true,
    matchFrom: "start",
    limit: 3000,
  });

  return (
    <Box>
      <Autocomplete
        disablePortal
        freeSolo
        fullWidth
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          courseCodeChangeHandler(event, newInputValue);
        }}
        inputValue={inputValue}
        options={courseOptions}
        filterOptions={filterOptions}
        groupBy={(option) => option.slice(0, 4).toUpperCase()}
        renderGroup={(params) => (
          <li key={params.key}>
            <ListSubheader
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                fontSize: "1rem",
                lineHeight: "2",
              }}
            >
              {params.group}
            </ListSubheader>
            {params.children}
          </li>
        )}
        renderInput={(params) => (
          <>
            <TextField
              {...params}
              label="Add a course"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onEnterPress(event);
                }
              }}
            />
          </>
        )}
      />
    </Box>
  );
}
