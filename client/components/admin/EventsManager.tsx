'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { useAlertDialog } from '@/hooks/useAlertDialog';

interface Event {
  id_evento: number;
  nome: string;
  descricao: string | null;
  id_reserva: number;
  data_reserva: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;
  nome_instalacao: string | null;
}

interface Reservation {
  id_reserva: number;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
  nome_instalacao: string;
}

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    id_reserva: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const alertDialog = useAlertDialog();

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        events: Event[];
      }>('/admin/events');

      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Erro ao carregar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const data = await apiGet<{
        success: boolean;
        reservations: Reservation[];
      }>('/admin/reservations');

      if (data.success) {
        setReservations(data.reservations || []);
      }
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
    }
  };

  useEffect(() => {
    loadEvents();
    loadReservations();
  }, []);

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({ nome: '', descricao: '', id_reserva: '' });
    setShowForm(true);
  };

  const handleEdit = async (eventId: number) => {
    try {
      const data = await apiGet<{
        success: boolean;
        event: Event;
      }>(`/admin/events/${eventId}`);

      if (data.success && data.event) {
        setEditingEvent(data.event);
        setFormData({
          nome: data.event.nome,
          descricao: data.event.descricao || '',
          id_reserva: data.event.id_reserva.toString(),
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error('Erro ao carregar evento:', err);
      alertDialog.showAlert('Erro ao carregar evento', 'Erro');
    }
  };

  const handleDelete = async (eventId: number) => {
    alertDialog.showConfirm(
      'Deseja realmente deletar este evento? Esta ação não pode ser desfeita.',
      'Confirmar Exclusão',
      async () => {
        try {
          const data = await apiDelete<{
            success: boolean;
            message?: string;
          }>(`/admin/events/${eventId}`);

          if (data.success) {
            alertDialog.showAlert(data.message || 'Evento deletado com sucesso!', 'Sucesso');
            loadEvents();
          } else {
            alertDialog.showAlert(data.message || 'Erro ao deletar evento', 'Erro');
          }
        } catch (err: any) {
          console.error('Erro ao deletar evento:', err);
          alertDialog.showAlert(err.message || 'Erro ao deletar evento', 'Erro');
        }
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingEvent) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/admin/events/${editingEvent.id_evento}`, {
          nome: formData.nome,
          descricao: formData.descricao,
        });

        if (data.success) {
          alertDialog.showAlert(data.message || 'Evento atualizado com sucesso!', 'Sucesso');
          setShowForm(false);
          loadEvents();
        } else {
          setError(data.message || 'Erro ao atualizar evento');
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>('/admin/events', {
          nome: formData.nome,
          descricao: formData.descricao,
          id_reserva: parseInt(formData.id_reserva),
        });

        if (data.success) {
          alertDialog.showAlert(data.message || 'Evento criado com sucesso!', 'Sucesso');
          setShowForm(false);
          loadEvents();
        } else {
          setError(data.message || 'Erro ao criar evento');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar evento:', err);
      setError(err.message || 'Erro ao salvar evento');
    } finally {
      setSubmitting(false);
    }
  };

  // Define columns
  const columns: ColumnDef<Event>[] = useMemo(
    () => [
      {
        accessorKey: 'nome',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue('nome')}</div>,
      },
      {
        accessorKey: 'descricao',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Descrição
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('descricao') || '—'}</div>,
      },
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
        cell: ({ row }) => <div>{row.getValue('nome_instalacao') || '—'}</div>,
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
        cell: ({ row }) => <div>{row.getValue('data_reserva') || '—'}</div>,
      },
      {
        id: 'horario',
        header: 'Horário',
        cell: ({ row }) => {
          const inicio = row.original.horario_inicio;
          const fim = row.original.horario_fim;
          return <div>{inicio && fim ? `${inicio} - ${fim}` : '—'}</div>;
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const event = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(event.id_evento)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(event.id_evento)}
                  className="text-destructive"
                >
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: events,
    columns,
    getRowId: (row) => row.id_evento.toString(),
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Eventos</h2>
        <Button
          onClick={handleCreate}
          className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Novo Evento
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Nome</span>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              {!editingEvent && (
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block font-medium">Reserva</span>
                  <select
                    value={formData.id_reserva}
                    onChange={(e) => setFormData({ ...formData, id_reserva: e.target.value })}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  >
                    <option value="">Selecione uma reserva</option>
                    {reservations.map((res) => (
                      <option key={res.id_reserva} value={res.id_reserva}>
                        {res.nome_instalacao} - {res.data_reserva} {res.horario_inicio}-{res.horario_fim}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <label className="text-sm text-gray-600">
              <span className="mb-1 block font-medium">Descrição</span>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
              />
            </label>
            {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setError('');
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : editingEvent ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando eventos...</div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filtrar por nome..."
              value={(table.getColumn('nome')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('nome')?.setFilterValue(event.target.value)}
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
                    <TableRow
                      key={row.id}
                    >
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
                      Nenhum evento encontrado.
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
