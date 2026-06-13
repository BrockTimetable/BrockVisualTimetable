import ReactDOM from "react-dom/client";
import CustomSnackbarProvider from "@/components/sitewide/SnackbarProvider";
import App from "@/App";
import "@/styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <CustomSnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
  >
    <App />
  </CustomSnackbarProvider>,
);
