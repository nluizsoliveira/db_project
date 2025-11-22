'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';

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
  token: string;
  atividade_nome: string | null;
  atividade_data_inicio: string | null;
  atividade_data_fim: string | null;
  atividade_vagas_limite: number | null;
}

interface InvitesListProps {
  refreshTrigger?: number;
}

export default function InvitesList({ refreshTrigger }: InvitesListProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInvites = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        invites: Invite[];
      }>('/internal/invites');

      if (data.success) {
        setInvites(data.invites || []);
      }
    } catch (err) {
      console.error('Erro ao carregar convites:', err);
      setError('Erro ao carregar convites');
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, [refreshTrigger]);

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

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    alert('Token copiado para a área de transferência!');
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Convites Criados</h2>
        <button
          onClick={loadInvites}
          className="rounded border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Atualizar
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando convites...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Convidado</th>
                <th className="px-3 py-2">Documento</th>
                <th className="px-3 py-2">E-mail</th>
                <th className="px-3 py-2">Atividade</th>
                <th className="px-3 py-2">Data Convite</th>
                <th className="px-3 py-2">Token</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invites.length > 0 ? (
                invites.map((invite) => (
                  <tr key={invite.id_convite} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{getStatusBadge(invite.status)}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{invite.nome_convidado}</td>
                    <td className="px-3 py-2">{invite.documento_convidado}</td>
                    <td className="px-3 py-2">{invite.email_convidado || 'N/A'}</td>
                    <td className="px-3 py-2">
                      {invite.atividade_nome || 'N/A'}
                      {invite.id_atividade && (
                        <span className="ml-2 text-xs text-gray-500">(ID: {invite.id_atividade})</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{formatDate(invite.data_convite)}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => copyToken(invite.token)}
                        className="rounded bg-[#1094ab] px-2 py-1 text-xs font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
                        title="Clique para copiar o token"
                      >
                        Copiar Token
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={7}>
                    Nenhum convite criado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
