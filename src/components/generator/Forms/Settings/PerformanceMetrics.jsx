import { getGenerationPerformance } from "@/lib/generator/timetableGeneration/timetableGeneration";

export default function PerformanceMetrics() {
  if (!import.meta.env.DEV) return null;

  const metrics = getGenerationPerformance();
  if (metrics.generationStartTime === 0 || metrics.generationEndTime === 0) {
    return null;
  }

  const timeInMs = metrics.generationEndTime - metrics.generationStartTime;
  const formattedTime =
    timeInMs < 1000
      ? `${timeInMs.toFixed(1)}ms`
      : `${(timeInMs / 1000).toFixed(3)}s`;
  const timeInSeconds = timeInMs / 1000;
  const combinationsPerSecond =
    timeInSeconds > 0
      ? Math.round(metrics.totalCombinationsProcessed / timeInSeconds)
      : 0;

  return (
    <details className="workspace-section workspace-meta text-muted-foreground">
      <summary className="cursor-pointer font-medium text-foreground">
        Developer metrics
      </summary>
      <div className="mt-2 space-y-1">
        <div>Generation time: {formattedTime}</div>
        <div>
          Combinations processed:{" "}
          {metrics.totalCombinationsProcessed.toLocaleString()}
        </div>
        <div>
          Valid timetables: {metrics.validTimetablesFound.toLocaleString()}
        </div>
        <div>Combinations/second: {combinationsPerSecond.toLocaleString()}</div>
      </div>
    </details>
  );
}
