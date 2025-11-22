'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiGet, apiDelete } from '@/lib/api';

interface InstallationReservation {
  id_reserva: number;
  id_instalacao: number;
  nome_instalacao: string;
  tipo_instalacao: string;
  cpf_responsavel_interno: string;
  nome_responsavel: string;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
}

export default function InstallationReservationsManager() {
  const [reservations, setReservations] = useState<InstallationReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: '',
    id_instalacao: '',
    cpf_responsavel: '',
  });

  const loadReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.data_inicio) params.append('data_inicio', filters.data_inicio);
      if (filters.data_fim) params.append('data_fim', filters.data_fim);
      if (filters.id_instalacao) params.append('id_instalacao', filters.id_instalacao);
      if (filters.cpf_responsavel) params.append('cpf_responsavel', filters.cpf_responsavel);

      const data = await apiGet<{
        success: boolean;
        reservations: InstallationReservation[];
      }>(`/staff/installations/reservations?${params.toString()}`);

      if (data.success) {
        setReservations(data.reservations || []);
      }
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
      setError('Erro ao carregar reservas');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loadReservations();
  };

  const handleCancelReservation = async (id: number) => {
    if (!confirm('Deseja realmente cancelar esta reserva?')) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/staff/installations/reservations/${id}`);

      if (data.success) {
        alert(data.message || 'Reserva cancelada com sucesso!');
        loadReservations();
      } else {
        alert(data.message || 'Erro ao cancelar reserva');
      }
    } catch (err: any) {
      console.error('Erro ao cancelar reserva:', err);
      alert(err.message || 'Erro ao cancelar reserva');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Gerenciar Reservas de Instalações</h2>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-4 sm:grid-cols-4">
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Data Início</span>
          <input
            type="date"
            value={filters.data_inicio}
            onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">Data Fim</span>
          <input
            type="date"
            value={filters.data_fim}
            onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">ID Instalação</span>
          <input
            type="text"
            value={filters.id_instalacao}
            onChange={(e) => setFilters({ ...filters, id_instalacao: e.target.value })}
            placeholder="Filtrar por instalação"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>
        <label className="text-sm text-gray-600">
          <span className="mb-1 block font-medium">CPF Responsável</span>
          <input
            type="text"
            value={filters.cpf_responsavel}
            onChange={(e) => setFilters({ ...filters, cpf_responsavel: e.target.value })}
            placeholder="Filtrar por CPF"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
          />
        </label>
        <div className="sm:col-span-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setFilters({ data_inicio: '', data_fim: '', id_instalacao: '', cpf_responsavel: '' });
              loadReservations();
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

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando reservas...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">Instalação</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Responsável</th>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Horário</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reservations.length > 0 ? (
                reservations.map((reservation) => (
                  <tr key={reservation.id_reserva}>
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {reservation.nome_instalacao}
                    </td>
                    <td className="px-3 py-2">{reservation.tipo_instalacao}</td>
                    <td className="px-3 py-2">
                      {reservation.nome_responsavel} ({reservation.cpf_responsavel_interno})
                    </td>
                    <td className="px-3 py-2">{reservation.data_reserva}</td>
                    <td className="px-3 py-2">
                      {reservation.horario_inicio} - {reservation.horario_fim}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleCancelReservation(reservation.id_reserva)}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={6}>
                    Nenhuma reserva encontrada com os filtros selecionados.
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
