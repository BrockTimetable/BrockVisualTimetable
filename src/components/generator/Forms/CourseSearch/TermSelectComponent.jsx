import PropTypes from "prop-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TermSelectComponent({
  term,
  onTermChange,
  disabled = false,
}) {
  function handleTermChange(selectedTerm) {
    onTermChange(selectedTerm);
  }

  return (
    <div id="termSelectComponent">
      <Select value={term} onValueChange={handleTermChange} disabled={disabled}>
        <SelectTrigger className="w-full" aria-label="Term" disabled={disabled}>
          <SelectValue placeholder="Select Term" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FW">Fall/Winter 2026-27</SelectItem>
          <SelectItem value="SP" disabled>
            Spring 2026
          </SelectItem>
          <SelectItem value="SU">Summer 2026</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

TermSelectComponent.propTypes = {
  term: PropTypes.string.isRequired,
  onTermChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
