import { politicianService } from "@/services/politicians-service";
import type { Politician } from "@/types/politicians";
import { queryOptions } from "@tanstack/react-query";

async function getData({
  page,
  perPage,
  name,
  gender,
}: {
  page?: number;
  perPage?: number;
  name?: string;
  gender?: string;
}): Promise<{
  politicians: Politician[];
  meta: { totalPages: number };
}> {
  const response = await politicianService.getPoliticians({
    page,
    perPage,
    name,
    gender,
  });

  return {
    politicians: response.data,
    meta: {
      totalPages: response.total_pages,
    },
  };
}

export const politiciansQueryOptions = (
  page?: number,
  perPage?: number,
  name?: string,
  gender?: string,
) =>
  queryOptions({
    queryKey: ["politicians", { page, perPage, name, gender }],
    queryFn: () => getData({ page, perPage, name, gender }),
  });
