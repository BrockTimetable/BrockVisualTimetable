/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GeneratorPage from "./GeneratorPage";
import GuidePage from "./GuidePage";
import ColorModeContext from "./SiteWide/contexts/ColorModeContext";
import CustomSnackbarProvider from "./SiteWide/components/SnackbarProvider";
import ReactGA from "react-ga4";
import "./index.css";
import "./GeneratorPage/css/index.css";

const App = () => {
  ReactGA.initialize("G-M2NP1M6YSK");
  const [mode, setMode] = useState(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [],
  );

  const themeTokens = useMemo(
    () => ({
      background: mode === "light" ? "#ffffff" : "#242526",
      divider: mode === "light" ? "#e0e0e0" : "#424242",
      outline: mode === "light" ? "#b0b0b0" : "#616161",
    }),
    [mode],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setMode(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--theme-divider-color",
      themeTokens.divider,
    );
    document.documentElement.style.setProperty(
      "--theme-outline-color",
      themeTokens.outline,
    );
    document.documentElement.style.backgroundColor = themeTokens.background;
    document.body.style.backgroundColor = themeTokens.background;
    document.body.classList.toggle("light-mode", mode === "light");
    document.body.classList.toggle("dark-mode", mode === "dark");
    document.documentElement.classList.toggle("light-mode", mode === "light");
    document.documentElement.classList.toggle("dark-mode", mode === "dark");
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [themeTokens, mode]);

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
  <CustomSnackbarProvider>
    <App />
  </CustomSnackbarProvider>,
);
