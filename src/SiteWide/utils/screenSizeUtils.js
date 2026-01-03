import { useScreenSize } from "../contexts/ScreenSizeContext";

// These hooks now use the centralized ScreenSizeContext for better performance
// The context uses both matchMedia and a throttled resize listener for immediate updates
export const useIsMobile = () => {
  const { isMobile } = useScreenSize();
  return isMobile;
};

export const useIsBelowMedium = () => {
  const { isBelowMedium } = useScreenSize();
  return isBelowMedium;
};
