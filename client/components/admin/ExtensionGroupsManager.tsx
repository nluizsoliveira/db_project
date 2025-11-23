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
  useExtensionGroups,
  useCreateExtensionGroup,
  useUpdateExtensionGroup,
  useDeleteExtensionGroup,
  type ExtensionGroup,
} from '@/hooks/useExtensionGroups';
import { useAlertDialog } from '@/hooks/useAlertDialog';

export default function ExtensionGroupsManager() {
  const [error, setError] = useState('');
  const [editingGroup, setEditingGroup] = useState<ExtensionGroup | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    cpf_responsible: '',
  });

  const alertDialog = useAlertDialog();

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Queries
  const { data: groups = [], isLoading: loading, error: queryError } = useExtensionGroups();

  // Mutations
  const createMutation = useCreateExtensionGroup();
  const updateMutation = useUpdateExtensionGroup();
  const deleteMutation = useDeleteExtensionGroup();

  const handleCreate = () => {
    setEditingGroup(null);
    setFormData({ group_name: '', description: '', cpf_responsible: '' });
    setShowForm(true);
  };

  const handleEdit = (group: ExtensionGroup) => {
    setEditingGroup(group);
    setFormData({
      group_name: group.nome_grupo,
      description: group.descricao,
      cpf_responsible: group.cpf_responsavel_interno,
    });
    setShowForm(true);
  };

  const handleDelete = async (groupName: string) => {
    alertDialog.showConfirm(
      `Tem certeza que deseja deletar o grupo "${groupName}"?`,
      'Confirmar Exclusão',
      async () => {
        try {
          const data = await deleteMutation.mutateAsync(groupName);
          alertDialog.showAlert(data.message || 'Grupo de extensão deletado com sucesso!', 'Sucesso');
        } catch (err: any) {
          console.error('Erro ao deletar grupo:', err);
          alertDialog.showAlert(err.message || 'Erro ao deletar grupo de extensão', 'Erro');
        }
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingGroup) {
        // Update
        const data = await updateMutation.mutateAsync({
          old_group_name: editingGroup.nome_grupo,
          new_group_name: formData.group_name,
          description: formData.description,
          cpf_responsible: formData.cpf_responsible,
        });
        alertDialog.showAlert(data.message || 'Grupo de extensão atualizado com sucesso!', 'Sucesso');
        setShowForm(false);
        setEditingGroup(null);
      } else {
        // Create
        const data = await createMutation.mutateAsync({
          group_name: formData.group_name,
          description: formData.description,
          cpf_responsible: formData.cpf_responsible,
        });
        alertDialog.showAlert(data.message || 'Grupo de extensão criado com sucesso!', 'Sucesso');
        setShowForm(false);
      }
    } catch (err: any) {
      console.error('Erro ao salvar grupo:', err);
      const errorMessage = err.message || 'Erro ao processar solicitação';
      try {
        const errorData = JSON.parse(errorMessage);
        setError(errorData.message || 'Erro ao salvar grupo de extensão');
      } catch {
        setError(errorMessage);
      }
    }
  };

  const displayError = error || queryError?.message || '';
  const submitting = createMutation.isPending || updateMutation.isPending;

  // Define columns
  const columns: ColumnDef<ExtensionGroup>[] = useMemo(
    () => [
      {
        accessorKey: 'nome_grupo',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Nome do Grupo
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('nome_grupo')}</div>
        ),
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
        accessorKey: 'cpf_responsavel_interno',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              CPF Responsável
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('cpf_responsavel_interno')}</div>,
      },
      {
        accessorKey: 'nome_responsavel',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Nome Responsável
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('nome_responsavel')}</div>,
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const group = row.original;

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
                <DropdownMenuItem onClick={() => handleEdit(group)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(group.nome_grupo)}
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
    data: groups,
    columns,
    getRowId: (row) => row.nome_grupo,
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
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Grupos de Extensão</h2>
        <Button
          onClick={handleCreate}
          className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Novo Grupo
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-md font-semibold text-gray-900">
            {editingGroup ? 'Editar Grupo de Extensão' : 'Novo Grupo de Extensão'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Nome do Grupo</span>
                <input
                  type="text"
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  placeholder="Nome do grupo"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">CPF do Responsável</span>
                <input
                  type="text"
                  value={formData.cpf_responsible}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpf_responsible: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  required
                  maxLength={11}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  placeholder="Apenas números"
                />
              </label>
            </div>
            <div>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Descrição</span>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  placeholder="Descrição do grupo de extensão"
                />
              </label>
            </div>
            {displayError && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{displayError}</div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setError('');
                  setEditingGroup(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : editingGroup ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {displayError && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{displayError}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando grupos de extensão...</div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filtrar por nome do grupo..."
              value={(table.getColumn('nome_grupo')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('nome_grupo')?.setFilterValue(event.target.value)
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
                        {column.id === 'nome_grupo'
                          ? 'Nome do Grupo'
                          : column.id === 'descricao'
                          ? 'Descrição'
                          : column.id === 'cpf_responsavel_interno'
                          ? 'CPF Responsável'
                          : column.id === 'nome_responsavel'
                          ? 'Nome Responsável'
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
                      Nenhum grupo de extensão encontrado.
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
