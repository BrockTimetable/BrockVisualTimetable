import React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";

export default function SortDropdown({ value, onChange }) {
    return (
        <Box>
            <FormControl fullWidth>
                <Select value={value} onChange={onChange} displayEmpty>
                    <MenuItem value="sortByWaitingTime">Sort by Waiting Time</MenuItem>
                    <MenuItem value="minimizeClassDays">Minimize Class Days</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}
