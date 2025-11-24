'use client';

import { useState, FormEvent, useMemo } from 'react';
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
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react';
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
import { useInternalActivities, type Activity } from '@/hooks/useActivities';

export default function EnrolledActivitiesList() {
  const [filters, setFilters] = useState({
    weekday: '',
    group_name: '',
    modality: '',
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data: allActivities = [], isLoading: loading, error: queryError } = useInternalActivities(filters);

  const enrolledActivities = useMemo(() => {
    return allActivities.filter((activity) => activity.is_enrolled === true);
  }, [allActivities]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const error = queryError?.message || '';

  const diasSemana = [
    { value: '', label: 'Todos' },
    { value: 'SEGUNDA', label: 'Segunda-feira' },
    { value: 'TERCA', label: 'Terça-feira' },
    { value: 'QUARTA', label: 'Quarta-feira' },
    { value: 'QUINTA', label: 'Quinta-feira' },
    { value: 'SEXTA', label: 'Sexta-feira' },
    { value: 'SABADO', label: 'Sábado' },
    { value: 'DOMINGO', label: 'Domingo' },
  ];

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
        cell: ({ row }) => <div>{row.getValue('grupo_extensao') || 'N/A'}</div>,
      },
      {
        accessorKey: 'weekday',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Dia
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const weekday = row.getValue('weekday') as string;
          return (
            <div>
              {weekday
                ? weekday.charAt(0) + weekday.slice(1).toLowerCase()
                : 'N/A'}
            </div>
          );
        },
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
        id: 'vagas',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Vagas
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const vagasDisponiveis = row.original.vagas_limite - row.original.vagas_ocupadas;
          return (
            <div>
              {row.original.vagas_ocupadas}/{row.original.vagas_limite} ({vagasDisponiveis}{' '}
              disponíveis)
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.vagas_ocupadas;
          const b = rowB.original.vagas_ocupadas;
          return a - b;
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: () => {
          return (
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">Inscrito</span>
            </div>
          );
        },
      },
    ],
    []
  );

  const activitiesWithKeys = useMemo(() => {
    return enrolledActivities.map((activity, index) => ({
      ...activity,
      uniqueKey: `${activity.id_atividade}-${activity.weekday || 'no-day'}-${activity.horario_inicio || 'no-time'}-${index}`,
    }));
  }, [enrolledActivities]);

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
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Minhas Inscrições</h2>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Dia da Semana</span>
          <select
            value={filters.weekday}
            onChange={(e) => setFilters({ ...filters, weekday: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          >
            {diasSemana.map((dia) => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Grupo de Extensão</span>
          <input
            type="text"
            value={filters.group_name}
            onChange={(e) => setFilters({ ...filters, group_name: e.target.value })}
            placeholder="Nome do grupo"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>

        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Modalidade</span>
          <input
            type="text"
            value={filters.modality}
            onChange={(e) => setFilters({ ...filters, modality: e.target.value })}
            placeholder="Nome da atividade"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>

        <div className="col-span-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setFilters({ weekday: '', group_name: '', modality: '' });
            }}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
          >
            Filtrar
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando atividades...</div>
      ) : enrolledActivities.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
          <p className="text-gray-500">
            Você não está inscrito em nenhuma atividade no momento.
          </p>
        </div>
      ) : (
        <div className="w-full space-y-4">
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
                          ? 'Dia'
                          : column.id === 'horario'
                          ? 'Horário'
                          : column.id === 'vagas'
                          ? 'Vagas'
                          : column.id === 'status'
                          ? 'Status'
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
    </div>
  );
}
