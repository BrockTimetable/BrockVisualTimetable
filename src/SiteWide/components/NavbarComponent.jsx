import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import ColorModeContext from '../contexts/ColorModeContext';

export default function NavbarComponent() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);


    const handleClick = () => {
      window.location.href = 'https://www.brocktimetable.com';
    };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{fontWeight: 'bold', cursor: 'pointer' }} onClick={handleClick}>
            Brock Visual TimeTable
          </Typography>
          <Box sx={{flexGrow: 1}}/>
          <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
