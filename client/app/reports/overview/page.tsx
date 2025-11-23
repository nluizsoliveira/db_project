"use client";

import { useState, useEffect, useMemo } from "react";
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
import Layout from "@/components/Layout";
import { apiGet } from "@/lib/api";
import ReservationRollupChart from "@/components/reports/ReservationRollupChart";
import ActivitiesCubeChart from "@/components/reports/ActivitiesCubeChart";
import ParticipantsTotalsChart from "@/components/reports/ParticipantsTotalsChart";
import InstallationRankingChart from "@/components/reports/InstallationRankingChart";
import InstallationsMostReservedChart from "@/components/reports/InstallationsMostReservedChart";

interface ReservationRollup {
  installation_name: string | null;
  month_number: number | null;
  total_reservations: number;
}

interface ActivitiesCube {
  council_number: string | null;
  category: string | null;
  total_activities: number;
}

interface ParticipantsTotal {
  activity_name: string | null;
  total_participants: number;
}

interface InstallationRanking {
  ranking: number;
  installation_name: string;
  total_reservations: number;
}

interface ActivityOccurrence {
  atividade: string;
  local: string;
  tipo_local: string;
  dia_semana: string;
  horario_inicio: string;
  horario_fim: string;
  educador_responsavel: string;
}

interface InstallationMostReserved {
  nome: string;
  tipo: string;
  total_reservas: number;
}

