import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { politicianService } from "@/services/politicians-service";
import { useQuery } from "@tanstack/react-query";

export function StatisticsCard() {
  const result = useQuery({
    queryKey: ["statistics"],
    queryFn: () => politicianService.statistics(),
  });

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="grid items-center gap-1">
        <CardTitle className="text-3xl font-bold">
          {result.data?.mean_salary}
        </CardTitle>
        <CardDescription>Mean Salary</CardDescription>
      </CardHeader>
      <CardContent>
        <div />
      </CardContent>
      <CardFooter className="grid items-center gap-1">
        <CardTitle className="text-3xl font-bold">
          {result.data?.median_salary}
        </CardTitle>
        <CardDescription>Median Salary</CardDescription>
      </CardFooter>
      <CardContent>
        <div className="mt-1 grid gap-2">
          {result.data?.top_salaries.map((politician) => {
            return (
              <div className="flex items-center gap-4">
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
                  {politician.retribucionanual}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
