import React from "react";
import { Button } from "@mui/material";
import { exportCal } from "../scripts/ExportCal.js";

export default function ExportCalendarButton() {
  return (
    <Button variant="outlined" onClick={exportCal}>
      Export Calendar
    </Button>
  );
}
