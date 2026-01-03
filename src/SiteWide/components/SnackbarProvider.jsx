import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import eventBus from "../Buses/eventBus";

const SnackbarListener = () => {
  useEffect(() => {
    const handleSnackbarEvent = ({ message, variant }) => {
      const action = variant === "error" ? toast.error : toast.message;
      action(message);
    };

    eventBus.on("snackbar", handleSnackbarEvent);

    return () => {
      eventBus.off("snackbar", handleSnackbarEvent);
    };
  }, []);

  return null;
};

const CustomSnackbarProvider = ({ children }) => (
  <>
    {children}
    <SnackbarListener />
    <Toaster position="top-center" duration={3000} richColors />
  </>
);

export default CustomSnackbarProvider;
