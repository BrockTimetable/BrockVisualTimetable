import { useState } from "react";
import "../../../css/TermSelect.css";

import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

export default function TimetableSelectComponent({ onTableChange }) {
  const [timetable, setTimetable] = useState("UG");

  function handleTermChange(selectedTimetable) {
    setTimetable(selectedTimetable);
    onTableChange(selectedTimetable);
  }

  return (
    <div className="form-select">
      <Label htmlFor="timetable-select">Timetable</Label>
      <Select value={timetable} onValueChange={handleTermChange}>
        <SelectTrigger id="timetable-select">
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
