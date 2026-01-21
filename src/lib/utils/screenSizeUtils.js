import { useEffect, useState } from "react";

const useMediaQuery = (query) => {
  const getMatch = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", handleChange);
    setMatches(mediaQueryList.matches);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
};

export const useIsMobile = () => useMediaQuery("(max-width: 639px)");

export const useIsBelowMedium = () => useMediaQuery("(max-width: 767px)");
