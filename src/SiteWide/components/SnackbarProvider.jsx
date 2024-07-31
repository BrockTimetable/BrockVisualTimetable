import React, { useEffect } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import eventBus from '../Buses/eventBus';

const SnackbarListener = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleSnackbarEvent = ({ message, variant }) => {
      enqueueSnackbar(message, { variant });
    };

    eventBus.on('snackbar', handleSnackbarEvent);

    return () => {
      eventBus.off('snackbar', handleSnackbarEvent);
    };
  }, [enqueueSnackbar]);

  return null;
};

const CustomSnackbarProvider = ({ children }) => (
  <SnackbarProvider
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    autoHideDuration={3000}
  >
    {children}
    <SnackbarListener />
  </SnackbarProvider>
);

export default CustomSnackbarProvider;
