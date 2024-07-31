import React, { useMemo, useState } from 'react';
import TemporaryButtonComponent from './HomePage/components/temporaryButtonComponent';
import NavbarComponent from './SiteWide/components/NavbarComponent';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ColorModeContext from './SiteWide/components/ColorModeContext';

function HomePage() {
    const [mode, setMode] = useState('light'); 
    const colorMode = useMemo(() => ({
        toggleColorMode: () => {
            setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        },
    }), []);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: mode,
                    primary: {
                        main: '#cc0000',
                    },
                    secondary: {
                        main: '#73767f',
                    },
                },
            }),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <NavbarComponent />
                <div>
                    <h1>Welcome to the Home Page</h1>
                    <p>Nothing here yet. :P</p>
                </div>
                <TemporaryButtonComponent />
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default HomePage;