import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { politicianService } from "@/services/politicians-service";
import { formatToEur } from "@/utils/currency";
import { useQuery } from "@tanstack/react-query";
import { DefaultErrorBox } from "../default-error-box";
import { EmptyResults } from "../politicians-data-table/empty-results";

export function StatisticsCard() {
  const result = useQuery({
    queryKey: ["statistics"],
    queryFn: () => politicianService.statistics(),
  });

  if (!result.data) {
    return <EmptyResults />;
  }

  if (result.isError) {
    return <DefaultErrorBox message={result.error.message} />;
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="grid items-center gap-1">
        <CardTitle className="text-3xl font-bold">
          {formatToEur(result.data?.mean_salary)}
        </CardTitle>
        <CardDescription>Salario medio</CardDescription>
      </CardHeader>
      <CardContent>
        <div />
      </CardContent>
      <CardFooter className="grid items-center gap-1">
        <CardTitle className="text-3xl font-bold">
          {formatToEur(result.data?.median_salary)}
        </CardTitle>
        <CardDescription>Mediana de salarios</CardDescription>
      </CardFooter>
      <CardContent className="mt-8">
        <h1 className="text-2xl font-bold">Top 10 salarios Estado Español</h1>
        <div className="mt-8 grid gap-4">
          {result.data?.top_salaries.map((politician, index) => {
            return (
              <div className="flex items-center gap-4">
                <div className="w-4 text-sm text-green-400">#{index + 1}</div>
                <img
                  alt="Avatar"
                  className="rounded-full"
                  height="48"
                  src="https://placehold.co/48x48"
                  style={{
                    aspectRatio: "48/48",
                    objectFit: "cover",
                  }}
                  width="48"
                />
                <div className="grid gap-0.5">
                  <div className="text-lg font-semibold">
                    {politician.nombre}
                  </div>
                  <div className="text-sm text-gray-500">
                    {politician.cargo}
                  </div>
                </div>
                <div className="ml-auto font-semibold">
                  {formatToEur(politician.retribucionanual)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
