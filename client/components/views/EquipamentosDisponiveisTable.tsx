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

interface EquipamentoDisponivel {
  id_patrimonio: string;
  nome_equipamento: string;
  preco_aquisicao: number | null;
  data_aquisicao: string | null;
  eh_reservavel: string;
  id_instalacao: number | null;
  nome_instalacao: string | null;
  tipo_instalacao: string | null;
  cpf_doador: string | null;
  nome_doador: string | null;
  data_doacao: string | null;
  status_disponibilidade: string;
}

interface EquipamentosDisponiveisTableProps {
  data: EquipamentoDisponivel[];
}

export default function EquipamentosDisponiveisTable({
  data,
}: EquipamentosDisponiveisTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<EquipamentoDisponivel>[] = useMemo(
    () => [
      {
        accessorKey: "nome_equipamento",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Equipamento
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nome_equipamento")}</div>,
      },
      {
        accessorKey: "id_patrimonio",
        header: "Patrimônio",
        cell: ({ row }) => <div>{row.getValue("id_patrimonio")}</div>,
      },
      {
        accessorKey: "nome_instalacao",
        header: "Instalação",
        cell: ({ row }) => <div>{row.getValue("nome_instalacao") || "—"}</div>,
      },
      {
        accessorKey: "tipo_instalacao",
        header: "Tipo Instalação",
        cell: ({ row }) => <div>{row.getValue("tipo_instalacao") || "—"}</div>,
      },
      {
        accessorKey: "preco_aquisicao",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Preço
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const preco = row.getValue("preco_aquisicao");
          if (preco === null || preco === undefined) return <div>—</div>;
          const precoNum =
            typeof preco === "string" ? parseFloat(preco) : Number(preco);
          if (isNaN(precoNum)) return <div>—</div>;
          return <div>R$ {precoNum.toFixed(2)}</div>;
        },
      },
      {
        accessorKey: "data_aquisicao",
        header: "Data Aquisição",
        cell: ({ row }) => {
          const data = row.getValue("data_aquisicao") as string | null;
          if (!data) return <div>—</div>;
          return <div>{new Date(data).toLocaleDateString("pt-BR")}</div>;
        },
      },
      {
        accessorKey: "nome_doador",
        header: "Doador",
        cell: ({ row }) => <div>{row.getValue("nome_doador") || "—"}</div>,
      },
      {
        accessorKey: "status_disponibilidade",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status_disponibilidade") as string;
          return (
            <div
              className={
                status === "Disponível"
                  ? "text-green-600 font-semibold"
                  : "text-gray-500"
              }
            >
              {status}
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
    getRowId: (row, index) => `equipamento-${row.id_patrimonio}-${index}`,
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
        Nenhum equipamento disponível encontrado.
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
            table
              .getColumn("nome_equipamento")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                    {column.id === "nome_equipamento"
                      ? "Equipamento"
                      : column.id === "id_patrimonio"
                      ? "Patrimônio"
                      : column.id === "nome_instalacao"
                      ? "Instalação"
                      : column.id === "tipo_instalacao"
                      ? "Tipo Instalação"
                      : column.id === "preco_aquisicao"
                      ? "Preço"
                      : column.id === "data_aquisicao"
                      ? "Data Aquisição"
                      : column.id === "nome_doador"
                      ? "Doador"
                      : column.id === "status_disponibilidade"
                      ? "Status"
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
