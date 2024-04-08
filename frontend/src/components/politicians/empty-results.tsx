import { Button } from "@/components/ui/button";
import { politicianService } from "@/services/politicians-service";
import { useRouter } from "@tanstack/react-router";
import { type ChangeEventHandler, useRef, useState } from "react";

export function EmptyResults() {
  const [loading, isLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
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
      await politicianService.bulkUpload(file);

      router.invalidate();
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
        <Button size="lg" onClick={handleFileSelect}>
          Import CSV
        </Button>
      </div>
    </div>
  );
}
