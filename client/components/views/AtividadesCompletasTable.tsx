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

interface AtividadeCompleta {
  id_atividade: number;
  nome_atividade: string;
  vagas_limite: number | null;
  data_inicio_periodo: string;
  data_fim_periodo: string | null;
  grupo_extensao: string | null;
  descricao_grupo: string | null;
  cpf_educador: string | null;
  nome_educador: string | null;
  conselho_educador: string | null;
  id_ocorrencia: number | null;
  dia_semana: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;
  id_instalacao: number | null;
  nome_instalacao: string | null;
  tipo_instalacao: string | null;
  total_participantes: number;
  vagas_disponiveis: number | null;
}

interface AtividadesCompletasTableProps {
  data: AtividadeCompleta[];
}

export default function AtividadesCompletasTable({
  data,
}: AtividadesCompletasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<AtividadeCompleta>[] = useMemo(
    () => [
      {
        accessorKey: "nome_atividade",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Atividade
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nome_atividade")}</div>,
      },
      {
        accessorKey: "grupo_extensao",
        header: "Grupo de Extensão",
        cell: ({ row }) => <div>{row.getValue("grupo_extensao") || "—"}</div>,
      },
      {
        accessorKey: "nome_educador",
        header: "Educador",
        cell: ({ row }) => <div>{row.getValue("nome_educador") || "—"}</div>,
      },
      {
        accessorKey: "dia_semana",
        header: "Dia da Semana",
        cell: ({ row }) => <div>{row.getValue("dia_semana") || "—"}</div>,
      },
      {
        accessorKey: "horario_inicio",
        header: "Horário",
        cell: ({ row }) => {
          const inicio = row.getValue("horario_inicio") as string | null;
          const fim = row.original.horario_fim;
          if (!inicio || !fim) return <div>—</div>;
          return (
            <div>
              {inicio.substring(0, 5)} - {fim.substring(0, 5)}
            </div>
          );
        },
      },
      {
        accessorKey: "nome_instalacao",
        header: "Instalação",
        cell: ({ row }) => <div>{row.getValue("nome_instalacao") || "—"}</div>,
      },
      {
        accessorKey: "total_participantes",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Participantes
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-semibold">
            {row.getValue("total_participantes")}
          </div>
        ),
      },
      {
        accessorKey: "vagas_limite",
        header: "Vagas",
        cell: ({ row }) => {
          const limite = row.getValue("vagas_limite") as number | null;
          const disponiveis = row.original.vagas_disponiveis;
          if (limite === null) return <div>—</div>;
          return (
            <div>
              {disponiveis !== null ? `${disponiveis}/${limite}` : limite}
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
    getRowId: (row, index) => {
      const ocorrencia = row.id_ocorrencia ?? `null-${index}`;
      const dia = row.dia_semana ?? "";
      const horario = row.horario_inicio ?? "";
      return `atividade-${row.id_atividade}-${ocorrencia}-${dia}-${horario}-${index}`;
    },
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
        Nenhuma atividade encontrada.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por atividade..."
          value={
            (table.getColumn("nome_atividade")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("nome_atividade")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filtrar por grupo..."
          value={
            (table.getColumn("grupo_extensao")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("grupo_extensao")
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
                    {column.id === "nome_atividade"
                      ? "Atividade"
                      : column.id === "grupo_extensao"
                      ? "Grupo de Extensão"
                      : column.id === "nome_educador"
                      ? "Educador"
                      : column.id === "dia_semana"
                      ? "Dia da Semana"
                      : column.id === "horario_inicio"
                      ? "Horário"
                      : column.id === "nome_instalacao"
                      ? "Instalação"
                      : column.id === "total_participantes"
                      ? "Participantes"
                      : column.id === "vagas_limite"
                      ? "Vagas"
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
