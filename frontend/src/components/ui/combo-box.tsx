"use client";

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
  createContext,
} from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterIcon } from "lucide-react";

type SelectedType = {
  label: string;
};

type ComboBoxContextType<T> = {
  selected: T | null;
  setSelected: React.Dispatch<React.SetStateAction<T | null>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const ComboBoxContext = createContext<ComboBoxContextType<any>>({
  selected: null,
  setSelected: () => {},
  setOpen: () => {},
});

export const ComboBoxProvider = <T extends SelectedType>({
  children,
  selected,
  setSelected,
  setOpen,
}: {
  children: ReactNode;
  selected: T | null;
  setSelected: Dispatch<SetStateAction<T | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <ComboBoxContext.Provider value={{ selected, setSelected, setOpen }}>
      {children}
    </ComboBoxContext.Provider>
  );
};

export const useComboBox = () => useContext(ComboBoxContext);

export function ComboBoxResponsive<T extends SelectedType>({
  label,
  initialValue,
  content,
}: { label: string; initialValue: T | null; content: ReactNode }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selected, setSelected] = useState<T | null>(initialValue);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            <FilterIcon className="mr-2 h-4 w-4" />
            {selected ? <>{selected.label}</> : label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <ComboBoxProvider
            selected={selected}
            setSelected={setSelected}
            setOpen={setOpen}
          >
            {content}
          </ComboBoxProvider>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          <FilterIcon className="mr-2 h-4 w-4" />
          {selected ? <>{selected.label}</> : label}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <ComboBoxProvider
            selected={selected}
            setSelected={setSelected}
            setOpen={setOpen}
          >
            {content}
          </ComboBoxProvider>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
