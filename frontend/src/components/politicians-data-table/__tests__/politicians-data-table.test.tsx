import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "../data-table";
import { describe, test, expect, vi } from "vitest";
import { columns } from "../columns";
import { mockData } from "../__mocks__/politicians.mock";

const onPaginationChange = vi.fn();
const onSearchChange = vi.fn();
const onGenderFilterChange = vi.fn();

describe("politicians-data-table tests", () => {
  test("renders DataTable component with data fetched from API", async () => {
    render(
      <DataTable
        data={mockData}
        pageSize={1}
        columns={columns}
        onPaginationChange={onPaginationChange}
        onSearchChange={onSearchChange}
        onGenderFilterChange={onGenderFilterChange}
      />,
    );

    const johnDoeRow = await screen.findByText("John Doe");
    const janeDoeRow = await screen.findByText("Jane Doe");

    expect(johnDoeRow).toBeInTheDocument();
    expect(janeDoeRow).toBeInTheDocument();
  });

  test("Pagination changes when next page button is clicked", async () => {
    render(
      <DataTable
        data={mockData}
        pageSize={1}
        totalPages={2}
        columns={columns}
        onPaginationChange={onPaginationChange}
        onSearchChange={onSearchChange}
        onGenderFilterChange={onGenderFilterChange}
      />,
    );
    const nextPageButton = screen.getByTestId("next-page");

    fireEvent.click(nextPageButton);

    expect(onPaginationChange).toHaveBeenCalled();
  });

  test("Search functionality filters data correctly in DataTable", async () => {
    render(
      <DataTable
        data={mockData}
        pageSize={1}
        columns={columns}
        onPaginationChange={onPaginationChange}
        onSearchChange={onSearchChange}
        onGenderFilterChange={onGenderFilterChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search politicians..."), {
      target: { value: "Jane" },
    });

    expect(onSearchChange).toHaveBeenCalledWith("Jane");
  });

  test("Filter changes when gender filter is selected", async () => {
    render(
      <DataTable
        data={mockData}
        pageSize={1}
        columns={columns}
        onPaginationChange={onPaginationChange}
        onSearchChange={onSearchChange}
        onGenderFilterChange={onGenderFilterChange}
      />,
    );
    fireEvent.click(screen.getByText("Filtrar genero"));

    fireEvent.click(screen.getByText("Mujer"));

    expect(onGenderFilterChange).toHaveBeenCalledWith("Mujer");
  });
});
