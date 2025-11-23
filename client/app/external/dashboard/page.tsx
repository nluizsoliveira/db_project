'use client';

import { useState, useEffect } from 'react';
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


export default function ExternalDashboardPage() {
  const alertDialog = useAlertDialog();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadInviteData();
  }, []);

  const loadInviteData = async (forceReload = false) => {
    try {
      setError('');
      if (forceReload) {
        // Forçar recarregamento limpando o estado primeiro
        setInvite(null);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      const data = await apiGet<{
        success: boolean;
        invite: Invite;
        participation: Participation | null;
      }>(`/external/dashboard?t=${timestamp}`);

      if (data.success) {
        console.log('Dados do convite recarregados:', data.invite);
        console.log('Status do convite:', data.invite.status);
        console.log('Status anterior:', invite?.status);

        // Forçar atualização do estado criando novos objetos
        const newInvite: Invite = {
          id_convite: data.invite.id_convite,
          status: data.invite.status,
          nome_convidado: data.invite.nome_convidado,
          documento_convidado: data.invite.documento_convidado,
          email_convidado: data.invite.email_convidado,
          telefone_convidado: data.invite.telefone_convidado,
          id_atividade: data.invite.id_atividade,
          data_convite: data.invite.data_convite,
          data_resposta: data.invite.data_resposta,
          observacoes: data.invite.observacoes,
          atividade_nome: data.invite.atividade_nome,
          atividade_data_inicio: data.invite.atividade_data_inicio,
          atividade_data_fim: data.invite.atividade_data_fim,
          atividade_vagas_limite: data.invite.atividade_vagas_limite,
        };

        setInvite(newInvite);
        setParticipation(data.participation ? { ...data.participation } : null);
        const newRefreshKey = refreshKey + 1;
        setRefreshKey(newRefreshKey); // Forçar re-render

        console.log('Estado atualizado. Novo status:', newInvite.status);
        console.log('Refresh key atualizado para:', newRefreshKey);
      } else {
        console.error('Erro ao carregar dados: resposta não foi bem-sucedida');
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
    setSuccessMessage('');

    try {
      console.log('Iniciando aceitação do convite...');
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/external/accept', {});

      console.log('Resposta do servidor:', data);

      if (data.success) {
        const message = data.message || 'Convite aceito com sucesso!';
        setSuccessMessage(message);
        console.log('Convite aceito com sucesso, recarregando dados...');

        // Aguardar um pouco antes de recarregar para garantir que o servidor processou
        await new Promise(resolve => setTimeout(resolve, 500));

        // Recarregar dados do convite forçando atualização
        await loadInviteData(true);

        // Mensagem de sucesso permanece visível (não será removida automaticamente)
      } else {
        // Erro de negócio (ex: vagas esgotadas) - não é uma exceção, apenas uma resposta negativa
        const errorMsg = data.message || 'Erro ao aceitar convite';
        setError(errorMsg);
        // Não usar console.error aqui para evitar aparecer como erro no console do Next.js
      }
    } catch (err) {
      console.error('Erro ao aceitar convite:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aceitar convite. Tente novamente.';
      setError(errorMessage);
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
        setSuccessMessage('');

        try {
          console.log('Iniciando recusa do convite...');
          const data = await apiPost<{
            success: boolean;
            message?: string;
          }>('/external/reject', {});

          console.log('Resposta do servidor:', data);

          if (data.success) {
            const message = data.message || 'Convite recusado com sucesso!';
            setSuccessMessage(message);
            console.log('Convite recusado com sucesso, recarregando dados...');

            // Aguardar um pouco antes de recarregar para garantir que o servidor processou
            await new Promise(resolve => setTimeout(resolve, 500));

            // Recarregar dados do convite forçando atualização
            await loadInviteData(true);

            // Mensagem de sucesso permanece visível
          } else {
            // Erro de negócio - não é uma exceção, apenas uma resposta negativa
            const errorMsg = data.message || 'Erro ao recusar convite';
            setError(errorMsg);
          }
        } catch (err) {
          console.error('Erro ao recusar convite:', err);
          const errorMessage = err instanceof Error ? err.message : 'Erro ao recusar convite. Tente novamente.';
          setError(errorMessage);
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

          {successMessage && (
            <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4 text-sm font-medium text-green-800 shadow-sm">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Botão Aceitar clicado');
                  handleAccept();
                }}
                disabled={actionLoading}
                className="flex-1 rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Processando...' : 'Aceitar Convite'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleReject();
                }}
                disabled={actionLoading}
                className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Processando...' : 'Recusar Convite'}
              </button>
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
