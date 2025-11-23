'use client';

import { useState, useMemo } from 'react';
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
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAdminDashboard } from '@/hooks/useDashboard';

interface Stat {
  label: string;
  value: string | number;
  description: string;
}

interface Reservation {
  installation_name: string;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
  responsible_name: string;
}

interface Activity {
  nome_atividade: string;
  weekday: string;
  horario_inicio: string;
  horario_fim: string;
  grupo_extensao: string | null;
  vagas_ocupadas: number;
  vagas_limite: number;
  occupancy_rate: number;
}

function UpcomingReservationsTable({ reservations }: { reservations: Reservation[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Reservation>[] = useMemo(
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
          <div className="font-medium">{row.getValue('installation_name')}</div>
        ),
      },
      {
        accessorKey: 'data_reserva',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Data
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('data_reserva')}</div>,
      },
      {
        id: 'horario',
        header: 'Horário',
        cell: ({ row }) => {
          return (
            <div>
              {row.original.horario_inicio} - {row.original.horario_fim}
            </div>
          );
        },
      },
      {
        accessorKey: 'responsible_name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Responsável
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('responsible_name')}</div>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: reservations,
    columns,
    getRowId: (row, index) => `reservation-${index}`,
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

  if (reservations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
        <p className="text-gray-500">Nenhuma reserva agendada.</p>
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
                      : column.id === 'data_reserva'
                      ? 'Data'
                      : column.id === 'horario'
                      ? 'Horário'
                      : column.id === 'responsible_name'
                      ? 'Responsável'
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

export default function AdminDashboardPage() {
  const { data, isLoading: loading, error } = useAdminDashboard();
  const stats = data?.stats || [];
  const upcomingReservations = data?.upcomingReservations || [];
  const activityEnrollment = data?.activityEnrollment || [];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <section className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">Visão Geral Administrativa</h1>
          </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.length > 0 ? (
            stats.map((stat, index) => (
              <div key={index} className="rounded-lg bg-white p-4 shadow">
                <p className="text-sm uppercase tracking-wide text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.description}</p>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-white p-4 shadow sm:col-span-2 lg:col-span-4">
              <p className="text-sm text-gray-500">Nenhuma estatística disponível.</p>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Próximas reservas</h2>
            <UpcomingReservationsTable reservations={upcomingReservations} />
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Inscrições em atividades</h2>
            <div className="mt-4 space-y-3">
              {activityEnrollment.length > 0 ? (
                activityEnrollment.map((activity, index) => (
                  <div key={index} className="rounded border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{activity.nome_atividade}</p>
                      <p className="text-sm text-gray-500">{activity.weekday}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {activity.horario_inicio} - {activity.horario_fim}
                    </p>
                    <p className="text-xs text-gray-400">
                      Grupo: {activity.grupo_extensao || '—'}
                    </p>
                    <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
                      <div
                        className="h-2 rounded bg-[#1094ab]"
                        style={{
                          width: `${Math.min(activity.occupancy_rate, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {activity.vagas_ocupadas} / {activity.vagas_limite} vagas
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma atividade encontrada.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
    </ProtectedRoute>
  );
}
