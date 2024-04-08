import { columns } from "@/components/politicians/columns";
import { DataTable } from "@/components/politicians/data-table";
import { EmptyResults } from "@/components/politicians/empty-results";
import { politiciansQueryOptions } from "@/react-query/politicians-query";
import type { PoliticiansSearch } from "@/types/politicians";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/politicians")({
  validateSearch: (search: Record<string, unknown>): PoliticiansSearch => {
    return {
      page: Number(search?.page ?? 1),
      perPage: Number(search?.perPage ?? 10),
      filter: (search.filter as string) || "",
    };
  },
  loaderDeps: ({ search: { page, perPage } }) => ({ page, perPage }),
  loader: ({ context: { queryClient }, deps: { page, perPage } }) =>
    queryClient.ensureQueryData(politiciansQueryOptions(page, perPage)),
  component: PoliticiansPage,
  errorComponent: (_) => {
    return <EmptyResults />;
  },
});

function PoliticiansPage() {
  const { page, perPage } = Route.useSearch();
  const politiciansQuery = useSuspenseQuery(
    politiciansQueryOptions(page, perPage),
  );
  const data = politiciansQuery.data;

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
