'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet, apiPost } from '@/lib/api';
import { useAlertDialog } from '@/hooks/useAlertDialog';

interface Invite {
  id_convite: number;
  status: string;
  nome_convidado: string;
  documento_convidado: string;
  email_convidado: string | null;
  telefone_convidado: string | null;
  id_atividade: number | null;
  data_convite: string;
  data_resposta: string | null;
  observacoes: string | null;
  atividade_nome: string | null;
  atividade_data_inicio: string | null;
  atividade_data_fim: string | null;
  atividade_vagas_limite: number | null;
}

interface Participation {
  cpf_participante: string;
  id_atividade: number;
  data_inscricao: string;
  atividade_nome: string;
  atividade_data_inicio: string | null;
  atividade_data_fim: string | null;
  atividade_vagas_limite: number | null;
}

interface ExternalParticipation {
  participant_name: string;
  participant_email: string;
  activity_name: string;
  host_name: string;
  host_nusp: string;
}

export default function ExternalDashboardPage() {
  const router = useRouter();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [externalParticipations, setExternalParticipations] = useState<ExternalParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    loadInviteData();
  }, []);

  const loadInviteData = async () => {
    try {
      const data = await apiGet<{
        success: boolean;
        invite: Invite;
        participation: Participation | null;
        external_participations?: ExternalParticipation[];
      }>('/external/dashboard');

      if (data.success) {
        setInvite(data.invite);
        setParticipation(data.participation);
        setExternalParticipations(data.external_participations || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do convite:', err);
      setError('Erro ao carregar informações do convite');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    setError('');

    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/external/accept', {});

      if (data.success) {
        await loadInviteData();
      } else {
        setError(data.message || 'Erro ao aceitar convite');
      }
    } catch (err) {
      console.error('Erro ao aceitar convite:', err);
      setError('Erro ao aceitar convite. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    alertDialog.showConfirm(
      'Tem certeza que deseja recusar este convite?',
      'Confirmar Recusa',
      async () => {
        setActionLoading(true);
        setError('');

        try {
          const data = await apiPost<{
            success: boolean;
            message?: string;
          }>('/external/reject', {});

          if (data.success) {
            await loadInviteData();
          } else {
            setError(data.message || 'Erro ao recusar convite');
          }
        } catch (err) {
          console.error('Erro ao recusar convite:', err);
          setError('Erro ao recusar convite. Tente novamente.');
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDENTE: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      ACEITO: { label: 'Aceito', className: 'bg-green-100 text-green-800' },
      RECUSADO: { label: 'Recusado', className: 'bg-red-100 text-red-800' },
      CANCELADO: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['external']}>
        <Layout>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1094ab] border-r-transparent"></div>
              <p className="text-sm text-gray-600">Carregando informações do convite...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!invite) {
    return (
      <ProtectedRoute allowedRoles={['external']}>
        <Layout>
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            {error || 'Convite não encontrado'}
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['external']}>
      <Layout>
        <section className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">Meu Convite</h1>
            <p className="mt-1 text-sm text-gray-600">Informações sobre seu convite para participar de atividades</p>
          </header>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Informações do Convite</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">{getStatusBadge(invite.status)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nome</dt>
                  <dd className="mt-1 text-sm text-gray-900">{invite.nome_convidado}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Documento</dt>
                  <dd className="mt-1 text-sm text-gray-900">{invite.documento_convidado}</dd>
                </div>
                {invite.email_convidado && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">E-mail</dt>
                    <dd className="mt-1 text-sm text-gray-900">{invite.email_convidado}</dd>
                  </div>
                )}
                {invite.telefone_convidado && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{invite.telefone_convidado}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Data do Convite</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(invite.data_convite)}</dd>
                </div>
                {invite.data_resposta && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Data da Resposta</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(invite.data_resposta)}</dd>
                  </div>
                )}
                {invite.observacoes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Observações</dt>
                    <dd className="mt-1 text-sm text-gray-900">{invite.observacoes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {invite.id_atividade && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Atividade</h2>
                {invite.atividade_nome ? (
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nome</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">{invite.atividade_nome}</dd>
                    </div>
                    {invite.atividade_data_inicio && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Data de Início</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(invite.atividade_data_inicio)}</dd>
                      </div>
                    )}
                    {invite.atividade_data_fim && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Data de Término</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(invite.atividade_data_fim)}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">Informações da atividade não disponíveis</p>
                )}
              </div>
            )}

            {participation && (
              <div className="rounded-lg bg-white p-6 shadow md:col-span-2">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Participação Confirmada</h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Atividade</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{participation.atividade_nome}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Data de Inscrição</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(participation.data_inscricao)}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {invite.status === 'PENDENTE' && (
            <div className="flex gap-4 rounded-lg bg-white p-6 shadow">
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="flex-1 rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processando...' : 'Aceitar Convite'}
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processando...' : 'Recusar Convite'}
              </button>
            </div>
          )}

          {externalParticipations.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Participações Externas</h2>
              <div className="w-full space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Filtrar por participante..."
                    value={(externalParticipationTable.getColumn('participant_name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                      externalParticipationTable.getColumn('participant_name')?.setFilterValue(event.target.value)
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
                      {externalParticipationTable
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
                              {column.id === 'participant_name'
                                ? 'Participante'
                                : column.id === 'participant_email'
                                ? 'E-mail'
                                : column.id === 'activity_name'
                                ? 'Atividade'
                                : column.id === 'host_name'
                                ? 'Anfitrião'
                                : column.id === 'host_nusp'
                                ? 'NUSP'
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
                      {externalParticipationTable.getHeaderGroups().map((headerGroup) => (
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
                      {externalParticipationTable.getRowModel().rows?.length ? (
                        externalParticipationTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} className="hover:bg-gray-50">
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={externalParticipationColumns.length} className="h-24 text-center">
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
                      onClick={() => externalParticipationTable.previousPage()}
                      disabled={!externalParticipationTable.getCanPreviousPage()}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => externalParticipationTable.nextPage()}
                      disabled={!externalParticipationTable.getCanNextPage()}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

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
      </Layout>
    </ProtectedRoute>
  );
}
