import { useMediaQuery, useTheme } from "@mui/material";

export const useIsMobile = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
};

export const useIsBelowMedium = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("md"));
};
