import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CourseSearchComponent({
  onCourseCodeChange,
  courseOptions,
  onEnterPress,
  timetableType,
  term,
  value,
  setValue,
}) {
  const [open, setOpen] = React.useState(false);
  const [displayLimit, setDisplayLimit] = React.useState(200);
  const listRef = React.useRef(null);
  const PAGE_SIZE = 200;

  React.useEffect(() => {
    setDisplayLimit(PAGE_SIZE);
  }, [value]);

  const handleListScroll = (event) => {
    const listEl = event.currentTarget;
    const nearBottom =
      listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 40;
    if (nearBottom) {
      setDisplayLimit((prev) =>
        Math.min(prev + PAGE_SIZE, courseOptions.length),
      );
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key !== "Enter") return;
    const listEl = listRef.current;
    const selectedItem = listEl?.querySelector('[data-selected="true"]');
    if (selectedItem) return;
    event.preventDefault();
    onEnterPress(value);
    setOpen(false);
  };

  const filteredOptions = React.useMemo(() => {
    const query = (value || "").trim().toUpperCase();
    const results = [];
    for (let i = 0; i < courseOptions.length; i += 1) {
      const option = courseOptions[i];
      if (!query || option.toUpperCase().startsWith(query)) {
        results.push(option);
        if (results.length >= displayLimit) {
          break;
        }
      }
    }
    return results;
  }, [courseOptions, value, displayLimit]);

  const groupedOptions = React.useMemo(() => {
    const groups = new Map();
    for (let i = 0; i < filteredOptions.length; i += 1) {
      const option = filteredOptions[i];
      const key = option.slice(0, 4).toUpperCase();
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(option);
    }
    const grouped = [];
    for (const [group, items] of groups.entries()) {
      grouped.push({ group, items });
    }
    return grouped;
  }, [filteredOptions]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between transition-none"
        >
          {value ? value : "Add a course"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search courses..."
            value={value}
            onValueChange={(newValue) => {
              const nextValue = newValue || "";
              setValue(nextValue);
              onCourseCodeChange(null, nextValue);
            }}
            onKeyDown={handleInputKeyDown}
          />
          <CommandList onScroll={handleListScroll} ref={listRef}>
            <CommandEmpty>No course found.</CommandEmpty>
            {groupedOptions.map((group) => (
              <CommandGroup key={group.group} heading={group.group}>
                {group.items.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={(currentValue) => {
                      setValue(currentValue);
                      onCourseCodeChange(null, currentValue);
                      setOpen(false);
                      onEnterPress(currentValue);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        option === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
