'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

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
      alert('Erro ao carregar atividade');
    }
  };

  const handleDelete = async (activityId: number) => {
    if (!confirm('Deseja realmente deletar esta atividade? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/staff/activities/${activityId}`);

      if (data.success) {
        alert(data.message || 'Atividade deletada com sucesso!');
        loadActivities();
      } else {
        alert(data.message || 'Erro ao deletar atividade');
      }
    } catch (err: any) {
      console.error('Erro ao deletar atividade:', err);
      alert(err.message || 'Erro ao deletar atividade');
    }
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
          alert(data.message || 'Atividade atualizada com sucesso!');
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
          alert(data.message || 'Atividade criada com sucesso!');
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

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Atividades</h2>
        <button
          onClick={handleCreate}
          className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Nova Atividade
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-md font-semibold text-gray-900">
            {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
          </h3>
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
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError('');
                }}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : editingActivity ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando atividades...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">Atividade</th>
                <th className="px-3 py-2">Grupo</th>
                <th className="px-3 py-2">Dia</th>
                <th className="px-3 py-2">Horário</th>
                <th className="px-3 py-2">Vagas</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activities.length > 0 ? (
                activities.map((activity, index) => {
                  const uniqueKey = `${activity.id_atividade}-${activity.weekday || 'no-day'}-${activity.horario_inicio || 'no-time'}-${index}`;
                  return (
                    <tr key={uniqueKey}>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        {activity.nome_atividade}
                      </td>
                      <td className="px-3 py-2">{activity.grupo_extensao || '—'}</td>
                      <td className="px-3 py-2">{activity.weekday}</td>
                      <td className="px-3 py-2">
                        {activity.horario_inicio} - {activity.horario_fim}
                      </td>
                      <td className="px-3 py-2">
                        {activity.vagas_ocupadas} / {activity.vagas_limite}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(activity.id_atividade)}
                            className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id_atividade)}
                            className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={6}>
                    Nenhuma atividade encontrada.
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
