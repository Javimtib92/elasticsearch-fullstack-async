import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import { StatisticsCard } from "../statistics-card";

export const handlers = [
  http.get("http://localhost:8080/statistics", () => {
    return HttpResponse.json({
      mean_salary: 50000,
      median_salary: 45000,
      top_salaries: [
        {
          nombre: "Politician 1",
          cargo: "Position 1",
          retribucionanual: 60000,
        },
        {
          nombre: "Politician 2",
          cargo: "Position 2",
          retribucionanual: 55000,
        },
      ],
    });
  }),
];
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterAll(() => server.close());

// Establish a new query client for each test
const queryClient = new QueryClient();

// Clean up after tests
afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
});

test("renders statistics card correctly", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <StatisticsCard />
    </QueryClientProvider>,
  );

  // Wait for data to be fetched and rendered
  await waitFor(() => {
    expect(screen.getByText("Salario medio")).toBeInTheDocument();
    expect(screen.getByText("Mediana de salarios")).toBeInTheDocument();
    expect(
      screen.getByText("Top 10 salarios Estado Español"),
    ).toBeInTheDocument();

    // Additional assertions for median salary, mean salary
    expect(screen.getByText("50.000,00 €")).toBeInTheDocument(); // mean salary
    expect(screen.getByText("45.000,00 €")).toBeInTheDocument(); // median salary

    // Additional assertions for top salaries
    expect(screen.getByText("60.000,00 €")).toBeInTheDocument();
    expect(screen.getByText("55.000,00 €")).toBeInTheDocument();
    expect(screen.getByText("Politician 1")).toBeInTheDocument();
    expect(screen.getByText("Politician 2")).toBeInTheDocument();
  });
});

test("renders no politician data when api fails", async () => {
  server.use(
    http.get("http://localhost:8080/statistics", () => {
      return new Response("error", { status: 500 });
    }),
  );

  render(
    <QueryClientProvider client={queryClient}>
      <StatisticsCard />
    </QueryClientProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText("No politicians data")).toBeInTheDocument();
  });
});
