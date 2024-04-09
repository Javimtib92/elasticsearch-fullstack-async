import {
  type Dispatch,
  type FormEventHandler,
  type SetStateAction,
  useState,
} from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { politicianService } from "@/services/politicians-service";
import type { Politician } from "@/types/politicians";
import { Button } from "@/components/ui/button";

export function EditAction({
  politician,
  onDialogOpen,
  setDropdownMenuOpen,
}: {
  politician: Politician;
  onDialogOpen: (
    open: boolean,
    callback: Dispatch<SetStateAction<boolean>>,
  ) => void;
  setDropdownMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const onEditConfirmPrompt: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (event.currentTarget) {
      const formData = new FormData(event.currentTarget);

      const formDataObject = Object.fromEntries(formData.entries());

      updateMutation.mutate({ ...politician, ...formDataObject });
    }
  };

  return (
    <Dialog
      open={editDialogOpen}
      onOpenChange={(openState) => onDialogOpen(openState, setEditDialogOpen)}
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
