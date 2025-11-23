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
import ActivitiesManager from '@/components/staff/ActivitiesManager';

interface Activity {
  id_atividade: number;
  nome_atividade: string;
  grupo_extensao: string | null;
  weekday: string;
  horario_inicio: string;
  horario_fim: string;
  vagas_ocupadas: number;
  vagas_limite: number;
}

function StaffActivitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filters, setFilters] = useState({
    weekday: searchParams.get('weekday') || '',
    group: searchParams.get('group') || '',
    modality: searchParams.get('modality') || '',
  });
  const [loading, setLoading] = useState(true);

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    loadActivities();
  }, [searchParams]);

  const loadActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.weekday) params.append('weekday', filters.weekday);
      if (filters.group) params.append('group', filters.group);
      if (filters.modality) params.append('modality', filters.modality);

      const data = await apiGet<{
        success: boolean;
        activities: Activity[];
      }>(`/staff/?${params.toString()}`);

      if (data.success) {
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.weekday) params.append('weekday', filters.weekday);
    if (filters.group) params.append('group', filters.group);
    if (filters.modality) params.append('modality', filters.modality);
    router.push(`/staff/activities?${params.toString()}`);
  };

  // Define columns
  const columns: ColumnDef<Activity>[] = useMemo(
    () => [
      {
        accessorKey: 'nome_atividade',
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
          <div className="font-medium">{row.getValue('nome_atividade')}</div>
        ),
      },
      {
        accessorKey: 'grupo_extensao',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Grupo
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('grupo_extensao') || '—'}</div>,
      },
      {
        accessorKey: 'weekday',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Dia da semana
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('weekday')}</div>,
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
        id: 'inscricoes',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Inscrições
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div>
              {row.original.vagas_ocupadas} / {row.original.vagas_limite}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.vagas_ocupadas;
          const b = rowB.original.vagas_ocupadas;
          return a - b;
        },
      },
    ],
    []
  );

  // Create unique keys for rows
  const activitiesWithKeys = useMemo(() => {
    return activities.map((activity, index) => ({
      ...activity,
      uniqueKey: `${activity.id_atividade}-${activity.weekday || 'no-day'}-${activity.horario_inicio || 'no-time'}-${index}`,
    }));
  }, [activities]);

  const table = useReactTable({
    data: activitiesWithKeys,
    columns,
    getRowId: (row) => row.uniqueKey,
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

  return (
    <Layout>
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Atividades da Equipe</h1>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg bg-white p-4 shadow sm:grid-cols-3">
          <label className="text-sm text-gray-600">
            <span className="mb-1 block font-medium">Dia da semana</span>
            <select
              name="weekday"
              value={filters.weekday}
              onChange={(e) => setFilters({ ...filters, weekday: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
            >
              <option value="">Todos os dias</option>
              <option value="SEGUNDA">Segunda-feira</option>
              <option value="TERCA">Terça-feira</option>
              <option value="QUARTA">Quarta-feira</option>
              <option value="QUINTA">Quinta-feira</option>
              <option value="SEXTA">Sexta-feira</option>
              <option value="SABADO">Sábado</option>
              <option value="DOMINGO">Domingo</option>
            </select>
          </label>
          <label className="text-sm text-gray-600">
            <span className="mb-1 block font-medium">Grupo de extensão</span>
            <input
              type="text"
              name="group"
              value={filters.group}
              onChange={(e) => setFilters({ ...filters, group: e.target.value })}
              placeholder="Nome do grupo"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
            />
          </label>
          <label className="text-sm text-gray-600">
            <span className="mb-1 block font-medium">Modalidade</span>
            <input
              type="text"
              name="modality"
              value={filters.modality}
              onChange={(e) => setFilters({ ...filters, modality: e.target.value })}
              placeholder="Nome da atividade"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
            />
          </label>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setFilters({ weekday: '', group: '', modality: '' });
                router.push('/staff/activities');
              }}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Limpar
            </button>
            <button
              type="submit"
              className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
            >
              Aplicar filtros
            </button>
          </div>
        </form>

        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              Nenhuma atividade corresponde aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-4 rounded-lg bg-white p-4 shadow">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filtrar por atividade..."
                value={(table.getColumn('nome_atividade')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('nome_atividade')?.setFilterValue(event.target.value)
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
                          {column.id === 'nome_atividade'
                            ? 'Atividade'
                            : column.id === 'grupo_extensao'
                            ? 'Grupo'
                            : column.id === 'weekday'
                            ? 'Dia da semana'
                            : column.id === 'horario'
                            ? 'Horário'
                            : column.id === 'inscricoes'
                            ? 'Inscrições'
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
        )}

        <ActivitiesManager />
      </section>
    </Layout>
  );
}

export default function StaffActivitiesPage() {
  return (
    <ProtectedRoute allowedRoles={['staff', 'admin']}>
      <Suspense fallback={<div>Carregando...</div>}>
        <StaffActivitiesContent />
      </Suspense>
    </ProtectedRoute>
  );
}
