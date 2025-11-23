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
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface User {
  cpf: string;
  nome: string;
  email: string;
  celular: string | null;
  data_nascimento: string | null;
  tipo_usuario: string;
  nusp: string | null;
  categoria: string | null;
  formacao: string | null;
  numero_conselho: string | null;
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    email: '',
    celular: '',
    data_nascimento: '',
    tipo_usuario: 'interno',
    nusp: '',
    categoria: 'ALUNO',
    formacao: '',
    numero_conselho: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        users: User[];
      }>('/admin/users');

      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      cpf: '',
      nome: '',
      email: '',
      celular: '',
      data_nascimento: '',
      tipo_usuario: 'interno',
      nusp: '',
      categoria: 'ALUNO',
      formacao: '',
      numero_conselho: '',
    });
    setShowForm(true);
  };

  const handleEdit = async (cpf: string) => {
    try {
      const data = await apiGet<{
        success: boolean;
        user: User;
      }>(`/admin/users/${cpf}`);

      if (data.success && data.user) {
        setEditingUser(data.user);
        setFormData({
          cpf: data.user.cpf,
          nome: data.user.nome,
          email: data.user.email,
          celular: data.user.celular || '',
          data_nascimento: data.user.data_nascimento || '',
          tipo_usuario: data.user.tipo_usuario,
          nusp: data.user.nusp || '',
          categoria: data.user.categoria || 'ALUNO',
          formacao: data.user.formacao || '',
          numero_conselho: data.user.numero_conselho || '',
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      alert('Erro ao carregar usuário');
    }
  };

  const handleDelete = async (cpf: string) => {
    if (!confirm('Deseja realmente deletar este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/users/${cpf}`);

      if (data.success) {
        alert(data.message || 'Usuário deletado com sucesso!');
        loadUsers();
      } else {
        alert(data.message || 'Erro ao deletar usuário');
      }
    } catch (err: any) {
      console.error('Erro ao deletar usuário:', err);
      alert(err.message || 'Erro ao deletar usuário');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/admin/users/${editingUser.cpf}`, {
          nome: formData.nome,
          email: formData.email,
          celular: formData.celular || null,
          categoria: formData.tipo_usuario === 'interno' ? formData.categoria : null,
          formacao: formData.formacao || null,
          numero_conselho: formData.numero_conselho || null,
        });

        if (data.success) {
          alert(data.message || 'Usuário atualizado com sucesso!');
          setShowForm(false);
          loadUsers();
        } else {
          setError(data.message || 'Erro ao atualizar usuário');
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>('/admin/users', {
          cpf: formData.cpf,
          nome: formData.nome,
          email: formData.email,
          celular: formData.celular || null,
          data_nascimento: formData.data_nascimento || null,
          tipo_usuario: formData.tipo_usuario,
          nusp: formData.tipo_usuario === 'interno' ? formData.nusp : null,
          categoria: formData.tipo_usuario === 'interno' ? formData.categoria : null,
          formacao: formData.categoria === 'FUNCIONARIO' ? formData.formacao : null,
          numero_conselho: formData.numero_conselho || null,
        });

        if (data.success) {
          alert(data.message || 'Usuário criado com sucesso!');
          setShowForm(false);
          loadUsers();
        } else {
          setError(data.message || 'Erro ao criar usuário');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.message || 'Erro ao salvar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  // Define columns
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'cpf',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              CPF
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue('cpf')}</div>,
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
        accessorKey: 'email',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
      },
      {
        accessorKey: 'tipo_usuario',
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
        cell: ({ row }) => <div>{row.getValue('tipo_usuario')}</div>,
      },
      {
        accessorKey: 'nusp',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              NUSP
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('nusp') || '—'}</div>,
      },
      {
        accessorKey: 'categoria',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Categoria
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('categoria') || '—'}</div>,
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;

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
                <DropdownMenuItem onClick={() => handleEdit(user.cpf)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(user.cpf)}
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
    data: users,
    columns,
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
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Usuários</h2>
        <Button
          onClick={handleCreate}
          className="bg-[#1094ab] text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Novo Usuário
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-md font-semibold text-gray-900">
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {!editingUser && (
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block font-medium">CPF</span>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '') })
                    }
                    required
                    maxLength={11}
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
                <span className="mb-1 block font-medium">Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Celular</span>
                <input
                  type="text"
                  value={formData.celular}
                  onChange={(e) =>
                    setFormData({ ...formData, celular: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              {!editingUser && (
                <>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Data de Nascimento</span>
                    <input
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    />
                  </label>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Tipo de Usuário</span>
                    <select
                      value={formData.tipo_usuario}
                      onChange={(e) => setFormData({ ...formData, tipo_usuario: e.target.value })}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    >
                      <option value="interno">Interno USP</option>
                      <option value="externo">Externo USP</option>
                    </select>
                  </label>
                  {formData.tipo_usuario === 'interno' && (
                    <>
                      <label className="text-sm text-gray-600">
                        <span className="mb-1 block font-medium">NUSP</span>
                        <input
                          type="text"
                          value={formData.nusp}
                          onChange={(e) => setFormData({ ...formData, nusp: e.target.value })}
                          required
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                        />
                      </label>
                      <label className="text-sm text-gray-600">
                        <span className="mb-1 block font-medium">Categoria</span>
                        <select
                          value={formData.categoria}
                          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                          required
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                        >
                          <option value="ALUNO">Aluno</option>
                          <option value="FUNCIONARIO">Funcionário</option>
                        </select>
                      </label>
                      {formData.categoria === 'FUNCIONARIO' && (
                        <>
                          <label className="text-sm text-gray-600">
                            <span className="mb-1 block font-medium">Formação</span>
                            <input
                              type="text"
                              value={formData.formacao}
                              onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
                              required
                              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                            />
                          </label>
                          <label className="text-sm text-gray-600">
                            <span className="mb-1 block font-medium">Número do Conselho (Educador Físico)</span>
                            <input
                              type="text"
                              value={formData.numero_conselho}
                              onChange={(e) =>
                                setFormData({ ...formData, numero_conselho: e.target.value })
                              }
                              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                            />
                          </label>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
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
                {submitting ? 'Salvando...' : editingUser ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando usuários...</div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filtrar por email..."
              value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
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
                        {column.id === 'tipo_usuario'
                          ? 'Tipo'
                          : column.id === 'categoria'
                          ? 'Categoria'
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
                      Nenhum usuário encontrado.
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
