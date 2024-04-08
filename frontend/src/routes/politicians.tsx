import { columns } from "@/components/politicians/columns";
import { DataTable } from "@/components/politicians/data-table";
import { politicianService } from "@/services/politiciansService";
import type { Politician, PoliticiansSearch } from "@/types/politicians";
import { createFileRoute } from "@tanstack/react-router";

async function getData({
  page,
  perPage,
}: { page: number; perPage: number }): Promise<Politician[]> {
  const response = await politicianService.getPoliticians({ page, perPage });

  return response;
}

export const Route = createFileRoute("/politicians")({
  validateSearch: (search: Record<string, unknown>): PoliticiansSearch => {
    return {
      page: Number(search?.page ?? 1),
      perPage: Number(search?.perPage ?? 10),
      filter: (search.filter as string) || "",
    };
  },
  loaderDeps: ({ search: { page, perPage } }) => ({ page, perPage }),
  loader: async ({ deps: { page, perPage } }) => {
    const data = await getData({ page, perPage });
    return {
      data,
    };
  },
  component: PoliticiansPage,
  errorComponent: ({ error, reset }) => {
    return <div>Error</div>;
  },
});

function PoliticiansPage() {
  const { data } = Route.useLoaderData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
