import { useEffect } from "react";
import PropTypes from "prop-types";
import { SnackbarProvider, useSnackbar } from "notistack";
import eventBus from "@/lib/eventBus";

const SnackbarListener = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleSnackbarEvent = ({ message, variant }) => {
      enqueueSnackbar(message, { variant });
    };

    eventBus.on("snackbar", handleSnackbarEvent);

    return () => {
      eventBus.off("snackbar", handleSnackbarEvent);
    };
  }, [enqueueSnackbar]);

  return null;
};

const CustomSnackbarProvider = ({ children }) => (
  <SnackbarProvider
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
    autoHideDuration={3000}
  >
    {children}
    <SnackbarListener />
  </SnackbarProvider>
);

CustomSnackbarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CustomSnackbarProvider;
