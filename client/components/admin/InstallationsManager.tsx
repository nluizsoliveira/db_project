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
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { useAlertDialog } from '@/hooks/useAlertDialog';

interface Installation {
  id_instalacao: number;
  nome: string;
  tipo: string;
  capacidade: number;
  eh_reservavel: string;
}

export default function InstallationsManager() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    capacidade: '',
    eh_reservavel: 'N',
  });
  const [submitting, setSubmitting] = useState(false);
  const alertDialog = useAlertDialog();

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const loadInstallations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        installations: Installation[];
      }>('/admin/installations');

      if (data.success) {
        setInstallations(data.installations || []);
      }
    } catch (err) {
      console.error('Erro ao carregar instalações:', err);
      setError('Erro ao carregar instalações');
      setInstallations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstallations();
  }, []);

  const handleCreate = () => {
    setEditingInstallation(null);
    setFormData({ nome: '', tipo: '', capacidade: '', eh_reservavel: 'N' });
    setShowForm(true);
  };

  const handleEdit = async (installationId: number) => {
    try {
      const data = await apiGet<{
        success: boolean;
        installation: Installation;
      }>(`/admin/installations/${installationId}`);

      if (data.success && data.installation) {
        setEditingInstallation(data.installation);
        setFormData({
          nome: data.installation.nome,
          tipo: data.installation.tipo,
          capacidade: data.installation.capacidade.toString(),
          eh_reservavel: data.installation.eh_reservavel,
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error('Erro ao carregar instalação:', err);
      alertDialog.showAlert('Erro ao carregar instalação', 'Erro');
    }
  };

  const handleDelete = async (installationId: number) => {
    alertDialog.showConfirm(
      'Deseja realmente deletar esta instalação? Esta ação não pode ser desfeita.',
      'Confirmar Exclusão',
      async () => {
        try {
          const data = await apiDelete<{
            success: boolean;
            message?: string;
          }>(`/admin/installations/${installationId}`);

          if (data.success) {
            alertDialog.showAlert(data.message || 'Instalação deletada com sucesso!', 'Sucesso');
            loadInstallations();
          } else {
            alertDialog.showAlert(data.message || 'Erro ao deletar instalação', 'Erro');
          }
        } catch (err: any) {
          console.error('Erro ao deletar instalação:', err);
          alertDialog.showAlert(err.message || 'Erro ao deletar instalação', 'Erro');
        }
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingInstallation) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/admin/installations/${editingInstallation.id_instalacao}`, {
          nome: formData.nome,
          capacidade: parseInt(formData.capacidade),
          eh_reservavel: formData.eh_reservavel,
        });

        if (data.success) {
          alertDialog.showAlert(data.message || 'Instalação atualizada com sucesso!', 'Sucesso');
          setShowForm(false);
          loadInstallations();
        } else {
          setError(data.message || 'Erro ao atualizar instalação');
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>('/admin/installations', {
          nome: formData.nome,
          tipo: formData.tipo,
          capacidade: parseInt(formData.capacidade),
          eh_reservavel: formData.eh_reservavel,
        });

        if (data.success) {
          alertDialog.showAlert(data.message || 'Instalação criada com sucesso!', 'Sucesso');
          setShowForm(false);
          loadInstallations();
        } else {
          setError(data.message || 'Erro ao criar instalação');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar instalação:', err);
      setError(err.message || 'Erro ao salvar instalação');
    } finally {
      setSubmitting(false);
    }
  };

  // Define columns
  const columns: ColumnDef<Installation>[] = useMemo(
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
      {
        accessorKey: 'eh_reservavel',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Reservável
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('eh_reservavel') === 'S' ? 'Sim' : 'Não'}</div>,
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const installation = row.original;

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
                <DropdownMenuItem onClick={() => handleEdit(installation.id_instalacao)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(installation.id_instalacao)}
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
    data: installations,
    columns,
    getRowId: (row) => row.id_instalacao.toString(),
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
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Instalações</h2>
        <Button
          onClick={handleCreate}
          className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Nova Instalação
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-md font-semibold text-gray-900">
            {editingInstallation ? 'Editar Instalação' : 'Nova Instalação'}
          </h3>
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
              {!editingInstallation && (
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block font-medium">Tipo</span>
                  <input
                    type="text"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  />
                </label>
              )}
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Capacidade</span>
                <input
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                  required
                  min="1"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Reservável</span>
                <select
                  value={formData.eh_reservavel}
                  onChange={(e) => setFormData({ ...formData, eh_reservavel: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                >
                  <option value="S">Sim</option>
                  <option value="N">Não</option>
                </select>
              </label>
            </div>
            {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}
            <div className="flex justify-end gap-2">
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
                {submitting ? 'Salvando...' : editingInstallation ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando instalações...</div>
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
                        {column.id === 'eh_reservavel'
                          ? 'Reservável'
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
                      Nenhuma instalação encontrada.
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
