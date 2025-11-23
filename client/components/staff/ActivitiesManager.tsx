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

interface ActivityDetail {
  id_atividade: number;
  nome: string;
  vagas_limite: number;
  data_inicio_periodo: string;
  data_fim_periodo: string;
}

export default function ActivitiesManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingActivity, setEditingActivity] = useState<ActivityDetail | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    vagas: '',
    data_inicio: '',
    data_fim: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const alertDialog = useAlertDialog();

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const loadActivities = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        activities: Activity[];
      }>('/staff/');

      if (data.success) {
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
      setError('Erro ao carregar atividades');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleCreate = () => {
    setEditingActivity(null);
    setFormData({ nome: '', vagas: '', data_inicio: '', data_fim: '' });
    setShowForm(true);
  };

  const handleEdit = async (activityId: number) => {
    try {
      const data = await apiGet<{
        success: boolean;
        activity: ActivityDetail;
      }>(`/staff/activities/${activityId}`);

      if (data.success && data.activity) {
        setEditingActivity(data.activity);
        setFormData({
          nome: data.activity.nome,
          vagas: data.activity.vagas_limite.toString(),
          data_inicio: data.activity.data_inicio_periodo,
          data_fim: data.activity.data_fim_periodo,
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error('Erro ao carregar atividade:', err);
      alertDialog.showAlert('Erro ao carregar atividade', 'Erro');
    }
  };

  const handleDelete = async (activityId: number) => {
    alertDialog.showConfirm(
      'Deseja realmente deletar esta atividade? Esta ação não pode ser desfeita.',
      'Confirmar Exclusão',
      async () => {
        try {
          const data = await apiDelete<{
            success: boolean;
            message?: string;
          }>(`/staff/activities/${activityId}`);

          if (data.success) {
            alertDialog.showAlert(data.message || 'Atividade deletada com sucesso!', 'Sucesso');
            loadActivities();
          } else {
            alertDialog.showAlert(data.message || 'Erro ao deletar atividade', 'Erro');
          }
        } catch (err: any) {
          console.error('Erro ao deletar atividade:', err);
          alertDialog.showAlert(err.message || 'Erro ao deletar atividade', 'Erro');
        }
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingActivity) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/staff/activities/${editingActivity.id_atividade}`, {
          nome: formData.nome,
          vagas: parseInt(formData.vagas),
        });

        if (data.success) {
          alertDialog.showAlert(data.message || 'Atividade atualizada com sucesso!', 'Sucesso');
          setShowForm(false);
          loadActivities();
        } else {
          setError(data.message || 'Erro ao atualizar atividade');
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>('/staff/activities', {
          nome: formData.nome,
          vagas: parseInt(formData.vagas),
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
        });

        if (data.success) {
          alertDialog.showAlert(data.message || 'Atividade criada com sucesso!', 'Sucesso');
          setShowForm(false);
          loadActivities();
        } else {
          setError(data.message || 'Erro ao criar atividade');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar atividade:', err);
      setError(err.message || 'Erro ao salvar atividade');
    } finally {
      setSubmitting(false);
    }
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
              Dia
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
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const activity = row.original;
          return (
            <div className="flex gap-2">
              <Button
                onClick={() => handleEdit(activity.id_atividade)}
                className="bg-blue-600 text-white hover:bg-blue-700"
                size="sm"
              >
                Editar
              </Button>
              <Button
                onClick={() => handleDelete(activity.id_atividade)}
                className="bg-red-600 text-white hover:bg-red-700"
                size="sm"
              >
                Deletar
              </Button>
            </div>
          );
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
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Atividades</h2>
        <Button
          onClick={handleCreate}
          className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Nova Atividade
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Nome da Atividade</span>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Vagas</span>
                <input
                  type="number"
                  value={formData.vagas}
                  onChange={(e) => setFormData({ ...formData, vagas: e.target.value })}
                  required
                  min="1"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              {!editingActivity && (
                <>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Data Início</span>
                    <input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    />
                  </label>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Data Fim</span>
                    <input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    />
                  </label>
                </>
              )}
            </div>
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
                {submitting ? 'Salvando...' : editingActivity ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando atividades...</div>
      ) : activities.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
          <p className="text-gray-500">Nenhuma atividade encontrada.</p>
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
                      Nenhuma atividade encontrada.
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
