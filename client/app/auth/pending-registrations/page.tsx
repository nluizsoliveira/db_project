"use client";

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { apiGet, apiPost } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ArrowUpDown, ChevronDown, Check, X } from "lucide-react";
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

interface Registration {
  id_solicitacao: number;
  cpf_pessoa: string;
  nome: string;
  email: string;
  nusp: string;
  data_solicitacao: string;
  data_aprovacao?: string;
  data_rejeicao?: string;
  cpf_admin_aprovador?: string;
  nome_admin_aprovador?: string;
  motivo_rejeicao?: string;
}

interface PendingRegistrationsTableProps {
  registrations: Registration[];
  processingIds: Set<number>;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

interface ApprovedRegistrationsTableProps {
  registrations: Registration[];
}

interface RejectedRegistrationsTableProps {
  registrations: Registration[];
}

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR");
};

function PendingRegistrationsTable({
  registrations,
  processingIds,
  onApprove,
  onReject,
}: PendingRegistrationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Registration>[] = useMemo(
    () => [
      {
        accessorKey: "cpf_pessoa",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              CPF
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("cpf_pessoa")}</div>
        ),
      },
      {
        accessorKey: "nome",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nome")}</div>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "nusp",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              NUSP
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nusp") || "—"}</div>,
      },
      {
        accessorKey: "data_solicitacao",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Data Solicitação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{formatDate(row.getValue("data_solicitacao"))}</div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const registration = row.original;
          const isProcessing = processingIds.has(registration.id_solicitacao);

          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApprove(registration.id_solicitacao)}
                disabled={isProcessing}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processando..." : <Check className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReject(registration.id_solicitacao)}
                disabled={isProcessing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processando..." : <X className="h-4 w-4" />}
              </Button>
            </div>
          );
        },
      },
    ],
    [processingIds, onApprove, onReject]
  );

  const table = useReactTable({
    data: registrations,
    columns,
    getRowId: (row) => row.id_solicitacao.toString(),
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

  if (registrations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
        <p className="text-gray-500">
          Nenhuma solicitação de cadastro pendente.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por nome..."
          value={
            (table.getColumn("nome")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("nome")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filtrar por email..."
          value={
            (table.getColumn("email")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
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
                    {column.id === "cpf_pessoa"
                      ? "CPF"
                      : column.id === "nome"
                      ? "Nome"
                      : column.id === "email"
                      ? "Email"
                      : column.id === "nusp"
                      ? "NUSP"
                      : column.id === "data_solicitacao"
                      ? "Data Solicitação"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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

function ApprovedRegistrationsTable({
  registrations,
}: ApprovedRegistrationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Registration>[] = useMemo(
    () => [
      {
        accessorKey: "cpf_pessoa",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              CPF
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("cpf_pessoa")}</div>
        ),
      },
      {
        accessorKey: "nome",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nome")}</div>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "nusp",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              NUSP
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nusp") || "—"}</div>,
      },
      {
        accessorKey: "data_solicitacao",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Data Solicitação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{formatDate(row.getValue("data_solicitacao"))}</div>
        ),
      },
      {
        accessorKey: "data_aprovacao",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Data Aprovação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{formatDate(row.getValue("data_aprovacao") || "")}</div>
        ),
      },
      {
        accessorKey: "nome_admin_aprovador",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Aprovado por
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{row.getValue("nome_admin_aprovador") || "—"}</div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: registrations,
    columns,
    getRowId: (row) => row.id_solicitacao.toString(),
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

  if (registrations.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-white p-8 text-center shadow">
        <p className="text-gray-500">Nenhuma solicitação aprovada.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por nome..."
          value={
            (table.getColumn("nome")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("nome")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filtrar por email..."
          value={
            (table.getColumn("email")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
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
                    {column.id === "cpf_pessoa"
                      ? "CPF"
                      : column.id === "nome"
                      ? "Nome"
                      : column.id === "email"
                      ? "Email"
                      : column.id === "nusp"
                      ? "NUSP"
                      : column.id === "data_solicitacao"
                      ? "Data Solicitação"
                      : column.id === "data_aprovacao"
                      ? "Data Aprovação"
                      : column.id === "nome_admin_aprovador"
                      ? "Aprovado por"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
                <TableRow key={row.id} className="bg-green-50/30">
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

function RejectedRegistrationsTable({
  registrations,
}: RejectedRegistrationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Registration>[] = useMemo(
    () => [
      {
        accessorKey: "cpf_pessoa",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              CPF
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("cpf_pessoa")}</div>
        ),
      },
      {
        accessorKey: "nome",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nome")}</div>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "nusp",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              NUSP
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("nusp") || "—"}</div>,
      },
      {
        accessorKey: "data_solicitacao",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Data Solicitação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{formatDate(row.getValue("data_solicitacao"))}</div>
        ),
      },
      {
        accessorKey: "data_rejeicao",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Data Rejeição
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{formatDate(row.getValue("data_rejeicao") || "")}</div>
        ),
      },
      {
        accessorKey: "nome_admin_aprovador",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Rejeitado por
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{row.getValue("nome_admin_aprovador") || "—"}</div>
        ),
      },
      {
        accessorKey: "motivo_rejeicao",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Motivo
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{row.getValue("motivo_rejeicao") || "—"}</div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: registrations,
    columns,
    getRowId: (row) => row.id_solicitacao.toString(),
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

  if (registrations.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-8 text-center shadow">
        <p className="text-gray-500">Nenhuma solicitação rejeitada.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por nome..."
          value={
            (table.getColumn("nome")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("nome")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filtrar por email..."
          value={
            (table.getColumn("email")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
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
                    {column.id === "cpf_pessoa"
                      ? "CPF"
                      : column.id === "nome"
                      ? "Nome"
                      : column.id === "email"
                      ? "Email"
                      : column.id === "nusp"
                      ? "NUSP"
                      : column.id === "data_solicitacao"
                      ? "Data Solicitação"
                      : column.id === "data_rejeicao"
                      ? "Data Rejeição"
                      : column.id === "nome_admin_aprovador"
                      ? "Rejeitado por"
                      : column.id === "motivo_rejeicao"
                      ? "Motivo"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
                <TableRow key={row.id} className="bg-red-50/30">
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

export default function PendingRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [approvedRegistrations, setApprovedRegistrations] = useState<
    Registration[]
  >([]);
  const [rejectedRegistrations, setRejectedRegistrations] = useState<
    Registration[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{
    category: "success" | "error";
    text: string;
  } | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState<"pendentes" | "aprovados" | "rejeitados">("pendentes");

  useEffect(() => {
    loadAllRegistrations();
  }, []);

  const loadAllRegistrations = async () => {
    setLoading(true);
    try {
      // Carregar pendentes
      const pendingData = await apiGet<{
        success: boolean;
        registrations: Registration[];
      }>("/auth/pending-registrations");

      if (pendingData.success && Array.isArray(pendingData.registrations)) {
        setRegistrations(pendingData.registrations);
      } else {
        setRegistrations([]);
      }

      // Carregar aprovados
      const approvedData = await apiGet<{
        success: boolean;
        registrations: Registration[];
      }>("/auth/approved-registrations");

      if (approvedData.success && Array.isArray(approvedData.registrations)) {
        setApprovedRegistrations(approvedData.registrations);
      } else {
        setApprovedRegistrations([]);
      }

      // Carregar rejeitados
      const rejectedData = await apiGet<{
        success: boolean;
        registrations: Registration[];
      }>("/auth/rejected-registrations");

      if (rejectedData.success && Array.isArray(rejectedData.registrations)) {
        setRejectedRegistrations(rejectedData.registrations);
      } else {
        setRejectedRegistrations([]);
      }
    } catch (err) {
      console.error("Erro ao carregar registrations:", err);
      setRegistrations([]);
      setApprovedRegistrations([]);
      setRejectedRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = loadAllRegistrations;

  const handleApprove = async (id: number) => {
    // Encontrar o registro antes de aprovar para mostrar na mensagem
    const registration = registrations.find((r) => r.id_solicitacao === id);
    const userName = registration?.nome || "usuário";

    // Marcar como processando
    setProcessingIds((prev) => new Set(prev).add(id));

    // Remover da lista imediatamente (otimista)
    setRegistrations((prev) => prev.filter((r) => r.id_solicitacao !== id));

    // Mostrar mensagem de loading
    setMessage({
      category: "success",
      text: `Aprovando cadastro de ${userName}...`,
    });

    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>("/auth/approve-registration", {
        id_solicitacao: id,
      });

      if (data.success) {
        setMessage({
          category: "success",
          text: `Cadastro de ${userName} aprovado com sucesso!`,
        });
        // Recarregar todas as listas para garantir sincronização
        loadAllRegistrations();
      } else {
        // Reverter remoção se falhar
        if (registration) {
          setRegistrations((prev) =>
            [...prev, registration].sort(
              (a, b) =>
                new Date(a.data_solicitacao).getTime() -
                new Date(b.data_solicitacao).getTime()
            )
          );
        }
        setMessage({
          category: "error",
          text: data.message || "Erro ao aprovar cadastro",
        });
      }
    } catch (err) {
      // Reverter remoção se falhar
      if (registration) {
        setRegistrations((prev) =>
          [...prev, registration].sort(
            (a, b) =>
              new Date(a.data_solicitacao).getTime() -
              new Date(b.data_solicitacao).getTime()
          )
        );
      }
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao processar solicitação";
      try {
        const errorData = JSON.parse(errorMessage);
        setMessage({
          category: "error",
          text: errorData.message || "Erro ao aprovar cadastro",
        });
      } catch {
        setMessage({ category: "error", text: errorMessage });
      }
    } finally {
      // Remover do set de processando
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReject = (id: number) => {
    setRejectingId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectingId) return;

    // Encontrar o registro antes de rejeitar para mostrar na mensagem
    const registration = registrations.find(
      (r) => r.id_solicitacao === rejectingId
    );
    const userName = registration?.nome || "usuário";

    // Fechar dialog
    setRejectDialogOpen(false);

    // Marcar como processando
    setProcessingIds((prev) => new Set(prev).add(rejectingId));

    // Remover da lista imediatamente (otimista)
    setRegistrations((prev) =>
      prev.filter((r) => r.id_solicitacao !== rejectingId)
    );

    // Mostrar mensagem de loading
    setMessage({
      category: "success",
      text: `Rejeitando cadastro de ${userName}...`,
    });

    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>("/auth/reject-registration", {
        id_solicitacao: rejectingId,
        observacoes: rejectReason || null,
      });

      if (data.success) {
        setMessage({
          category: "success",
          text: `Cadastro de ${userName} rejeitado.`,
        });
        // Recarregar todas as listas para garantir sincronização
        loadAllRegistrations();
      } else {
        // Reverter remoção se falhar
        if (registration) {
          setRegistrations((prev) =>
            [...prev, registration].sort(
              (a, b) =>
                new Date(a.data_solicitacao).getTime() -
                new Date(b.data_solicitacao).getTime()
            )
          );
        }
        setMessage({
          category: "error",
          text: data.message || "Erro ao rejeitar cadastro",
        });
      }
    } catch (err) {
      // Reverter remoção se falhar
      if (registration) {
        setRegistrations((prev) =>
          [...prev, registration].sort(
            (a, b) =>
              new Date(a.data_solicitacao).getTime() -
              new Date(b.data_solicitacao).getTime()
          )
        );
      }
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao processar solicitação";
      try {
        const errorData = JSON.parse(errorMessage);
        setMessage({
          category: "error",
          text: errorData.message || "Erro ao rejeitar cadastro",
        });
      } catch {
        setMessage({ category: "error", text: errorMessage });
      }
    } finally {
      // Remover do set de processando
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(rejectingId);
        return next;
      });
      setRejectingId(null);
      setRejectReason("");
    }
  };

  const cancelReject = () => {
    setRejectDialogOpen(false);
    setRejectingId(null);
    setRejectReason("");
  };

  return (
    <Layout messages={message ? [message] : undefined}>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gerenciamento de Solicitações de Cadastro
          </h1>
        </header>

        {loading ? (
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-center text-gray-500">Carregando...</div>
          </div>
        ) : (
          <>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("pendentes")}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === "pendentes"
                      ? "border-[#1094ab] text-[#1094ab]"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Pendentes ({registrations.length})
                </button>
                <button
                  onClick={() => setActiveTab("aprovados")}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === "aprovados"
                      ? "border-[#1094ab] text-[#1094ab]"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Aprovados ({approvedRegistrations.length})
                </button>
                <button
                  onClick={() => setActiveTab("rejeitados")}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === "rejeitados"
                      ? "border-[#1094ab] text-[#1094ab]"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Rejeitados ({rejectedRegistrations.length})
                </button>
              </nav>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              {activeTab === "pendentes" && (
                <PendingRegistrationsTable
                  registrations={registrations}
                  processingIds={processingIds}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              )}
              {activeTab === "aprovados" && (
                <ApprovedRegistrationsTable
                  registrations={approvedRegistrations}
                />
              )}
              {activeTab === "rejeitados" && (
                <RejectedRegistrationsTable
                  registrations={rejectedRegistrations}
                />
              )}
            </div>
          </>
        )}

        {/* Dialog de Rejeição */}
        <Dialog
          open={rejectDialogOpen}
          onOpenChange={(open) => {
            setRejectDialogOpen(open);
            if (!open) {
              // Limpar estado quando o dialog fechar
              setRejectingId(null);
              setRejectReason("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Solicitação de Cadastro</DialogTitle>
              <DialogDescription>
                {rejectingId && (
                  <>
                    Você está prestes a rejeitar a solicitação de{" "}
                    <strong>
                      {registrations.find(
                        (r) => r.id_solicitacao === rejectingId
                      )?.nome || "usuário"}
                    </strong>
                    . Por favor, informe o motivo da rejeição (opcional).
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label
                htmlFor="reject-reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Motivo da Rejeição (opcional)
              </label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Digite o motivo da rejeição..."
                className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <DialogFooter>
              <button
                onClick={cancelReject}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Confirmar Rejeição
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
