import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import GeneratorPage from './GeneratorPage';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ColorModeContext from './SiteWide/contexts/ColorModeContext';

const App = () => {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  }), []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#cc0000',
      },
      secondary: {
        main: '#73767f',
      },
    },
  }), [mode]);

  return (
    <Router>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/generator" element={<GeneratorPage />} />
          </Routes>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);