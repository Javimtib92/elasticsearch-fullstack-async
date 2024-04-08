import { columns } from "@/components/politicians/columns";
import { DataTable } from "@/components/politicians/data-table";
import { EmptyResults } from "@/components/politicians/empty-results";
import { politiciansQueryOptions } from "@/react-query/politicians-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import type { PoliticiansSearch } from "@/types/politicians";
import type { PaginationState } from "@tanstack/react-table";

const PoliticiansSearchSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  filter: z.string().optional(),
});

export const Route = createFileRoute("/politicians")({
  validateSearch: (search: Record<string, unknown>): PoliticiansSearch => {
    const validatedSearch = PoliticiansSearchSchema.parse(search);

    return validatedSearch;
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
  const navigate = useNavigate();
  const { page, perPage } = Route.useSearch();
  const politiciansQuery = useSuspenseQuery(
    politiciansQueryOptions(page, perPage),
  );
  const politicians = politiciansQuery.data.politicians;
  const totalPages = politiciansQuery.data.meta.totalPages;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: (page || 1) - 1,
    pageSize: perPage || 10,
  });

  useEffect(() => {
    if (page !== pagination.pageIndex + 1 || perPage !== pagination.pageSize) {
      navigate({
        to: "/politicians",
        search: {
          page: pagination.pageIndex + 1,
          perPage: pagination.pageSize,
          filter: undefined,
        },
      });
    }
  }, [navigate, page, pagination]);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={politicians}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        totalPages={totalPages}
        onPaginationChange={setPagination}
      />
    </div>
  );
}
