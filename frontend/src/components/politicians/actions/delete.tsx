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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { politicianService } from "@/services/politicians-service";
import type { Politician } from "@/types/politicians";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction, useState } from "react";

export function DeleteAction({
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
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

  const onDeleteConfirmPrompt = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog
      open={deleteDialogOpen}
      onOpenChange={(openState) => onDialogOpen(openState, setDeleteDialogOpen)}
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
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={onDeleteConfirmPrompt}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Removing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
