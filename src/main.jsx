import { useMemo, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GeneratorPage from "@/pages/GeneratorPage";
import GuidePage from "@/pages/GuidePage";
import ColorModeContext from "@/lib/contexts/sitewide/ColorModeContext";
import CustomSnackbarProvider from "@/components/sitewide/SnackbarProvider";
import ReactGA from "react-ga4";
import "@/styles/index.css";

const THEME_STORAGE_KEY = "bt-theme-mode";

const App = () => {
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    ReactGA.initialize("G-M2NP1M6YSK");
  }, []);
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedMode === "light" || storedMode === "dark") {
      return storedMode;
    }
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === "light" ? "dark" : "light";
          if (typeof window !== "undefined") {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
          }
          return nextMode;
        });
      },
    }),
    [mode],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (storedMode === "light" || storedMode === "dark") {
        return;
      }
      setMode(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  return (
    <Router>
      <ColorModeContext.Provider value={colorMode}>
        <Routes>
          <Route path="/" element={<GeneratorPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
      </ColorModeContext.Provider>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <CustomSnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
  >
    <App />
  </CustomSnackbarProvider>,
);
