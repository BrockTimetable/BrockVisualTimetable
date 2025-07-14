import React from "react";
import "../../../css/TermSelect.css";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function TermSelectComponent({ onTermChange }) {
  const [term, setTerm] = React.useState("FW");

  function handleTermChange(event) {
    const selectedTerm = event.target.value;
    setTerm(selectedTerm);
    onTermChange(selectedTerm);
  }

  return (
    <>
      <Box>
        <FormControl id="termSelectComponent" fullWidth>
          <InputLabel id="term-select-label">Term</InputLabel>
          <Select
            labelId="term-select-label"
            value={term}
            label="Term"
            onChange={handleTermChange}
          >
            <MenuItem value={""}>Select Term</MenuItem>
            <MenuItem disabled={false} value={"FW"}>
              Fall/Winter
            </MenuItem>
            <MenuItem disabled={true} value={"SP"}>
              Spring 2025
            </MenuItem>
            <MenuItem disabled={false} value={"SU"}>
              Summer 2025
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
    </>
  );
}
