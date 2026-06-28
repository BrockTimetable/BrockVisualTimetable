// Single source of truth for the auto-assigned course colors. Courses are given
// palette[i] in the order they are added, so the URL codec can re-derive default
// colors on restore and only persist user-customized overrides.
//
// Visually distinguishable colors that work well for both light and dark themes,
// ordered to maximize contrast between consecutive entries.
export const defaultColors = [
  "#E74C3C", // Bright Red
  "#3498DB", // Bright Blue
  "#F1C40F", // Bright Yellow
  "#9B59B6", // Purple
  "#2ECC71", // Bright Green
  "#E67E22", // Orange
  "#34495E", // Navy Blue
  "#FF6B6B", // Coral Red
  "#1ABC9C", // Emerald
  "#8E44AD", // Deep Purple
  "#D35400", // Burnt Orange
  "#16A085", // Dark Teal
  "#C0392B", // Dark Red
  "#2980B9", // Dark Blue
  "#27AE60", // Dark Green
];

// The default color a course at position `index` (0-based, in add order) receives.
export const defaultColorForIndex = (index) =>
  defaultColors[index % defaultColors.length];
