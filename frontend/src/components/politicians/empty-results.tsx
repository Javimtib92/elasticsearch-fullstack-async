import { Button } from "@/components/ui/button";
import { politicianService } from "@/services/politicians-service";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { type ChangeEventHandler, useRef } from "react";

export function EmptyResults() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (file: File) => {
      return politicianService.bulkUpload(file);
    },
    onSuccess: () => {
      console.log('invalidating')
      router.invalidate();
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
      // Do something with the selected file, like uploading or processing it
      mutation.mutate(file);
    }
  };

  return (
    <div className="flex items-center justify-center w-full py-12">
      {mutation.isError ? (
        <div>An error occurred: {mutation.error.message}</div>
      ) : null}
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
        <Button size="lg" onClick={handleFileSelect}>
          {mutation.isPending ? "..." : "Import CSV"}
        </Button>
      </div>
    </div>
  );
}
