'use client';

import { useState, FormEvent } from 'react';
import {
  useAvailableInstallations,
  useCreateInstallationReservation,
  useCreateEquipmentReservation,
  useReservationFormData,
} from '@/hooks/useReservations';

interface Installation {
  id_instalacao: number;
  nome: string;
  tipo: string;
  capacidade: number;
}

interface Equipment {
  id_patrimonio: string;
  nome: string;
  local: string | null;
  eh_reservavel: string;
}

interface ReservationFormProps {
  onSuccess?: () => void;
}

export default function ReservationForm({ onSuccess }: ReservationFormProps) {
  const [type, setType] = useState<'installation' | 'equipment'>('installation');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id_instalacao: '',
    id_equipamento: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    date: '',
    start: '',
    end: '',
  });

  const { data: installations = [], isLoading: loadingInstallations } = useAvailableInstallations(
    formData.date,
    formData.start,
    formData.end
  );
  const { equipment: equipmentData, installations: allInstallations } = useReservationFormData();
  const equipment = equipmentData.data || [];
  const createInstallationMutation = useCreateInstallationReservation();
  const createEquipmentMutation = useCreateEquipmentReservation();

  const loading = type === 'installation' ? loadingInstallations : equipmentData.isLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (type === 'installation') {
        if (!formData.id_instalacao || !formData.data || !formData.hora_inicio || !formData.hora_fim) {
          setError('Todos os campos são obrigatórios');
          return;
        }

        const data = await createInstallationMutation.mutateAsync({
          id_instalacao: parseInt(formData.id_instalacao),
          data: formData.data,
          hora_inicio: formData.hora_inicio,
          hora_fim: formData.hora_fim,
        });

        alert(data.message || 'Reserva realizada com sucesso!');
        if (onSuccess) {
          onSuccess();
        }
        setFormData({
          id_instalacao: '',
          id_equipamento: '',
          data: '',
          hora_inicio: '',
          hora_fim: '',
          date: '',
          start: '',
          end: '',
        });
      } else {
        if (!formData.id_equipamento || !formData.data || !formData.hora_inicio || !formData.hora_fim) {
          setError('Todos os campos são obrigatórios');
          return;
        }

        const data = await createEquipmentMutation.mutateAsync({
          id_equipamento: formData.id_equipamento,
          data: formData.data,
          hora_inicio: formData.hora_inicio,
          hora_fim: formData.hora_fim,
        });

        alert(data.message || 'Reserva de equipamento realizada com sucesso!');
        if (onSuccess) {
          onSuccess();
        }
        setFormData({
          id_instalacao: '',
          id_equipamento: '',
          data: '',
          hora_inicio: '',
          hora_fim: '',
          date: '',
          start: '',
          end: '',
        });
      }
    } catch (err: any) {
      console.error('Erro ao realizar reserva:', err);
      setError(err.message || 'Erro ao realizar reserva');
    }
  };

  const submitting = createInstallationMutation.isPending || createEquipmentMutation.isPending;

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Fazer Reserva</h2>

      <div className="mb-4 flex gap-4">
        <button
          type="button"
          onClick={() => setType('installation')}
          className={`rounded px-4 py-2 text-sm font-semibold ${
            type === 'installation'
              ? 'bg-[#1094ab] text-white'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Instalação
        </button>
        <button
          type="button"
          onClick={() => setType('equipment')}
          className={`rounded px-4 py-2 text-sm font-semibold ${
            type === 'equipment'
              ? 'bg-[#1094ab] text-white'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Equipamento
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'installation' && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Data para verificar disponibilidade</span>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value, data: e.target.value });
                  }}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Horário Início</span>
                <input
                  type="time"
                  value={formData.start}
                  onChange={(e) => {
                    setFormData({ ...formData, start: e.target.value, hora_inicio: e.target.value });
                  }}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Horário Fim</span>
                <input
                  type="time"
                  value={formData.end}
                  onChange={(e) => {
                    setFormData({ ...formData, end: e.target.value, hora_fim: e.target.value });
                  }}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
            </div>

            {formData.date && formData.start && formData.end && (
              <div>
                <label className="block text-sm text-gray-600">
                  <span className="mb-1 block font-medium">Instalação Disponível</span>
                  {loading ? (
                    <div className="py-2 text-sm text-gray-500">Carregando instalações...</div>
                  ) : (
                    <select
                      value={formData.id_instalacao}
                      onChange={(e) => setFormData({ ...formData, id_instalacao: e.target.value })}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    >
                      <option value="">Selecione uma instalação</option>
                      {installations.map((inst) => (
                        <option key={inst.id_instalacao} value={inst.id_instalacao}>
                          {inst.nome} ({inst.tipo}) - Capacidade: {inst.capacidade}
                        </option>
                      ))}
                    </select>
                  )}
                  {!loading && installations.length === 0 && formData.date && formData.start && formData.end && (
                    <p className="mt-1 text-xs text-gray-500">
                      Nenhuma instalação disponível no período selecionado
                    </p>
                  )}
                </label>
              </div>
            )}
          </>
        )}

        {type === 'equipment' && (
          <div>
            <label className="block text-sm text-gray-600">
              <span className="mb-1 block font-medium">Equipamento</span>
              {loading ? (
                <div className="py-2 text-sm text-gray-500">Carregando equipamentos...</div>
              ) : (
                <select
                  value={formData.id_equipamento}
                  onChange={(e) => setFormData({ ...formData, id_equipamento: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                >
                  <option value="">Selecione um equipamento</option>
                  {equipment.map((eq) => (
                    <option key={eq.id_patrimonio} value={eq.id_patrimonio}>
                      {eq.nome} {eq.local ? `(${eq.local})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Data</span>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Horário Início</span>
                <input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Horário Fim</span>
                <input
                  type="time"
                  value={formData.hora_fim}
                  onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
            </div>
          </div>
        )}

        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                id_instalacao: '',
                id_equipamento: '',
                data: '',
                hora_inicio: '',
                hora_fim: '',
                date: '',
                start: '',
                end: '',
              });
              setError('');
            }}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
          >
            {submitting ? 'Processando...' : 'Reservar'}
          </button>
        </div>
      </form>
    </div>
  );
}
