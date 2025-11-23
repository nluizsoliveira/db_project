"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InstalacaoOcupacao {
  id_instalacao: number;
  nome_instalacao: string;
  tipo_instalacao: string;
  capacidade: number | null;
  eh_reservavel: string;
  total_reservas: number;
  reservas_futuras: number;
  reservas_passadas: number;
  total_ocorrencias_semanais: number;
  total_equipamentos: number;
  percentual_ocupacao: number | null;
}

interface InstalacoesOcupacaoTableProps {
  data: InstalacaoOcupacao[];
}

export default function InstalacoesOcupacaoTable({
  data,
}: InstalacoesOcupacaoTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<InstalacaoOcupacao>[] = useMemo(
    () => [
      {
        accessorKey: "nome_instalacao",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Instalação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nome_instalacao")}</div>,
      },
      {
        accessorKey: "tipo_instalacao",
        header: "Tipo",
        cell: ({ row }) => <div>{row.getValue("tipo_instalacao")}</div>,
      },
      {
        accessorKey: "capacidade",
        header: "Capacidade",
        cell: ({ row }) => {
          const capacidade = row.getValue("capacidade") as number | null;
          return <div>{capacidade || "—"}</div>;
        },
      },
      {
        accessorKey: "total_reservas",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Total Reservas
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-semibold">{row.getValue("total_reservas")}</div>
        ),
      },
      {
        accessorKey: "reservas_futuras",
        header: "Reservas Futuras",
        cell: ({ row }) => (
          <div className="text-blue-600 font-semibold">
            {row.getValue("reservas_futuras")}
          </div>
        ),
      },
      {
        accessorKey: "reservas_passadas",
        header: "Reservas Passadas",
        cell: ({ row }) => (
          <div className="text-gray-600">
            {row.getValue("reservas_passadas")}
          </div>
        ),
      },
      {
        accessorKey: "total_ocorrencias_semanais",
        header: "Ocorrências Semanais",
        cell: ({ row }) => (
          <div>{row.getValue("total_ocorrencias_semanais")}</div>
        ),
      },
      {
        accessorKey: "total_equipamentos",
        header: "Equipamentos",
        cell: ({ row }) => <div>{row.getValue("total_equipamentos")}</div>,
      },
      {
        accessorKey: "percentual_ocupacao",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              % Ocupação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const percentual = row.getValue("percentual_ocupacao");
          if (percentual === null || percentual === undefined)
            return <div>—</div>;
          const percentualNum =
            typeof percentual === "string"
              ? parseFloat(percentual)
              : Number(percentual);
          if (isNaN(percentualNum)) return <div>—</div>;
          const color =
            percentualNum >= 80
              ? "text-red-600"
              : percentualNum >= 50
              ? "text-yellow-600"
              : "text-green-600";
          return (
            <div className={`font-semibold ${color}`}>
              {percentualNum.toFixed(1)}%
            </div>
          );
        },
      },
      {
        accessorKey: "eh_reservavel",
        header: "Reservável",
        cell: ({ row }) => {
          const reservavel = row.getValue("eh_reservavel") as string;
          return (
            <div
              className={
                reservavel === "S"
                  ? "text-green-600 font-semibold"
                  : "text-gray-500"
              }
            >
              {reservavel === "S" ? "Sim" : "Não"}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => `instalacao-${row.id_instalacao}-${index}`,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhuma instalação encontrada.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por instalação..."
          value={
            (table.getColumn("nome_instalacao")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("nome_instalacao")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filtrar por tipo..."
          value={
            (table.getColumn("tipo_instalacao")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("tipo_instalacao")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === "nome_instalacao"
                      ? "Instalação"
                      : column.id === "tipo_instalacao"
                      ? "Tipo"
                      : column.id === "capacidade"
                      ? "Capacidade"
                      : column.id === "total_reservas"
                      ? "Total Reservas"
                      : column.id === "reservas_futuras"
                      ? "Reservas Futuras"
                      : column.id === "reservas_passadas"
                      ? "Reservas Passadas"
                      : column.id === "total_ocorrencias_semanais"
                      ? "Ocorrências Semanais"
                      : column.id === "total_equipamentos"
                      ? "Equipamentos"
                      : column.id === "percentual_ocupacao"
                      ? "% Ocupação"
                      : column.id === "eh_reservavel"
                      ? "Reservável"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
