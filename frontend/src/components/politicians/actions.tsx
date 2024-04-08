import {
  type Dispatch,
  type FormEventHandler,
  type SetStateAction,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { politicianService } from "@/services/politicians-service";
import type { Politician } from "@/types/politicians";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";

export function Actions({ politician }: { politician: Politician }) {
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => politicianService.deletePolitician(politician._id),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ["politicians"],
        type: "all",
      });

      setDeleteDialogOpen(false);
      setDropdownMenuOpen(false);
    },
    onError: () => {
      console.log("error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (politicianData: Politician) =>
      politicianService.updatePolitician(politician._id, politicianData),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ["politicians"],
        type: "all",
      });

      setEditDialogOpen(false);
      setDropdownMenuOpen(false);
    },
    onError: () => {
      console.log("error");
    },
  });

  const onDeleteConfirmPrompt = () => {
    mutation.mutate();
  };

  const onEditConfirmPrompt: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (event.currentTarget) {
      const formData = new FormData(event.currentTarget);

      const formDataObject = Object.fromEntries(formData.entries());

      updateMutation.mutate({ ...politician, ...formDataObject });
    }
  };

  /**
   * This function takes care of hiding the dropdown menu when a dialog is closed as there's an issue
   * with nested Dialogs inside DropdownMenu.
   * @param open
   * @param callback
   */
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
        <Dialog
          open={editDialogOpen}
          onOpenChange={(openState) =>
            onDialogOpenChange(openState, setEditDialogOpen)
          }
        >
          <DialogTrigger className="w-full">
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {politician.nombre} data</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={onEditConfirmPrompt}>
              <div className="space-y-2">
                <Label htmlFor="partido">Partido</Label>
                <Input
                  id="partido"
                  name="partido"
                  placeholder="Añade un partido"
                  defaultValue={politician.partido}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  name="cargo"
                  placeholder="Añade un cargo"
                  defaultValue={politician.cargo}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ccaa">CCAA</Label>
                <Input
                  id="ccaa"
                  name="ccaa"
                  placeholder="Añade una comunidad autonoma"
                  defaultValue={politician.ccaa}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retribucionmensual">Retribución mensual</Label>
                <Input
                  id="retribucionmensual"
                  name="retribucionmensual"
                  placeholder="Añade una retribución mensual"
                  defaultValue={politician.retribucionmensual}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retribucionanual">Remuneración anual</Label>
                <Input
                  id="retribucionanual"
                  name="retribucionanual"
                  placeholder="Añade una retribución anual"
                  defaultValue={politician.retribucionanual}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  className="min-h-[100px]"
                  id="observaciones"
                  name="observaciones"
                  placeholder="Añade una observacion"
                  defaultValue={politician.observaciones}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  variant="default"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Removing..." : "Confirm"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onOpenChange={(openState) =>
            onDialogOpenChange(openState, setDeleteDialogOpen)
          }
        >
          <DialogTrigger className="w-full">
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Delete
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete this
                politician entry
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={onDeleteConfirmPrompt}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Removing..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
