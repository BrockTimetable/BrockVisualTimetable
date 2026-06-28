import PropTypes from "prop-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TimetableSelectComponent({
  timetable,
  onTableChange,
  disabled = false,
}) {
  function handleTimetableChange(selectedTimetable) {
    onTableChange(selectedTimetable);
  }

  return (
    <div>
      <Select
        value={timetable}
        onValueChange={handleTimetableChange}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-full"
          aria-label="Timetable"
          disabled={disabled}
        >
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

TimetableSelectComponent.propTypes = {
  timetable: PropTypes.string.isRequired,
  onTableChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
