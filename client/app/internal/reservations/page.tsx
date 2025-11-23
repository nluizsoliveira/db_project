'use client';

import { useState, useEffect, FormEvent, Suspense, useMemo } from 'react';
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
import { useSearchParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet } from '@/lib/api';

interface Reservation {
  nome_instalacao: string;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
}

interface AvailableInstallation {
  nome: string;
  tipo: string;
  capacidade: number;
}

function ReservationsTable({ reservations, loading, hasCpfFilter }: { reservations: Reservation[]; loading: boolean; hasCpfFilter: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Reservation>[] = useMemo(
    () => [
      {
        accessorKey: 'nome_instalacao',
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
          <div className="font-medium">{row.getValue('nome_instalacao')}</div>
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

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">Carregando...</div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
        <p className="text-gray-500">
          {hasCpfFilter ? 'Nenhuma reserva foi retornada para o CPF informado.' : 'Nenhuma reserva agendada.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por instalação..."
          value={(table.getColumn('nome_instalacao')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('nome_instalacao')?.setFilterValue(event.target.value)
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
                    {column.id === 'nome_instalacao'
                      ? 'Instalação'
                      : column.id === 'data_reserva'
                      ? 'Data'
                      : column.id === 'horario'
                      ? 'Horário'
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

function AvailableInstallationsTable({ installations, loading, hasFilters }: { installations: AvailableInstallation[]; loading: boolean; hasFilters: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<AvailableInstallation>[] = useMemo(
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
          <div className="font-medium">{row.getValue('nome')}</div>
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
        accessorKey: 'capacidade',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Capacidade
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('capacidade')}</div>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: installations,
    columns,
    getRowId: (row, index) => `installation-${index}`,
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

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">Carregando...</div>
    );
  }

  if (installations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
        <p className="text-gray-500">
          {hasFilters ? 'Nenhuma instalação disponível no período selecionado.' : 'Selecione data e horário para ver disponibilidade.'}
        </p>
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
                      : column.id === 'capacidade'
                      ? 'Capacidade'
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

function InternalReservationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [availableInstalls, setAvailableInstalls] = useState<AvailableInstallation[]>([]);
  const [filters, setFilters] = useState({
    cpf: searchParams.get('cpf') || '',
    date: searchParams.get('date') || '',
    start: searchParams.get('start') || '',
    end: searchParams.get('end') || '',
  });
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.cpf) params.append('cpf', filters.cpf);
      if (filters.date) params.append('date', filters.date);
      if (filters.start) params.append('start', filters.start);
      if (filters.end) params.append('end', filters.end);

      const data = await apiGet<{
        success: boolean;
        reservas: Reservation[];
        available_installs: AvailableInstallation[];
      }>(`/internal/?${params.toString()}`);

      if (data.success) {
        setReservas(data.reservas || []);
        setAvailableInstalls(data.available_installs || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setReservas([]);
      setAvailableInstalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [searchParams]);

  const handleCpfSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.cpf) params.append('cpf', filters.cpf);
    if (filters.date) params.append('date', filters.date);
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    router.push(`/internal/reservations?${params.toString()}`);
  };

  const handleAvailabilitySubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.cpf) params.append('cpf', filters.cpf);
    if (filters.date) params.append('date', filters.date);
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    router.push(`/internal/reservations?${params.toString()}`);
  };

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Minhas Reservas</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleCpfSubmit} className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Reservas por CPF</h2>
            <label className="mt-4 block text-sm text-gray-600">
              <span className="mb-1 block font-medium">CPF</span>
              <input
                type="text"
                name="cpf"
                value={filters.cpf}
                onChange={(e) => setFilters({ ...filters, cpf: e.target.value })}
                placeholder="Apenas números"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
              />
            </label>
            <input type="hidden" name="date" value={filters.date} />
            <input type="hidden" name="start" value={filters.start} />
            <input type="hidden" name="end" value={filters.end} />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilters({ cpf: '', date: '', start: '', end: '' });
                  router.push('/internal/reservations');
                }}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Limpar
              </button>
              <button
                type="submit"
                className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
              >
                Carregar dados
              </button>
            </div>
          </form>

          <form onSubmit={handleAvailabilitySubmit} className="rounded-lg bg-white p-4 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Instalações disponíveis</h2>
            <input type="hidden" name="cpf" value={filters.cpf} />
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Data</span>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Início</span>
                <input
                  type="time"
                  name="start"
                  value={filters.start}
                  onChange={(e) => setFilters({ ...filters, start: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Fim</span>
                <input
                  type="time"
                  name="end"
                  value={filters.end}
                  onChange={(e) => setFilters({ ...filters, end: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilters({ cpf: '', date: '', start: '', end: '' });
                  router.push('/internal/reservations');
                }}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Limpar
              </button>
              <button
                type="submit"
                className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
              >
                Verificar disponibilidade
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Reservas registradas</h3>
            <ReservationsTable
              reservations={reservas}
              loading={loading}
              hasCpfFilter={!!filters.cpf}
            />
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Instalações disponíveis</h3>
            <AvailableInstallationsTable
              installations={availableInstalls}
              loading={loading}
              hasFilters={!!(filters.date && filters.start && filters.end)}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default function InternalReservationsPage() {
  return (
    <ProtectedRoute allowedRoles={['internal', 'staff', 'admin']}>
      <Suspense fallback={<div>Carregando...</div>}>
        <InternalReservationsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
