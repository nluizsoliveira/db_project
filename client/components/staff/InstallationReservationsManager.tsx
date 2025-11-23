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
import { ArrowUpDown, ChevronDown, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useInstallationReservations, useDeleteInstallationReservation } from '@/hooks/useReservations';
import { useAlertDialog } from '@/hooks/useAlertDialog';

interface InstallationReservation {
  id_reserva: number;
  id_instalacao: number;
  nome_instalacao: string;
  tipo_instalacao: string;
  cpf_responsavel_interno: string;
  nome_responsavel: string;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
}

export default function InstallationReservationsManager() {
  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: '',
    id_instalacao: '',
    cpf_responsavel: '',
  });

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data: reservations = [], isLoading: loading, error: queryError } = useInstallationReservations();
  const deleteMutation = useDeleteInstallationReservation();
  const alertDialog = useAlertDialog();

  const error = queryError?.message || '';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Query will automatically refetch when filters change
  };

  const handleCancelReservation = async (id: number) => {
    alertDialog.showConfirm(
      'Deseja realmente cancelar esta reserva?',
      'Confirmar Cancelamento',
      async () => {
        try {
          const data = await deleteMutation.mutateAsync(id);
          alertDialog.showAlert(data.message || 'Reserva cancelada com sucesso!', 'Sucesso');
        } catch (err: any) {
          console.error('Erro ao cancelar reserva:', err);
          alertDialog.showAlert(err.message || 'Erro ao cancelar reserva', 'Erro');
        }
      }
    );
  };

  // Define columns
  const columns: ColumnDef<InstallationReservation>[] = useMemo(
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
        accessorKey: 'tipo_instalacao',
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
        cell: ({ row }) => <div>{row.getValue('tipo_instalacao')}</div>,
      },
      {
        id: 'responsavel',
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
        cell: ({ row }) => (
          <div>
            {row.original.nome_responsavel} ({row.original.cpf_responsavel_interno})
          </div>
        ),
        sortingFn: (rowA, rowB) => {
          return rowA.original.nome_responsavel.localeCompare(
            rowB.original.nome_responsavel
          );
        },
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
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const reservation = row.original;
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancelReservation(reservation.id_reserva)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: reservations,
    columns,
    getRowId: (row) => row.id_reserva.toString(),
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
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Gerenciar Reservas de Instalações</h2>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-4 sm:grid-cols-4">
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Data Início</span>
          <input
            type="date"
            value={filters.data_inicio}
            onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Data Fim</span>
          <input
            type="date"
            value={filters.data_fim}
            onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">ID Instalação</span>
          <input
            type="text"
            value={filters.id_instalacao}
            onChange={(e) => setFilters({ ...filters, id_instalacao: e.target.value })}
            placeholder="Filtrar por instalação"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">CPF Responsável</span>
          <input
            type="text"
            value={filters.cpf_responsavel}
            onChange={(e) => setFilters({ ...filters, cpf_responsavel: e.target.value })}
            placeholder="Filtrar por CPF"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>
        <div className="sm:col-span-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setFilters({ data_inicio: '', data_fim: '', id_instalacao: '', cpf_responsavel: '' });
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

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando reservas...</div>
      ) : reservations.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
          <p className="text-gray-500">
            Nenhuma reserva encontrada com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filtrar por instalação..."
              value={
                (table.getColumn('nome_instalacao')?.getFilterValue() as string) ?? ''
              }
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
                          : column.id === 'tipo_instalacao'
                          ? 'Tipo'
                          : column.id === 'responsavel'
                          ? 'Responsável'
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
      )}

      <AlertDialog open={alertDialog.open} onOpenChange={alertDialog.handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertDialog.type === 'confirm' ? (
              <>
                <AlertDialogCancel onClick={alertDialog.handleCancel}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={alertDialog.handleConfirm}>Confirmar</AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={alertDialog.handleClose}>OK</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
