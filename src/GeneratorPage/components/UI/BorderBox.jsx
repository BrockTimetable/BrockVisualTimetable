import React, { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";

export default function BorderBox({ title, children }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "primary.main",
        borderRadius: "8px",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      <Box
        onClick={toggleExpand}
        sx={{
          backgroundColor: "primary.main",
          padding: "4px 8px",
          color: "white",
          fontWeight: "bold",
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
        }}
      >
        {title}
        <IconButton
          size="small"
          sx={{
            color: "white",
            padding: "0px",
            transition: "transform 0.3s ease",
            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      </Box>
      <Collapse in={isExpanded} timeout={300}>
        <Box sx={{ padding: "16px" }}>{children}</Box>
      </Collapse>
    </Box>
  );
}
