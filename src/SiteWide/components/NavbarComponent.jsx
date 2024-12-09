import React, { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "@mui/material/styles";
import ColorModeContext from "../contexts/ColorModeContext";
import { Link } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { ListItemButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const NavbarComponent = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return;
        }
        setDrawerOpen(open);
    };

    const drawerContent = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
            <List>
                <ListItemButton component={Link} to="/">
                    <ListItemText primary="Generator" />
                </ListItemButton>
                <ListItemButton component={Link} to="/guide">
                    <ListItemText primary="Guide" />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <Box
            sx={{
                flexGrow: 1,
                backgroundColor: theme.palette.background.primary,
                color: theme.palette.text.primary,
                padding: 2,
                marginTop: 2,
                height: "70px",
                display: "flex",
                alignItems: "center",
                flexDirection: isMobile ? "column" : "row",
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Typography variant={isMobile ? "h6" : "h4"} component="div" sx={{ fontWeight: "bold" }}>
                    📚 Brock Visual TimeTable
                </Typography>
                {isMobile ? (
                    <>
                        <Box>
                            <IconButton sx={{ mr: 2 }} onClick={colorMode.toggleColorMode} color="inherit">
                                {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
                                <MenuIcon />
                            </IconButton>
                        </Box>

                        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                            {drawerContent}
                        </Drawer>
                    </>
                ) : (
                    <Box display="flex" alignItems="center" flexDirection="row">
                        <Link
                            to="/"
                            style={{ marginRight: 16, textDecoration: "none", color: theme.palette.text.primary }}
                        >
                            Generator
                        </Link>
                        <Link
                            to="/guide"
                            style={{ marginRight: 16, textDecoration: "none", color: theme.palette.text.primary }}
                        >
                            Guide
                        </Link>
                        <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
                            {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default NavbarComponent;
