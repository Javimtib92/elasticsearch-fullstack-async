import { useState } from "react";

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
import { politicianService } from "@/services/politicians-service";
import type { Politician } from "@/types/politicians";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";

export function Actions({ politician }: { politician: Politician }) {
	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: () => politicianService.deletePolitician(politician._id),
		onSuccess: () => {
			queryClient.refetchQueries({
				queryKey: ["politicians"],
				type: "all",
			});

			setOpen(false);
		},
		onError: () => {
			console.log("error");
		},
	});

	const onDeleteConfirmPrompt = () => {
		mutation.mutate();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem>Edit</DropdownMenuItem>

					<DialogTrigger className="w-full">
						<DropdownMenuItem>Delete</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>
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
							variant="outline"
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
	);
}
