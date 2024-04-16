import { type Dispatch, type SetStateAction, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Politician } from "@/types/politicians";
import { MoreHorizontal } from "lucide-react";
import { DeleteAction } from "./delete";
import { EditAction } from "./edit";

export function Actions({ politician }: { politician: Politician }) {
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);

  const onDialogOpenChange = (
    open: boolean,
    callback: Dispatch<SetStateAction<boolean>>,
  ) => {
    if (!open) {
      setDropdownMenuOpen(false);
    }

    callback(open);
  };

  return (
    <DropdownMenu open={dropdownMenuOpen} onOpenChange={setDropdownMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditAction
          politician={politician}
          onDialogOpen={onDialogOpenChange}
          setDropdownMenuOpen={setDropdownMenuOpen}
        />

        <DeleteAction
          politician={politician}
          onDialogOpen={onDialogOpenChange}
          setDropdownMenuOpen={setDropdownMenuOpen}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
