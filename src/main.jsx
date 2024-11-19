import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GeneratorPage from './GeneratorPage';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ColorModeContext from './SiteWide/contexts/ColorModeContext';
import CustomSnackbarProvider from './SiteWide/components/SnackbarProvider';
import ReactGA from 'react-ga4';
import './GeneratorPage/css/index.css';

const App = () => {
  ReactGA.initialize('G-M2NP1M6YSK');
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
        light: '#ff6666',
        dark: '#990000',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#cc0000',
        light: '#ff6666',
        dark: '#990000',
        contrastText: '#ffffff',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#000000',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
        contrastText: '#ffffff',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#ffffff' : '#242526',
        paper: mode === 'light' ? '#f5f5f5' : '#1d1d1d',
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#ffffff',
        secondary: mode === 'light' ? '#73767f' : '#b0b3b8',
      },
    },
  }), [mode]);

  return (
    <Router>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/" element={<GeneratorPage />} />
          </Routes>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CustomSnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <App />
  </CustomSnackbarProvider>,
);