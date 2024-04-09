import { columns } from "@/components/politicians-data-table/columns";
import { DataTable } from "@/components/politicians-data-table/data-table";
import { EmptyResults } from "@/components/politicians-data-table/empty-results";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { politiciansQueryOptions } from "@/react-query/politicians-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";

import type { PoliticiansSearch } from "@/types/politicians";
import type { PaginationState } from "@tanstack/react-table";

const PoliticiansSearchSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  name: z.string().optional(),
  gender: z.string().optional(),
});

export const Route = createFileRoute("/politicians")({
  validateSearch: (search: Record<string, unknown>): PoliticiansSearch => {
    const validatedSearch = PoliticiansSearchSchema.parse(search);

    return validatedSearch;
  },
  loaderDeps: ({ search: { page, perPage, name, gender } }) => ({
    page,
    perPage,
    name,
    gender,
  }),
  loader: ({
    // @ts-ignore
    context: { queryClient },
    deps: { page, perPage, name, gender },
  }) =>
    queryClient.ensureQueryData(
      politiciansQueryOptions(page, perPage, name, gender),
    ),
  component: PoliticiansPage,
  errorComponent: (_) => {
    return <EmptyResults />;
  },
});

function PoliticiansPage() {
  const navigate = useNavigate();
  const { page, perPage, name, gender } = Route.useSearch();
  const politiciansQuery = useSuspenseQuery(
    politiciansQueryOptions(page, perPage, name, gender),
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
        name: term || undefined,
        gender,
      },
      replace: true,
    });
  }, 300);

  const onGenderFilterChange = useCallback(
    (value: string) => {
      if (!value) {
        return;
      }
      navigate({
        to: "/politicians",
        search: {
          page: 1,
          perPage: 10,
          name: search || undefined,
          gender: value,
        },
        replace: true,
      });
    },
    [navigate, search],
  );

  useEffect(() => {
    if (page !== pagination.pageIndex + 1 || perPage !== pagination.pageSize) {
      navigate({
        to: "/politicians",
        search: {
          page: pagination.pageIndex + 1,
          perPage: pagination.pageSize,
          name: search || undefined,
          gender,
        },
      });
    }
  }, [navigate, page, perPage, pagination, search, gender]);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={politicians}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        totalPages={totalPages}
        initialSearch={name}
        initialGender={gender}
        onSearchChange={onSearchChange}
        onPaginationChange={setPagination}
        onGenderFilterChange={onGenderFilterChange}
      />
    </div>
  );
}
