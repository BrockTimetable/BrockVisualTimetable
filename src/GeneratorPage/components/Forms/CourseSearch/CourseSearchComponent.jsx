import React from "react";
import "../../../css/DepartmentSearch.css";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { styled } from "@mui/material";

const GroupHeader = styled("div")(({ theme }) => ({
  position: "sticky",
  top: "-8px",
  padding: "4px 10px",
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
}));

const GroupItems = styled("ul")({
  padding: 0,
});

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
        options={courseOptions}
        groupBy={(option) => option.slice(0, 4).toUpperCase()}
        getOptionLabel={(option) => option}
        fullWidth
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          courseCodeChangeHandler(event, newInputValue);
        }}
        inputValue={inputValue}
        filterOptions={filterOptions}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Add a course"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onEnterPress(event);
              }
            }}
          />
        )}
        renderGroup={(params) => (
          <li key={params.key}>
            <GroupHeader>{params.group}</GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
      />
    </Box>
  );
}
