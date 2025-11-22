'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Event {
  id_evento: number;
  nome: string;
  descricao: string | null;
  id_reserva: number;
  data_reserva: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;
  nome_instalacao: string | null;
}

interface Reservation {
  id_reserva: number;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
  nome_instalacao: string;
}

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    id_reserva: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        events: Event[];
      }>('/admin/events');

      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Erro ao carregar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const data = await apiGet<{
        success: boolean;
        reservations: Reservation[];
      }>('/admin/reservations');

      if (data.success) {
        setReservations(data.reservations || []);
      }
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
    }
  };

  useEffect(() => {
    loadEvents();
    loadReservations();
  }, []);

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({ nome: '', descricao: '', id_reserva: '' });
    setShowForm(true);
  };

  const handleEdit = async (eventId: number) => {
    try {
      const data = await apiGet<{
        success: boolean;
        event: Event;
      }>(`/admin/events/${eventId}`);

      if (data.success && data.event) {
        setEditingEvent(data.event);
        setFormData({
          nome: data.event.nome,
          descricao: data.event.descricao || '',
          id_reserva: data.event.id_reserva.toString(),
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error('Erro ao carregar evento:', err);
      alert('Erro ao carregar evento');
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm('Deseja realmente deletar este evento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/events/${eventId}`);

      if (data.success) {
        alert(data.message || 'Evento deletado com sucesso!');
        loadEvents();
      } else {
        alert(data.message || 'Erro ao deletar evento');
      }
    } catch (err: any) {
      console.error('Erro ao deletar evento:', err);
      alert(err.message || 'Erro ao deletar evento');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingEvent) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/admin/events/${editingEvent.id_evento}`, {
          nome: formData.nome,
          descricao: formData.descricao,
        });

        if (data.success) {
          alert(data.message || 'Evento atualizado com sucesso!');
          setShowForm(false);
          loadEvents();
        } else {
          setError(data.message || 'Erro ao atualizar evento');
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>('/admin/events', {
          nome: formData.nome,
          descricao: formData.descricao,
          id_reserva: parseInt(formData.id_reserva),
        });

        if (data.success) {
          alert(data.message || 'Evento criado com sucesso!');
          setShowForm(false);
          loadEvents();
        } else {
          setError(data.message || 'Erro ao criar evento');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar evento:', err);
      setError(err.message || 'Erro ao salvar evento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Eventos</h2>
        <button
          onClick={handleCreate}
          className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Novo Evento
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-md font-semibold text-gray-900">
            {editingEvent ? 'Editar Evento' : 'Novo Evento'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
              {!editingEvent && (
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block font-medium">Reserva</span>
                  <select
                    value={formData.id_reserva}
                    onChange={(e) => setFormData({ ...formData, id_reserva: e.target.value })}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  >
                    <option value="">Selecione uma reserva</option>
                    {reservations.map((res) => (
                      <option key={res.id_reserva} value={res.id_reserva}>
                        {res.nome_instalacao} - {res.data_reserva} {res.horario_inicio}-{res.horario_fim}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <label className="text-sm text-gray-600">
              <span className="mb-1 block font-medium">Descrição</span>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
              />
            </label>
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
                {submitting ? 'Salvando...' : editingEvent ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando eventos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Descrição</th>
                <th className="px-3 py-2">Instalação</th>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Horário</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id_evento}>
                    <td className="px-3 py-2 font-medium text-gray-900">{event.nome}</td>
                    <td className="px-3 py-2">{event.descricao || '—'}</td>
                    <td className="px-3 py-2">{event.nome_instalacao || '—'}</td>
                    <td className="px-3 py-2">{event.data_reserva || '—'}</td>
                    <td className="px-3 py-2">
                      {event.horario_inicio && event.horario_fim
                        ? `${event.horario_inicio} - ${event.horario_fim}`
                        : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event.id_evento)}
                          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(event.id_evento)}
                          className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={6}>
                    Nenhum evento encontrado.
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
