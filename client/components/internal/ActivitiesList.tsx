'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiGet, apiPost } from '@/lib/api';

interface Activity {
  id_atividade: number;
  nome_atividade: string;
  grupo_extensao: string | null;
  weekday: string | null;
  horario_inicio: string;
  horario_fim: string;
  vagas_ocupadas: number;
  vagas_limite: number;
}

interface ActivitiesListProps {
  onEnroll?: (activityId: number) => void;
}

export default function ActivitiesList({ onEnroll }: ActivitiesListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    weekday: '',
    group_name: '',
    modality: '',
  });

  const loadActivities = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.weekday) params.append('weekday', filters.weekday);
      if (filters.group_name) params.append('group_name', filters.group_name);
      if (filters.modality) params.append('modality', filters.modality);

      const data = await apiGet<{
        success: boolean;
        activities: Activity[];
      }>(`/internal/activities?${params.toString()}`);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loadActivities();
  };

  const handleEnroll = async (activityId: number) => {
    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/internal/activities/enroll', {
        id_atividade: activityId,
      });

      if (data.success) {
        alert(data.message || 'Inscrição realizada com sucesso!');
        if (onEnroll) {
          onEnroll(activityId);
        }
        loadActivities();
      } else {
        alert(data.message || 'Erro ao inscrever na atividade');
      }
    } catch (err) {
      console.error('Erro ao inscrever:', err);
      alert('Erro ao inscrever na atividade');
    }
  };

  const diasSemana = [
    { value: '', label: 'Todos' },
    { value: 'SEGUNDA', label: 'Segunda-feira' },
    { value: 'TERCA', label: 'Terça-feira' },
    { value: 'QUARTA', label: 'Quarta-feira' },
    { value: 'QUINTA', label: 'Quinta-feira' },
    { value: 'SEXTA', label: 'Sexta-feira' },
    { value: 'SABADO', label: 'Sábado' },
    { value: 'DOMINGO', label: 'Domingo' },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Atividades Disponíveis</h2>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Dia da Semana</span>
          <select
            value={filters.weekday}
            onChange={(e) => setFilters({ ...filters, weekday: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          >
            {diasSemana.map((dia) => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Grupo de Extensão</span>
          <input
            type="text"
            value={filters.group_name}
            onChange={(e) => setFilters({ ...filters, group_name: e.target.value })}
            placeholder="Nome do grupo"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>

        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Modalidade</span>
          <input
            type="text"
            value={filters.modality}
            onChange={(e) => setFilters({ ...filters, modality: e.target.value })}
            placeholder="Nome da atividade"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>

        <div className="col-span-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setFilters({ weekday: '', group_name: '', modality: '' });
              loadActivities();
            }}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
          >
            Filtrar
          </button>
        </div>
      </form>

      {error && (
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
                  const vagasDisponiveis = activity.vagas_limite - activity.vagas_ocupadas;
                  const temVagas = vagasDisponiveis > 0;
                  // Create unique key combining id_atividade, weekday, and horario_inicio
                  const uniqueKey = `${activity.id_atividade}-${activity.weekday || 'no-day'}-${activity.horario_inicio || 'no-time'}-${index}`;

                  return (
                    <tr key={uniqueKey}>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        {activity.nome_atividade}
                      </td>
                      <td className="px-3 py-2">{activity.grupo_extensao || 'N/A'}</td>
                      <td className="px-3 py-2">
                        {activity.weekday
                          ? activity.weekday.charAt(0) + activity.weekday.slice(1).toLowerCase()
                          : 'N/A'}
                      </td>
                      <td className="px-3 py-2">
                        {activity.horario_inicio} - {activity.horario_fim}
                      </td>
                      <td className="px-3 py-2">
                        {activity.vagas_ocupadas}/{activity.vagas_limite} ({vagasDisponiveis}{' '}
                        disponíveis)
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleEnroll(activity.id_atividade)}
                          disabled={!temVagas}
                          className="rounded bg-[#1094ab] px-3 py-1 text-xs font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          {temVagas ? 'Inscrever-se' : 'Sem vagas'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={6}>
                    Nenhuma atividade encontrada com os filtros selecionados.
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
