import React from "react";
import { Button } from "@/components/ui/button";
import { exportCal } from "../../scripts/ExportCal.js";

export default function ExportCalendarButton() {
  return (
    <Button variant="outline" onClick={exportCal}>
      Export Calendar
    </Button>
  );
}
