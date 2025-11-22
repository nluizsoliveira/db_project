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
import { Checkbox } from '@/components/ui/checkbox';
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
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Equipment {
  id_patrimonio: string;
  nome: string;
  id_instalacao_local: number | null;
  nome_instalacao: string | null;
  preco_aquisicao: number | null;
  data_aquisicao: string | null;
  eh_reservavel: string;
}

interface Installation {
  id_instalacao: number;
  nome: string;
}

export default function EquipmentManager() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id_patrimonio: '',
    nome: '',
    id_instalacao: '',
    preco: '',
    data_aquisicao: '',
    eh_reservavel: 'N',
  });
  const [submitting, setSubmitting] = useState(false);

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const loadEquipment = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        equipment: Equipment[];
      }>('/admin/equipment');

      if (data.success) {
        setEquipment(data.equipment || []);
      }
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err);
      setError('Erro ao carregar equipamentos');
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInstallations = async () => {
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
    }
  };

  useEffect(() => {
    loadEquipment();
    loadInstallations();
  }, []);

  const handleCreate = () => {
    setEditingEquipment(null);
    setFormData({
      id_patrimonio: '',
      nome: '',
      id_instalacao: '',
      preco: '',
      data_aquisicao: '',
      eh_reservavel: 'N',
    });
    setShowForm(true);
  };

  const handleEdit = async (equipmentId: string) => {
    try {
      const data = await apiGet<{
        success: boolean;
        equipment: Equipment;
      }>(`/admin/equipment/${equipmentId}`);

      if (data.success && data.equipment) {
        setEditingEquipment(data.equipment);
        setFormData({
          id_patrimonio: data.equipment.id_patrimonio,
          nome: data.equipment.nome,
          id_instalacao: data.equipment.id_instalacao_local?.toString() || '',
          preco: data.equipment.preco_aquisicao?.toString() || '',
          data_aquisicao: data.equipment.data_aquisicao || '',
          eh_reservavel: data.equipment.eh_reservavel,
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error('Erro ao carregar equipamento:', err);
      alert('Erro ao carregar equipamento');
    }
  };

  const handleDelete = async (equipmentId: string) => {
    if (!confirm('Deseja realmente deletar este equipamento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/equipment/${equipmentId}`);

      if (data.success) {
        alert(data.message || 'Equipamento deletado com sucesso!');
        loadEquipment();
      } else {
        alert(data.message || 'Erro ao deletar equipamento');
      }
    } catch (err: any) {
      console.error('Erro ao deletar equipamento:', err);
      alert(err.message || 'Erro ao deletar equipamento');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingEquipment) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/admin/equipment/${editingEquipment.id_patrimonio}`, {
          nome: formData.nome,
          id_instalacao: formData.id_instalacao ? parseInt(formData.id_instalacao) : null,
          eh_reservavel: formData.eh_reservavel,
        });

        if (data.success) {
          alert(data.message || 'Equipamento atualizado com sucesso!');
          setShowForm(false);
          loadEquipment();
        } else {
          setError(data.message || 'Erro ao atualizar equipamento');
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>('/admin/equipment', {
          id_patrimonio: formData.id_patrimonio,
          nome: formData.nome,
          id_instalacao: formData.id_instalacao ? parseInt(formData.id_instalacao) : null,
          preco: formData.preco ? parseFloat(formData.preco) : null,
          data_aquisicao: formData.data_aquisicao || null,
          eh_reservavel: formData.eh_reservavel,
        });

        if (data.success) {
          alert(data.message || 'Equipamento criado com sucesso!');
          setShowForm(false);
          loadEquipment();
        } else {
          setError(data.message || 'Erro ao criar equipamento');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar equipamento:', err);
      setError(err.message || 'Erro ao salvar equipamento');
    } finally {
      setSubmitting(false);
    }
  };

  // Define columns
  const columns: ColumnDef<Equipment>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        ),
        enableSorting: false,
        enableHiding: false,
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
        cell: ({ row }) => <div className="font-medium">{row.getValue('id_patrimonio')}</div>,
      },
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
        cell: ({ row }) => <div>{row.getValue('nome')}</div>,
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
        id: 'preco',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Preço
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const preco = row.original.preco_aquisicao;
          return <div>{preco ? `R$ ${preco.toFixed(2)}` : '—'}</div>;
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.preco_aquisicao || 0;
          const b = rowB.original.preco_aquisicao || 0;
          return a - b;
        },
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
          const equipment = row.original;

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
                <DropdownMenuItem onClick={() => handleEdit(equipment.id_patrimonio)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(equipment.id_patrimonio)}
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
    data: equipment,
    columns,
    getRowId: (row) => row.id_patrimonio,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Equipamentos</h2>
        <Button
          onClick={handleCreate}
          className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Novo Equipamento
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-md font-semibold text-gray-900">
            {editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {!editingEquipment && (
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block font-medium">ID Patrimônio</span>
                  <input
                    type="text"
                    value={formData.id_patrimonio}
                    onChange={(e) => setFormData({ ...formData, id_patrimonio: e.target.value })}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  />
                </label>
              )}
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
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Instalação</span>
                <select
                  value={formData.id_instalacao}
                  onChange={(e) => setFormData({ ...formData, id_instalacao: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                >
                  <option value="">Nenhuma</option>
                  {installations.map((inst) => (
                    <option key={inst.id_instalacao} value={inst.id_instalacao}>
                      {inst.nome}
                    </option>
                  ))}
                </select>
              </label>
              {!editingEquipment && (
                <>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Preço de Aquisição</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    />
                  </label>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Data de Aquisição</span>
                    <input
                      type="date"
                      value={formData.data_aquisicao}
                      onChange={(e) => setFormData({ ...formData, data_aquisicao: e.target.value })}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    />
                  </label>
                </>
              )}
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
                {submitting ? 'Salvando...' : editingEquipment ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando equipamentos...</div>
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
                        {column.id === 'id_patrimonio'
                          ? 'ID Patrimônio'
                          : column.id === 'nome_instalacao'
                          ? 'Instalação'
                          : column.id === 'eh_reservavel'
                          ? 'Reservável'
                          : column.id === 'preco'
                          ? 'Preço'
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
                      data-state={row.getIsSelected() && 'selected'}
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
                      Nenhum equipamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} de{' '}
              {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
            </div>
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
