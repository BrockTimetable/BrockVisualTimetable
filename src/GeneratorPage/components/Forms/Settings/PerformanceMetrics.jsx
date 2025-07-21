import React from "react";
import { Typography, Box } from "@mui/material";
import BorderBox from "../../UI/BorderBox";
import { getGenerationPerformance } from "../../../scripts/timetableGeneration/timetableGeneration";

export default function PerformanceMetrics() {
  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const metrics = getGenerationPerformance();

  // Only show metrics if generation has occurred and completed
  if (metrics.generationStartTime === 0 || metrics.generationEndTime === 0) {
    return null;
  }

  // Calculate actual generation time in milliseconds
  const timeInMs = metrics.generationEndTime - metrics.generationStartTime;

  // Format time to be more readable
  const formattedTime =
    timeInMs < 1000
      ? `${timeInMs.toFixed(1)}ms`
      : `${(timeInMs / 1000).toFixed(3)}s`;

  // Calculate combinations per second
  const timeInSeconds = timeInMs / 1000;
  const combinationsPerSecond =
    timeInSeconds > 0
      ? Math.round(metrics.totalCombinationsProcessed / timeInSeconds)
      : 0;

  return (
    <BorderBox title="Generation Performance">
      <Typography variant="h6" gutterBottom>
        Generation Performance
      </Typography>
      <Box>
        <Typography variant="body2" color="text.secondary">
          Generation Time: {formattedTime}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Combinations Processed:{" "}
          {metrics.totalCombinationsProcessed.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Valid Timetables: {metrics.validTimetablesFound.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Combinations/Second: {combinationsPerSecond.toLocaleString()}
        </Typography>
      </Box>
    </BorderBox>
  );
}
