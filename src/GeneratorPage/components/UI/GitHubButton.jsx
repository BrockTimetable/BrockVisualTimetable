import React from "react";
import { Box } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Button } from "@/components/ui/button";

const GitHubButton = () => {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Button asChild className="bg-black text-white hover:bg-black">
        <a
          href="https://github.com/BrockTimetable/BrockVisualTimetable"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon className="mr-2 h-4 w-4" />
          View on GitHub
        </a>
      </Button>
    </Box>
  );
};

export default GitHubButton;
