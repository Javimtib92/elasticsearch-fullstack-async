import { useComboBox } from "@/components/ui/combo-box";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { useEffect } from "react";

type FilterOption = {
  value: string;
  label: string;
};

export function Filter({
  options,
  onSelectedChange = () => {},
}: { options: FilterOption[]; onSelectedChange?: (value: string) => void }) {
  const { selected, setSelected, setOpen } = useComboBox();

  useEffect(() => {
    if (selected) {
      onSelectedChange(selected.value);
    }
  }, [onSelectedChange, selected]);

  return (
    <Command>
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={(value) => {
                setSelected(options.find((o) => o.value === value) || null);
                setOpen(false);
              }}
            >
              {option.label}
              <CheckIcon
                className={cn(
                  "ml-auto h-4 w-4",
                  selected?.value === option.value
                    ? "opacity-100"
                    : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
