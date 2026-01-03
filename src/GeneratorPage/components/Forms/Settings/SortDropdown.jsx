import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="sort-options">Sort By</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="sort-options">
          <SelectValue placeholder="Select sort option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="sortByWaitingTime">Minimize Class Gaps</SelectItem>
          <SelectItem value="minimizeClassDays">Minimize Class Days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
