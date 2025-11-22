'use client';

import { useState, useEffect, FormEvent } from 'react';
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
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">CPF</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Data de Inscrição</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {participants.length > 0 ? (
                participants.map((participant) => (
                  <tr key={participant.cpf_participante}>
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {participant.cpf_participante}
                    </td>
                    <td className="px-3 py-2">{participant.nome_participante}</td>
                    <td className="px-3 py-2">{participant.data_inscricao}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleRemoveParticipant(participant.cpf_participante)}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={4}>
                    Nenhum participante inscrito nesta atividade.
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
