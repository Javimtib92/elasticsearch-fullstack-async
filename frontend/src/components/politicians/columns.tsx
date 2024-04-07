"use client";

import type { ColumnDef } from "@tanstack/react-table";

export type Politician = {
  nombre: string;
  partido: string;
  partido_para_filtro: string;
  genero: string;
  cargo_para_filtro: string;
  cargo: string;
  institucion: string;
  ccaa: string;
  sueldobase_sueldo: number;
  complementos_sueldo: number;
  pagasextra_sueldo: number;
  otrasdietaseindemnizaciones_sueldo: number;
  trienios_sueldo: number;
  retribucionmensual: number;
  retribucionanual: number;
  observaciones: string;
  _id: string;
};

function toCurrencyCell(field: keyof Politician) {
  return ({ row }) => {
    const sueldoBase = Number.parseFloat(row.getValue(field));
    const formatted = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(sueldoBase);

    return <div className="text-right font-medium">{formatted}</div>;
  };
}

export const columns: ColumnDef<Politician>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "partido",
    header: "Partido",
  },
  {
    accessorKey: "genero",
    header: "Género",
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
  },
  {
    accessorKey: "institucion",
    header: "Institución",
  },
  {
    accessorKey: "ccaa",
    header: "CCAA",
  },
  {
    accessorKey: "sueldobase_sueldo",
    header: () => <div className="text-right">Sueldo Base</div>,
    cell: toCurrencyCell("sueldobase_sueldo"),
  },
  {
    accessorKey: "complementos_sueldo",
    header: () => <div className="text-right">Complementos Sueldo</div>,
    cell: toCurrencyCell("complementos_sueldo"),
  },
  {
    accessorKey: "pagasextra_sueldo",
    header: () => <div className="text-right">Pagas Extra Sueldo</div>,
    cell: toCurrencyCell("pagasextra_sueldo"),
  },
  {
    accessorKey: "otrasdietaseindemnizaciones_sueldo",
    header: () => (
      <div className="text-right">Otras Dietas e Indemnizaciones Sueldo</div>
    ),
    cell: toCurrencyCell("otrasdietaseindemnizaciones_sueldo"),
  },
  {
    accessorKey: "trienios_sueldo",
    header: () => <div className="text-right">Trienios Sueldo</div>,
    cell: toCurrencyCell("trienios_sueldo"),
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
];
