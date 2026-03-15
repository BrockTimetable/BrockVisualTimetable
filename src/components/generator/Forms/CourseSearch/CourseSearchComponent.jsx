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

  const normalizedOptions = React.useMemo(() => {
    return courseOptions.map((option) => {
      if (typeof option === "string") {
        return {
          label: option,
          courseCode: option.replace(/\s+D\d+$/i, "").replace(/\s+/g, ""),
          duration: option.match(/D(\d+)$/i)?.[1] || "",
          courseName: "",
        };
      }

      const label =
        option.label ||
        option.value ||
        `${option.courseCode?.slice(0, 4) || ""} ${
          option.courseCode?.slice(4) || ""
        }${option.duration ? ` D${option.duration}` : ""}`.trim();

      return {
        label,
        courseCode: option.courseCode || "",
        duration: option.duration || "",
        courseName: option.courseName || "",
      };
    });
  }, [courseOptions]);

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
    if (filteredOptions.length > 0) {
      handleSelectOption(filteredOptions[0]);
      return;
    }
    onEnterPress(value);
    setOpen(false);
  };

  const filteredOptions = React.useMemo(() => {
    const query = (value || "").trim().toUpperCase();
    const results = [];
    for (let i = 0; i < normalizedOptions.length; i += 1) {
      const option = normalizedOptions[i];
      const label = option.label.toUpperCase();
      const courseName = option.courseName.toUpperCase();
      const matchesQuery =
        !query ||
        label.startsWith(query) ||
        label.includes(query) ||
        courseName.includes(query);

      if (matchesQuery) {
        results.push(option);
        if (results.length >= displayLimit) {
          break;
        }
      }
    }
    return results;
  }, [normalizedOptions, value, displayLimit]);

  const handleSelectOption = (option) => {
    setValue(option.label);
    onCourseCodeChange(null, option.label);
    setOpen(false);
    onEnterPress(option.label);
  };

  const groupedOptions = React.useMemo(() => {
    const groups = new Map();
    for (let i = 0; i < filteredOptions.length; i += 1) {
      const option = filteredOptions[i];
      const key = option.label.slice(0, 4).toUpperCase();
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
          aria-controls="course-search-list"
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
          <CommandList
            id="course-search-list"
            onScroll={handleListScroll}
            ref={listRef}
          >
            <CommandEmpty>No course found.</CommandEmpty>
            {groupedOptions.map((group) => (
              <CommandGroup key={group.group} heading={group.group}>
                {group.items.map((option) => (
                  <CommandItem
                    key={option.label}
                    value={`${option.label} ${option.courseName}`.trim()}
                    onSelect={() => {
                      handleSelectOption(option);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        option.label === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="min-w-0">
                      <div className="truncate">{option.label}</div>
                      {option.courseName && (
                        <div className="truncate text-xs text-muted-foreground">
                          {option.courseName}
                        </div>
                      )}
                    </div>
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
