"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";

import type { Politician } from "@/types/politicians";
import { Actions } from "./actions/actions";
import { formatToEur } from "@/utils/currency";

function toCurrencyCell(field: keyof Politician) {
  return ({ row }: { row: Row<Politician> }) => {
    const sueldoBase = Number.parseFloat(row.getValue(field));
    const formatted = formatToEur(sueldoBase);

    return <div className="text-right font-medium">{formatted}</div>;
  };
}

/**
 * I choosed not to show all data because there's a lot of columns and for demo purposes I'll keep it simple
 */
export const columns: ColumnDef<Politician>[] = [
  {
    id: "image",
    cell: (_) => {
      return (
        <div className="w-8 h-8">
          <img
            alt="Politician"
            className="aspect-square rounded-md object-cover"
            height="32"
            src="https://placehold.co/32x32"
            width="32"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "genero",
    header: "Género",
  },
  {
    accessorKey: "partido",
    header: "Partido",
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
  },
  {
    accessorKey: "ccaa",
    header: "CCAA",
  },
  {
    accessorKey: "retribucionmensual",
    header: () => <div className="text-right">Retribución Mensual</div>,
    cell: toCurrencyCell("retribucionmensual"),
  },
  {
    accessorKey: "retribucionanual",
    header: () => <div className="text-right">Retribución Anual</div>,
    cell: toCurrencyCell("retribucionanual"),
  },
  {
    accessorKey: "observaciones",
    header: "Observaciones",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <Actions politician={row.original} />;
    },
  },
];
