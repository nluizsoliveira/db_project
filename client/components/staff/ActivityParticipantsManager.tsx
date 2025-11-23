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
import { apiGet, apiPost, apiDelete } from '@/lib/api';

interface Participant {
  cpf_participante: string;
  nome_participante: string;
  data_inscricao: string;
}

interface ActivityParticipantsManagerProps {
  activityId: number | null;
  onUpdate?: () => void;
}

export default function ActivityParticipantsManager({
  activityId,
  onUpdate,
}: ActivityParticipantsManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cpfToAdd, setCpfToAdd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const loadParticipants = async () => {
    if (!activityId) {
      setParticipants([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        participants: Participant[];
      }>(`/staff/activities/${activityId}/participants`);

      if (data.success) {
        setParticipants(data.participants || []);
      }
    } catch (err) {
      console.error('Erro ao carregar participantes:', err);
      setError('Erro ao carregar participantes');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [activityId]);

  const handleAddParticipant = async (e: FormEvent) => {
    e.preventDefault();
    if (!activityId || !cpfToAdd.trim()) {
      setError('CPF é obrigatório');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>(`/staff/activities/${activityId}/participants`, {
        cpf_participante: cpfToAdd.trim(),
      });

      if (data.success) {
        alert(data.message || 'Participante inscrito com sucesso!');
        setCpfToAdd('');
        loadParticipants();
        if (onUpdate) {
          onUpdate();
        }
      } else {
        setError(data.message || 'Erro ao inscrever participante');
      }
    } catch (err: any) {
      console.error('Erro ao inscrever participante:', err);
      setError(err.message || 'Erro ao inscrever participante');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveParticipant = async (cpf: string) => {
    if (!activityId) return;
    if (!confirm(`Deseja realmente remover o participante ${cpf} desta atividade?`)) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/staff/activities/${activityId}/participants/${cpf}`);

      if (data.success) {
        alert(data.message || 'Participante removido com sucesso!');
        loadParticipants();
        if (onUpdate) {
          onUpdate();
        }
      } else {
        alert(data.message || 'Erro ao remover participante');
      }
    } catch (err: any) {
      console.error('Erro ao remover participante:', err);
      alert(err.message || 'Erro ao remover participante');
    }
  };

  // Define columns
  const columns: ColumnDef<Participant>[] = useMemo(
    () => [
      {
        accessorKey: 'cpf_participante',
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
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('cpf_participante')}</div>
        ),
      },
      {
        accessorKey: 'nome_participante',
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
        cell: ({ row }) => <div>{row.getValue('nome_participante')}</div>,
      },
      {
        accessorKey: 'data_inscricao',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Data de Inscrição
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('data_inscricao')}</div>,
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const participant = row.original;
          return (
            <Button
              onClick={() => handleRemoveParticipant(participant.cpf_participante)}
              className="bg-red-600 text-white hover:bg-red-700"
              size="sm"
            >
              Remover
            </Button>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: participants,
    columns,
    getRowId: (row) => row.cpf_participante,
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

  if (!activityId) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Gerenciar Participantes</h2>
        <p className="text-sm text-gray-500">Selecione uma atividade para gerenciar seus participantes.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Gerenciar Participantes</h2>

      <form onSubmit={handleAddParticipant} className="mb-4 flex gap-2">
        <input
          type="text"
          value={cpfToAdd}
          onChange={(e) => setCpfToAdd(e.target.value)}
          placeholder="CPF do participante"
          className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
        >
          {submitting ? 'Adicionando...' : 'Adicionar'}
        </button>
      </form>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando participantes...</div>
      ) : participants.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
          <p className="text-gray-500">Nenhum participante inscrito nesta atividade.</p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filtrar por nome..."
              value={
                (table.getColumn('nome_participante')?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn('nome_participante')?.setFilterValue(event.target.value)
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
                        {column.id === 'cpf_participante'
                          ? 'CPF'
                          : column.id === 'nome_participante'
                          ? 'Nome'
                          : column.id === 'data_inscricao'
                          ? 'Data de Inscrição'
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