function ReservationRollupTable({ data }: { data: ReservationRollup[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<ReservationRollup>[] = useMemo(
    () => [
      {
        accessorKey: 'installation_name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Instalação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{row.getValue('installation_name') || 'Total'}</div>
        ),
      },
      {
        accessorKey: 'month_number',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Mês
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('month_number') || '—'}</div>,
      },
      {
        accessorKey: 'total_reservations',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-semibold">{row.getValue('total_reservations')}</div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => `rollup-${index}`,
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
        Nenhum dado de reserva disponível.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por instalação..."
          value={(table.getColumn('installation_name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('installation_name')?.setFilterValue(event.target.value)
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
                    {column.id === 'installation_name'
                      ? 'Instalação'
                      : column.id === 'month_number'
                      ? 'Mês'
                      : column.id === 'total_reservations'
                      ? 'Total'
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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

function ActivitiesCubeTable({ data }: { data: ActivitiesCube[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<ActivitiesCube>[] = useMemo(
    () => [
      {
        accessorKey: 'council_number',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Conselho
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('council_number') || 'Todos'}</div>,
      },
      {
        accessorKey: 'category',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Categoria
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('category') || 'Todos'}</div>,
      },
      {
        accessorKey: 'total_activities',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-semibold">{row.getValue('total_activities')}</div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => `cube-${index}`,
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
        Nenhum dado de atividade disponível.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por conselho..."
          value={(table.getColumn('council_number')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('council_number')?.setFilterValue(event.target.value)
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
                    {column.id === 'council_number'
                      ? 'Conselho'
                      : column.id === 'category'
                      ? 'Categoria'
                      : column.id === 'total_activities'
                      ? 'Total'
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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

function ParticipantsTotalsTable({ data }: { data: ParticipantsTotal[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<ParticipantsTotal>[] = useMemo(
    () => [
      {
        accessorKey: 'activity_name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Atividade
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{row.getValue('activity_name') || 'Total'}</div>
        ),
      },
      {
        accessorKey: 'total_participants',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Participantes
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-semibold">{row.getValue('total_participants')}</div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => `participants-${index}`,
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
        Nenhum dado de participante disponível.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por atividade..."
          value={(table.getColumn('activity_name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('activity_name')?.setFilterValue(event.target.value)
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
                    {column.id === 'activity_name'
                      ? 'Atividade'
                      : column.id === 'total_participants'
                      ? 'Participantes'
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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

function InstallationRankingTable({ data }: { data: InstallationRanking[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<InstallationRanking>[] = useMemo(
    () => [
      {
        accessorKey: 'ranking',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Posição
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-semibold">#{row.getValue('ranking')}</div>
        ),
      },
      {
        accessorKey: 'installation_name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Instalação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('installation_name')}</div>,
      },
      {
        accessorKey: 'total_reservations',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Reservas
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('total_reservations')}</div>,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => `ranking-${index}`,
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
        Nenhum ranking disponível.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por instalação..."
          value={(table.getColumn('installation_name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('installation_name')?.setFilterValue(event.target.value)
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
                    {column.id === 'ranking'
                      ? 'Posição'
                      : column.id === 'installation_name'
                      ? 'Instalação'
                      : column.id === 'total_reservations'
                      ? 'Reservas'
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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

function ActivityOccurrencesTable({ data }: { data: ActivityOccurrence[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dayOrder: Record<string, number> = {
        SEGUNDA: 1,
        TERÇA: 2,
        TERCA: 2,
        QUARTA: 3,
        QUINTA: 4,
        SEXTA: 5,
        SÁBADO: 6,
        SABADO: 6,
        DOMINGO: 7,
      };
      const dayA = dayOrder[a.dia_semana.toUpperCase()] || 99;
      const dayB = dayOrder[b.dia_semana.toUpperCase()] || 99;
      if (dayA !== dayB) return dayA - dayB;
      return a.horario_inicio.localeCompare(b.horario_inicio);
    });
  }, [data]);

  const columns: ColumnDef<ActivityOccurrence>[] = useMemo(
    () => [
      {
        accessorKey: 'atividade',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Atividade
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('atividade')}</div>,
      },
      {
        accessorKey: 'local',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Local
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('local')}</div>,
      },
      {
        accessorKey: 'tipo_local',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Tipo
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('tipo_local')}</div>,
      },
      {
        accessorKey: 'dia_semana',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Dia da Semana
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('dia_semana')}</div>,
      },
      {
        id: 'horario',
        header: 'Horário',
        cell: ({ row }) => {
          return (
            <div>
              {row.original.horario_inicio.substring(0, 5)} - {row.original.horario_fim.substring(0, 5)}
            </div>
          );
        },
      },
      {
        accessorKey: 'educador_responsavel',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Educador
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('educador_responsavel')}</div>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: sortedData,
    columns,
    getRowId: (row, index) => `occurrence-${index}`,
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
        Nenhuma ocorrência de atividade disponível.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por atividade..."
          value={(table.getColumn('atividade')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('atividade')?.setFilterValue(event.target.value)
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
                    {column.id === 'atividade'
                      ? 'Atividade'
                      : column.id === 'local'
                      ? 'Local'
                      : column.id === 'tipo_local'
                      ? 'Tipo'
                      : column.id === 'dia_semana'
                      ? 'Dia da Semana'
                      : column.id === 'horario'
                      ? 'Horário'
                      : column.id === 'educador_responsavel'
                      ? 'Educador'
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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

function InstallationsMostReservedTable({ data }: { data: InstallationMostReserved[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.total_reservas - a.total_reservas);
  }, [data]);

  const columns: ColumnDef<InstallationMostReserved>[] = useMemo(
    () => [
      {
        accessorKey: 'nome',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Instalação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-semibold">{row.getValue('nome')}</div>
        ),
      },
      {
        accessorKey: 'tipo',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Tipo
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('tipo')}</div>,
      },
      {
        accessorKey: 'total_reservas',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Total de Reservas
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-semibold">{row.getValue('total_reservas')}</div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: sortedData,
    columns,
    getRowId: (row, index) => `most-reserved-${index}`,
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
        Nenhuma instalação mais reservada disponível.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por instalação..."
          value={(table.getColumn('nome')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('nome')?.setFilterValue(event.target.value)
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
                    {column.id === 'nome'
                      ? 'Instalação'
                      : column.id === 'tipo'
                      ? 'Tipo'
                      : column.id === 'total_reservas'
                      ? 'Total de Reservas'
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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

export default function ReportsOverviewPage() {
  const [reservationRollup, setReservationRollup] = useState<
    ReservationRollup[]
  >([]);
  const [activitiesCube, setActivitiesCube] = useState<ActivitiesCube[]>([]);
  const [participantsTotals, setParticipantsTotals] = useState<
    ParticipantsTotal[]
  >([]);
  const [installationRanking, setInstallationRanking] = useState<
    InstallationRanking[]
  >([]);
  const [activityOccurrences, setActivityOccurrences] = useState<
    ActivityOccurrence[]
  >([]);
  const [installationsMostReserved, setInstallationsMostReserved] = useState<
    InstallationMostReserved[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setError(null);
      const data = await apiGet<{
        success: boolean;
        reservation_rollup: ReservationRollup[];
        activities_cube: ActivitiesCube[];
        participants_totals: ParticipantsTotal[];
        installation_ranking: InstallationRanking[];
        activity_occurrences?: ActivityOccurrence[];
        installations_most_reserved?: InstallationMostReserved[];
      }>("/reports/overview");

      if (data.success) {
        setReservationRollup(data.reservation_rollup || []);
        setActivitiesCube(data.activities_cube || []);
        setParticipantsTotals(data.participants_totals || []);
        setInstallationRanking(data.installation_ranking || []);
        setActivityOccurrences(data.activity_occurrences || []);
        setInstallationsMostReserved(data.installations_most_reserved || []);
      }
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar relatórios";
      setError(errorMessage);
      setReservationRollup([]);
      setActivitiesCube([]);
      setParticipantsTotals([]);
      setInstallationRanking([]);
      setActivityOccurrences([]);
      setInstallationsMostReserved([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">
              Relatórios operacionais
            </h1>
          </header>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-gray-600">Carregando relatórios...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">
              Relatórios operacionais
            </h1>
          </header>
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 shadow">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao carregar relatórios
            </h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadReports}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            Relatórios operacionais
          </h1>
        </header>

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Consolidado de reservas
            </h2>
            <ReservationRollupChart data={reservationRollup} />
            <div className="mt-4">
              <ReservationRollupTable data={reservationRollup} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Atividades por educador
            </h2>
            <ActivitiesCubeChart data={activitiesCube} />
            <div className="mt-4">
              <ActivitiesCubeTable data={activitiesCube} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Participantes por atividade
            </h2>
            <ParticipantsTotalsChart data={participantsTotals} />
            <div className="mt-4">
              <ParticipantsTotalsTable data={participantsTotals} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Ranking de instalações
            </h2>
            <InstallationRankingChart data={installationRanking} />
            <div className="mt-4">
              <InstallationRankingTable data={installationRanking} />
            </div>
          </div>
        </div>

        {activityOccurrences.length > 0 && (
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Ocorrências Semanais de Atividades
            </h2>
            <div className="mt-4">
              <ActivityOccurrencesTable data={activityOccurrences} />
            </div>
          </div>
        )}

        {installationsMostReserved.length > 0 && (
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Instalações Mais Reservadas
            </h2>
            <InstallationsMostReservedChart data={installationsMostReserved} />
            <div className="mt-4">
              <InstallationsMostReservedTable data={installationsMostReserved} />
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
