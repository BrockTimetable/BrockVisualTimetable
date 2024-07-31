import React from 'react';
import { SnackbarContent } from 'notistack';
import { Typography } from '@mui/material';

const MultiLineSnackbar = ({ message }) => {
  return (
    <SnackbarContent>
      <Typography component="div">
        {message.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </Typography>
    </SnackbarContent>
  );
};

export default MultiLineSnackbar;
