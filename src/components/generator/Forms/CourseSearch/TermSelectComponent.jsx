import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TermSelectComponent({ onTermChange }) {
  const [term, setTerm] = React.useState("SP");

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
          <SelectItem disabled value="FW">
            Fall/Winter
          </SelectItem>
          <SelectItem value="SP">Spring 2026</SelectItem>
          <SelectItem value="SU">Summer 2026</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
