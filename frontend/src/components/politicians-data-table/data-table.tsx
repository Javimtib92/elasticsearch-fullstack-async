"use client";

import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchIcon } from "lucide-react";
import type { ChangeEventHandler } from "react";
import { DataTablePagination } from "./data-table-pagination";
import { GenderFilter } from "./gender-filter";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  initialSearch?: string;
  initialGender?: string;
  onPaginationChange: OnChangeFn<PaginationState>;
  onSearchChange?: (term: string) => void;
  onGenderFilterChange?: (gender: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageIndex = 0,
  pageSize = 10,
  totalPages = 0,
  initialSearch,
  initialGender,
  onPaginationChange,
  onSearchChange,
  onGenderFilterChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    rowCount: totalPages * pageSize,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    onPaginationChange,
  });

  const onSearchInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (onSearchChange) {
      onSearchChange(event?.target.value);
    }
  };

  return (
    <div className="rounded-md border shadow-sm">
      <div className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              className="w-full bg-white shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3 dark:bg-gray-950"
              placeholder="Search politicians..."
              type="search"
              defaultValue={initialSearch}
              onChange={onSearchInputChange}
            />
          </div>

          <GenderFilter
            initialValue={initialGender}
            onSelectedChange={onGenderFilterChange}
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
