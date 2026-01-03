import { useMemo } from "react";
import "../../../css/DepartmentSearch.css";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../../components/ui/command";

export default function CourseSearchComponent({
  onCourseCodeChange,
  courseOptions,
  onEnterPress,
  inputValue,
  setInputValue,
}) {
  const courseCodeChangeHandler = (e, newValue) => {
    onCourseCodeChange(e, newValue);
  };

  const groupedOptions = useMemo(() => {
    const grouped = {};
    courseOptions.forEach((option) => {
      const group = option.slice(0, 4).toUpperCase();
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(option);
    });
    return grouped;
  }, [courseOptions]);

  const shouldShowList = inputValue.trim().length > 0;

  return (
    <div className="w-full">
      <Command
        className="rounded-md border border-input"
        filter={(value, search) =>
          value.toLowerCase().startsWith(search.toLowerCase()) ? 1 : 0
        }
      >
        <CommandInput
          value={inputValue}
          onValueChange={(newValue) => {
            setInputValue(newValue);
            courseCodeChangeHandler(null, newValue);
          }}
          placeholder="Add a course"
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              onEnterPress(event);
            }
          }}
        />
        {shouldShowList && (
          <CommandList className="pointer-events-auto">
            {Object.entries(groupedOptions).map(([group, options]) => (
              <CommandGroup key={group} heading={group}>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    className="cursor-pointer"
                    onSelect={() => {
                      setInputValue(option);
                      courseCodeChangeHandler(null, option);
                    }}
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
