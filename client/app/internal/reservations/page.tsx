'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
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
import { ArrowUpDown, ChevronDown, CalendarPlus, Trash2 } from 'lucide-react';
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
import { apiGet } from '@/lib/api';
import { useAuthUser } from '@/lib/authStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import ReservationForm from '@/components/internal/ReservationForm';
import {
  useDeleteInternalInstallationReservation,
  useDeleteInternalEquipmentReservation,
} from '@/hooks/useReservations';
import { useAlertDialog } from '@/hooks/useAlertDialog';

interface InstallationReservation {
  id_reserva: number;
  nome_instalacao: string;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
}

interface EquipmentReservation {
  id_reserva_equip: number;
  nome_equipamento: string;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
}

function InstallationReservationsTable({ reservations, loading, hasCpfFilter, onDelete }: { reservations: InstallationReservation[]; loading: boolean; hasCpfFilter: boolean; onDelete: () => void }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);
  const deleteMutation = useDeleteInternalInstallationReservation();
  const alertDialog = useAlertDialog();

  const handleDeleteClick = useCallback((id: number) => {
    setReservationToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (reservationToDelete === null) return;

    try {
      await deleteMutation.mutateAsync(reservationToDelete);
      alertDialog.showAlert('Reserva cancelada com sucesso!', 'Sucesso');
      setDeleteDialogOpen(false);
      setReservationToDelete(null);
      onDelete();
    } catch (err: any) {
      alertDialog.showAlert(err.message || 'Erro ao cancelar reserva', 'Erro');
    }
  };

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
        id: 'acoes',
        header: 'Ações',
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(row.original.id_reserva)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [handleDeleteClick]
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
          {hasCpfFilter ? 'Nenhuma reserva encontrada.' : 'Carregando informações do usuário...'}
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
                      : column.id === 'acoes'
                      ? 'Ações'
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={alertDialog.open} onOpenChange={alertDialog.handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={alertDialog.handleClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EquipmentReservationsTable({ reservations, loading, hasCpfFilter, onDelete }: { reservations: EquipmentReservation[]; loading: boolean; hasCpfFilter: boolean; onDelete: () => void }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);
  const deleteMutation = useDeleteInternalEquipmentReservation();
  const alertDialog = useAlertDialog();

  const handleDeleteClick = useCallback((id: number) => {
    setReservationToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (reservationToDelete === null) return;

    try {
      await deleteMutation.mutateAsync(reservationToDelete);
      alertDialog.showAlert('Reserva cancelada com sucesso!', 'Sucesso');
      setDeleteDialogOpen(false);
      setReservationToDelete(null);
      onDelete();
    } catch (err: any) {
      alertDialog.showAlert(err.message || 'Erro ao cancelar reserva', 'Erro');
    }
  };

  const columns: ColumnDef<EquipmentReservation>[] = useMemo(
    () => [
      {
        accessorKey: 'nome_equipamento',
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
          <div className="font-medium">{row.getValue('nome_equipamento')}</div>
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
        id: 'acoes',
        header: 'Ações',
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(row.original.id_reserva_equip)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [handleDeleteClick]
  );

  const table = useReactTable({
    data: reservations,
    columns,
    getRowId: (row, index) => `equipment-reservation-${index}`,
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
          {hasCpfFilter ? 'Nenhuma reserva de equipamento encontrada.' : 'Carregando informações do usuário...'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por equipamento..."
          value={(table.getColumn('nome_equipamento')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('nome_equipamento')?.setFilterValue(event.target.value)
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
                    {column.id === 'nome_equipamento'
                      ? 'Equipamento'
                      : column.id === 'data_reserva'
                      ? 'Data'
                      : column.id === 'horario'
                      ? 'Horário'
                      : column.id === 'acoes'
                      ? 'Ações'
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={alertDialog.open} onOpenChange={alertDialog.handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={alertDialog.handleClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InternalReservationsContent() {
  const user = useAuthUser();
  const [reservasInstalacoes, setReservasInstalacoes] = useState<InstallationReservation[]>([]);
  const [reservasEquipamentos, setReservasEquipamentos] = useState<EquipmentReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    // Só carrega se o usuário estiver disponível
    if (!user?.user_id) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Usa automaticamente o CPF do usuário logado (user_id é o CPF)
      params.append('cpf', user.user_id);

      const data = await apiGet<{
        success: boolean;
        reservas: InstallationReservation[];
        reservas_equipamentos: EquipmentReservation[];
      }>(`/internal/?${params.toString()}`);

      if (data.success) {
        setReservasInstalacoes(data.reservas || []);
        setReservasEquipamentos(data.reservas_equipamentos || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setReservasInstalacoes([]);
      setReservasEquipamentos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleReservationSuccess = () => {
    setDialogOpen(false);
    loadDashboardData();
  };

  return (
    <Layout>
      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Minhas Reservas</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab]">
                <CalendarPlus className="h-4 w-4" />
                Nova Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl sm:max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Reserva</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <ReservationForm onSuccess={handleReservationSuccess} hideTitle hideWrapper />
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Reservas de Instalações</h3>
            <InstallationReservationsTable
              reservations={reservasInstalacoes}
              loading={loading}
              hasCpfFilter={!!user?.user_id}
              onDelete={loadDashboardData}
            />
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Reservas de Equipamentos</h3>
            <EquipmentReservationsTable
              reservations={reservasEquipamentos}
              loading={loading}
              hasCpfFilter={!!user?.user_id}
              onDelete={loadDashboardData}
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
