import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SortDropdown({ value, onValueChange }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full" aria-label="Sort options">
        <SelectValue placeholder="Sort options" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Default</SelectItem>
        <SelectItem value="sortByWaitingTime">Minimize Class Gaps</SelectItem>
        <SelectItem value="minimizeClassDays">Minimize Class Days</SelectItem>
      </SelectContent>
    </Select>
  );
}
