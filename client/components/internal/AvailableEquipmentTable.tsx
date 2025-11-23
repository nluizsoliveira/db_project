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

interface AvailableEquipment {
  id_patrimonio: string;
  nome: string;
  local: string;
  status_disponibilidade: string;
  proxima_reserva_data: string | null;
  proxima_reserva_inicio: string | null;
  proxima_reserva_fim: string | null;
  reserva_anterior_data: string | null;
  reserva_anterior_fim: string | null;
}

export default function AvailableEquipmentTable({ equipment, loading, hasFilters }: { equipment: AvailableEquipment[]; loading: boolean; hasFilters: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<AvailableEquipment>[] = useMemo(
    () => [
      {
        accessorKey: 'nome',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Equipamento
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('nome')}</div>
        ),
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
        accessorKey: 'id_patrimonio',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              ID Patrimônio
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('id_patrimonio')}</div>,
      },
      {
        accessorKey: 'status_disponibilidade',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status_disponibilidade') as string;
          return (
            <div
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status === 'Disponível'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {status}
            </div>
          );
        },
      },
      {
        accessorKey: 'proxima_reserva_data',
        header: 'Próxima Reserva',
        cell: ({ row }) => {
          const data = row.original.proxima_reserva_data;
          const inicio = row.original.proxima_reserva_inicio;
          const fim = row.original.proxima_reserva_fim;

          if (!data || !inicio || !fim) {
            return <div className="text-gray-400">Nenhuma</div>;
          }

          const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
          const inicioFormatado = inicio.substring(0, 5);
          const fimFormatado = fim.substring(0, 5);

          return (
            <div className="text-sm">
              <div className="font-medium">{dataFormatada}</div>
              <div className="text-gray-600">{inicioFormatado} - {fimFormatado}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'reserva_anterior_data',
        header: 'Reserva Anterior',
        cell: ({ row }) => {
          const data = row.original.reserva_anterior_data;
          const fim = row.original.reserva_anterior_fim;

          if (!data || !fim) {
            return <div className="text-gray-400">Nenhuma</div>;
          }

          const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
          const fimFormatado = fim.substring(0, 5);

          return (
            <div className="text-sm">
              <div className="font-medium">{dataFormatada}</div>
              <div className="text-gray-600">Até {fimFormatado}</div>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: equipment,
    columns,
    getRowId: (row, index) => `equipment-${index}`,
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

  if (equipment.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
        <p className="text-gray-500">
          {hasFilters ? 'Nenhum equipamento disponível no período selecionado.' : 'Selecione data e horário para ver disponibilidade.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por equipamento..."
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
                      ? 'Equipamento'
                      : column.id === 'local'
                      ? 'Local'
                      : column.id === 'id_patrimonio'
                      ? 'ID Patrimônio'
                      : column.id === 'status_disponibilidade'
                      ? 'Status'
                      : column.id === 'proxima_reserva_data'
                      ? 'Próxima Reserva'
                      : column.id === 'reserva_anterior_data'
                      ? 'Reserva Anterior'
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
