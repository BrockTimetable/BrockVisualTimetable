import React from 'react';
import TemporaryButtonComponent from './HomePage/components/temporaryButtonComponent';
import NavbarComponent from './SiteWide/components/NavbarComponent';
import CssBaseline from "@mui/material/CssBaseline";

function HomePage() {
    return (
        <>
            <CssBaseline />
            <NavbarComponent />
            <div>
                <h1>Welcome to the Home Page</h1>
                <p>Nothing here yet. :P</p>
            </div>
            <TemporaryButtonComponent />
        </>
    );
}

export default HomePage;