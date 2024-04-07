import { type Politician, columns } from "@/components/politicians/columns";
import { DataTable } from "@/components/politicians/data-table";
import { createFileRoute } from "@tanstack/react-router";

async function getData({
  offset,
  limit,
}: { offset: number; limit: number }): Promise<Politician[]> {
  const page = Math.ceil((offset + 1) / limit); // Calculate page number
  const perPage = limit;

  const response = await fetch(
    `http://localhost:8080/politicians?page=${page}&per_page=${perPage}`,
  );
  const data = await response.json();

  return data;
}

export const Route = createFileRoute("/politicians")({
  loaderDeps: ({ search: { offset, limit } }) => ({ offset, limit }),
  loader: async ({ deps: { offset = 0, limit = 10 } }) => {
    const data = await getData({ offset, limit });
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
