import { StatisticsCard } from "@/components/statistics-card/statistics-card";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/statistics")({
  component: Statistics,
});

function Statistics() {
  return (
    <div className="p-2">
      <StatisticsCard />
    </div>
  );
}
