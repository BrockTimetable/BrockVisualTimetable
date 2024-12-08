import React, { useContext } from "react";
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

const NavbarComponent = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    const handleClick = () => {
        window.location.href = "./";
    };

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
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: "bold", cursor: "pointer" }}
            onClick={handleClick}
          >
            📚 Brock Visual TimeTable
          </Typography>
          <Box display="flex" alignItems="center">
            <Link to="/" style={{ marginRight: 16, textDecoration: 'none', color: theme.palette.text.primary }}>
              Generator
            </Link>
            <Link to="/guide" style={{ marginRight: 16, textDecoration: 'none', color: theme.palette.text.primary }}>
              Guide
            </Link>
            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
};

export default NavbarComponent;
