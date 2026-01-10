import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TermSelectComponent({ onTermChange }) {
  const [term, setTerm] = React.useState("FW");

  function handleTermChange(selectedTerm) {
    setTerm(selectedTerm);
    onTermChange(selectedTerm);
  }

  return (
    <div id="termSelectComponent">
      <Select value={term} onValueChange={handleTermChange}>
        <SelectTrigger className="w-full" aria-label="Term">
          <SelectValue placeholder="Select Term" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FW">Fall/Winter</SelectItem>
          <SelectItem disabled value="SP">
            Spring 2025
          </SelectItem>
          <SelectItem disabled value="SU">
            Summer 2025
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
