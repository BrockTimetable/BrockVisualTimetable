import React from "react";
import { Box, Button } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useTheme } from "@mui/material/styles";

const GitHubButton = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Button
        component="a"
        href="https://github.com/BrockTimetable/BrockVisualTimetable"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          backgroundColor: "black",
          color: "white",
          "&:hover": {
            backgroundColor: "black",
          },
        }}
        variant="contained"
        startIcon={<GitHubIcon />}
      >
        View on GitHub
      </Button>
    </Box>
  );
};

export default GitHubButton;
