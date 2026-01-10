import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TimetableSelectComponent({ onTableChange }) {
  const [timetable, setTimetable] = React.useState("UG");

  function handleTimetableChange(selectedTimetable) {
    setTimetable(selectedTimetable);
    onTableChange(selectedTimetable);
  }

  return (
    <div>
      <Select value={timetable} onValueChange={handleTimetableChange}>
        <SelectTrigger className="w-full" aria-label="Timetable">
          <SelectValue placeholder="Select Timetable" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="UG">New/Returning Students</SelectItem>
          <SelectItem value="AD">Adult Education</SelectItem>
          <SelectItem value="PS">Teacher Education</SelectItem>
          <SelectItem value="GR">Graduate Studies</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
