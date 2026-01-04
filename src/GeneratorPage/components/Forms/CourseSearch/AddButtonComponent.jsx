import React from "react";
import Box from "@mui/material/Box";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Button } from "@/components/ui/button";

export default function AddButtonComponent({ onAddCourse }) {
  return (
    <Box>
      <Button onClick={onAddCourse}>
        <AddBoxIcon className="mr-2 h-4 w-4" />
        Add Course
      </Button>
    </Box>
  );
}
