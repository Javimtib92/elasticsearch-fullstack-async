import { Button } from "@/components/ui/button";
import { politicianService } from "@/services/politicians-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { type ChangeEventHandler, useRef } from "react";

export function EmptyResults() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => politicianService.bulkUpload(file),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["politicians"], type: "all" });
      router.invalidate();
    },
    onError: () => {
      console.log("error");
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    if (event?.target?.files?.length) {
      const file = event.target.files[0];
      mutation.mutate(file);
    }
  };

  return (
    <div className="flex items-center justify-center w-full py-12">
      <div className="grid items-center gap-4 text-center">
        <h3 className="font-bold text-2xl tracking-tight">
          No politicians data
        </h3>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Button
          size="lg"
          onClick={handleFileSelect}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "..." : "Import CSV"}
        </Button>
      </div>
    </div>
  );
}
