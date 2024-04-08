import { Button } from "@/components/ui/button";

export function EmptyResults() {
    return (
        <div className="flex items-center justify-center w-full py-12">
        <div className="grid items-center gap-4 text-center">
          <h3 className="font-bold text-2xl tracking-tight">No politicians data</h3>
          <Button size="lg">Import CSV</Button>
        </div>
      </div>
    )
}