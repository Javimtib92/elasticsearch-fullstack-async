import { politicianService } from "@/services/politicians-service";
import type { Politician } from "@/types/politicians";
import { queryOptions } from "@tanstack/react-query";

async function getData({
  page,
  perPage,
}: { page?: number; perPage?: number }): Promise<{
  politicians: Politician[];
  meta: { totalPages: number };
}> {
  const response = await politicianService.getPoliticians({ page, perPage });

  return {
    politicians: response.data,
    meta: {
      totalPages: response.total_pages,
    },
  };
}

export const politiciansQueryOptions = (page?: number, perPage?: number) =>
  queryOptions({
    queryKey: ["politicians", { page, perPage }],
    queryFn: () => getData({ page, perPage }),
  });
