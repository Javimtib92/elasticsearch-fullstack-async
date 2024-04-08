import { columns } from "@/components/politicians/columns";
import { DataTable } from "@/components/politicians/data-table";
import { EmptyResults } from "@/components/politicians/empty-results";
import { useDebounceCallback } from "@/hooks/useDebounceCallback";
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
  name: z.string().optional(),
});

export const Route = createFileRoute("/politicians")({
  validateSearch: (search: Record<string, unknown>): PoliticiansSearch => {
    const validatedSearch = PoliticiansSearchSchema.parse(search);

    return validatedSearch;
  },
  loaderDeps: ({ search: { page, perPage, name } }) => ({
    page,
    perPage,
    name,
  }),
  loader: ({ context: { queryClient }, deps: { page, perPage, name } }) =>
    queryClient.ensureQueryData(politiciansQueryOptions(page, perPage, name)),
  component: PoliticiansPage,
  errorComponent: (_) => {
    return <EmptyResults />;
  },
});

function PoliticiansPage() {
  const navigate = useNavigate();
  const { page, perPage, name } = Route.useSearch();
  const politiciansQuery = useSuspenseQuery(
    politiciansQueryOptions(page, perPage, name),
  );
  const politicians = politiciansQuery.data.politicians;
  const totalPages = politiciansQuery.data.meta.totalPages;

  const [search, setSearch] = useState<string | undefined>(name);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: (page || 1) - 1,
    pageSize: perPage || 10,
  });

  const onSearchChange = useDebounceCallback((term: string) => {
    setPagination(() => ({ pageIndex: 0, pageSize: 10 }));
    setSearch(term);

    navigate({
      to: "/politicians",
      search: {
        page: 1,
        perPage: 10,
        name: term || undefined, // default to undefined because I want empty strings to be undefined so that we avoid the query param to be present
      },
      replace: true,
    });
  }, 300);

  useEffect(() => {
    if (page !== pagination.pageIndex + 1 || perPage !== pagination.pageSize) {
      navigate({
        to: "/politicians",
        search: {
          page: pagination.pageIndex + 1,
          perPage: pagination.pageSize,
          name: search || undefined, // default to undefined because I want empty strings to be undefined so that we avoid the query param to be present
        },
      });
    }
  }, [navigate, page, perPage, pagination, search]);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={politicians}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        totalPages={totalPages}
        initialSearch={name}
        onSearchChange={onSearchChange}
        onPaginationChange={setPagination}
      />
    </div>
  );
}
