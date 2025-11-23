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

interface ReservaEquipamentoCompleta {
  id_reserva_equip: number;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
  id_equipamento: string;
  nome_equipamento: string;
  id_instalacao: number | null;
  nome_instalacao: string | null;
  tipo_instalacao: string | null;
  cpf_responsavel: string;
  nome_responsavel: string;
  email_responsavel: string;
  celular_responsavel: string | null;
  nusp_responsavel: string;
  categoria_responsavel: string;
}

interface ReservasEquipamentosCompletasTableProps {
  data: ReservaEquipamentoCompleta[];
}

export default function ReservasEquipamentosCompletasTable({
  data,
}: ReservasEquipamentosCompletasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<ReservaEquipamentoCompleta>[] = useMemo(
    () => [
      {
        accessorKey: "data_reserva",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Data
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("data_reserva"));
          return <div>{date.toLocaleDateString("pt-BR")}</div>;
        },
      },
      {
        accessorKey: "horario_inicio",
        header: "Horário",
        cell: ({ row }) => {
          const inicio = row.getValue("horario_inicio") as string;
          const fim = row.original.horario_fim;
          return (
            <div>
              {inicio.substring(0, 5)} - {fim.substring(0, 5)}
            </div>
          );
        },
      },
      {
        accessorKey: "nome_equipamento",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Equipamento
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nome_equipamento")}</div>,
      },
      {
        accessorKey: "nome_instalacao",
        header: "Instalação",
        cell: ({ row }) => {
          const instalacao = row.getValue("nome_instalacao") as string | null;
          return <div>{instalacao || "-"}</div>;
        },
      },
      {
        accessorKey: "tipo_instalacao",
        header: "Tipo Instalação",
        cell: ({ row }) => {
          const tipo = row.getValue("tipo_instalacao") as string | null;
          return <div>{tipo || "-"}</div>;
        },
      },
      {
        accessorKey: "nome_responsavel",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Responsável
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nome_responsavel")}</div>,
      },
      {
        accessorKey: "nusp_responsavel",
        header: "NUSP",
        cell: ({ row }) => <div>{row.getValue("nusp_responsavel")}</div>,
      },
      {
        accessorKey: "email_responsavel",
        header: "Email",
        cell: ({ row }) => <div>{row.getValue("email_responsavel")}</div>,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => `reserva-equip-${row.id_reserva_equip}-${index}`,
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
        Nenhuma reserva de equipamento encontrada.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por equipamento..."
          value={
            (table.getColumn("nome_equipamento")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table.getColumn("nome_equipamento")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filtrar por responsável..."
          value={
            (table.getColumn("nome_responsavel")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("nome_responsavel")
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
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "data_reserva"
                      ? "Data"
                      : column.id === "horario_inicio"
                      ? "Horário"
                      : column.id === "nome_equipamento"
                      ? "Equipamento"
                      : column.id === "nome_instalacao"
                      ? "Instalação"
                      : column.id === "tipo_instalacao"
                      ? "Tipo Instalação"
                      : column.id === "nome_responsavel"
                      ? "Responsável"
                      : column.id === "nusp_responsavel"
                      ? "NUSP"
                      : column.id === "email_responsavel"
                      ? "Email"
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
