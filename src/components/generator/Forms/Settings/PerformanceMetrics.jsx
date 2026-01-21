import BorderBox from "../../UI/BorderBox";
import { getGenerationPerformance } from "@/lib/generator/timetableGeneration/timetableGeneration";

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
      <div className="space-y-1 text-sm text-muted-foreground">
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground">
          Generation Performance
        </div>
        <div>Generation Time: {formattedTime}</div>
        <div>
          Combinations Processed:{" "}
          {metrics.totalCombinationsProcessed.toLocaleString()}
        </div>
        <div>
          Valid Timetables: {metrics.validTimetablesFound.toLocaleString()}
        </div>
        <div>Combinations/Second: {combinationsPerSecond.toLocaleString()}</div>
      </div>
    </BorderBox>
  );
}
