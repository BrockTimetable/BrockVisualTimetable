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

export default function TermSelectComponent({ onTermChange }) {
  const [term, setTerm] = useState("FW");

  function handleTermChange(selectedTerm) {
    setTerm(selectedTerm);
    onTermChange(selectedTerm);
  }

  return (
    <div id="termSelectComponent" className="form-select">
      <Label htmlFor="term-select">Term</Label>
      <Select value={term} onValueChange={handleTermChange}>
        <SelectTrigger id="term-select">
          <SelectValue placeholder="Select Term" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FW">Fall/Winter</SelectItem>
          <SelectItem value="SP" disabled>
            Spring 2025
          </SelectItem>
          <SelectItem value="SU" disabled>
            Summer 2025
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
