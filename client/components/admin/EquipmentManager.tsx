'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Equipment {
  id_patrimonio: string;
  nome: string;
  id_instalacao_local: number | null;
  nome_instalacao: string | null;
  preco_aquisicao: number | null;
  data_aquisicao: string | null;
  eh_reservavel: string;
}

interface Installation {
  id_instalacao: number;
  nome: string;
}

export default function EquipmentManager() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id_patrimonio: '',
    nome: '',
    id_instalacao: '',
    preco: '',
    data_aquisicao: '',
    eh_reservavel: 'N',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadEquipment = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        equipment: Equipment[];
      }>('/admin/equipment');

      if (data.success) {
        setEquipment(data.equipment || []);
      }
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err);
      setError('Erro ao carregar equipamentos');
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInstallations = async () => {
    try {
      const data = await apiGet<{
        success: boolean;
        installations: Installation[];
      }>('/admin/installations');

      if (data.success) {
        setInstallations(data.installations || []);
      }
    } catch (err) {
      console.error('Erro ao carregar instalações:', err);
    }
  };

  useEffect(() => {
    loadEquipment();
    loadInstallations();
  }, []);

  const handleCreate = () => {
    setEditingEquipment(null);
    setFormData({
      id_patrimonio: '',
      nome: '',
      id_instalacao: '',
      preco: '',
      data_aquisicao: '',
      eh_reservavel: 'N',
    });
    setShowForm(true);
  };

  const handleEdit = async (equipmentId: string) => {
    try {
      const data = await apiGet<{
        success: boolean;
        equipment: Equipment;
      }>(`/admin/equipment/${equipmentId}`);

      if (data.success && data.equipment) {
        setEditingEquipment(data.equipment);
        setFormData({
          id_patrimonio: data.equipment.id_patrimonio,
          nome: data.equipment.nome,
          id_instalacao: data.equipment.id_instalacao_local?.toString() || '',
          preco: data.equipment.preco_aquisicao?.toString() || '',
          data_aquisicao: data.equipment.data_aquisicao || '',
          eh_reservavel: data.equipment.eh_reservavel,
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error('Erro ao carregar equipamento:', err);
      alert('Erro ao carregar equipamento');
    }
  };

  const handleDelete = async (equipmentId: string) => {
    if (!confirm('Deseja realmente deletar este equipamento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/equipment/${equipmentId}`);

      if (data.success) {
        alert(data.message || 'Equipamento deletado com sucesso!');
        loadEquipment();
      } else {
        alert(data.message || 'Erro ao deletar equipamento');
      }
    } catch (err: any) {
      console.error('Erro ao deletar equipamento:', err);
      alert(err.message || 'Erro ao deletar equipamento');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingEquipment) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/admin/equipment/${editingEquipment.id_patrimonio}`, {
          nome: formData.nome,
          id_instalacao: formData.id_instalacao ? parseInt(formData.id_instalacao) : null,
          eh_reservavel: formData.eh_reservavel,
        });

        if (data.success) {
          alert(data.message || 'Equipamento atualizado com sucesso!');
          setShowForm(false);
          loadEquipment();
        } else {
          setError(data.message || 'Erro ao atualizar equipamento');
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>('/admin/equipment', {
          id_patrimonio: formData.id_patrimonio,
          nome: formData.nome,
          id_instalacao: formData.id_instalacao ? parseInt(formData.id_instalacao) : null,
          preco: formData.preco ? parseFloat(formData.preco) : null,
          data_aquisicao: formData.data_aquisicao || null,
          eh_reservavel: formData.eh_reservavel,
        });

        if (data.success) {
          alert(data.message || 'Equipamento criado com sucesso!');
          setShowForm(false);
          loadEquipment();
        } else {
          setError(data.message || 'Erro ao criar equipamento');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar equipamento:', err);
      setError(err.message || 'Erro ao salvar equipamento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Equipamentos</h2>
        <button
          onClick={handleCreate}
          className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Novo Equipamento
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-md font-semibold text-gray-900">
            {editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {!editingEquipment && (
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block font-medium">ID Patrimônio</span>
                  <input
                    type="text"
                    value={formData.id_patrimonio}
                    onChange={(e) => setFormData({ ...formData, id_patrimonio: e.target.value })}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  />
                </label>
              )}
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
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Instalação</span>
                <select
                  value={formData.id_instalacao}
                  onChange={(e) => setFormData({ ...formData, id_instalacao: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                >
                  <option value="">Nenhuma</option>
                  {installations.map((inst) => (
                    <option key={inst.id_instalacao} value={inst.id_instalacao}>
                      {inst.nome}
                    </option>
                  ))}
                </select>
              </label>
              {!editingEquipment && (
                <>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Preço de Aquisição</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    />
                  </label>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Data de Aquisição</span>
                    <input
                      type="date"
                      value={formData.data_aquisicao}
                      onChange={(e) => setFormData({ ...formData, data_aquisicao: e.target.value })}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    />
                  </label>
                </>
              )}
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Reservável</span>
                <select
                  value={formData.eh_reservavel}
                  onChange={(e) => setFormData({ ...formData, eh_reservavel: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                >
                  <option value="S">Sim</option>
                  <option value="N">Não</option>
                </select>
              </label>
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
                {submitting ? 'Salvando...' : editingEquipment ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando equipamentos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">ID Patrimônio</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Instalação</th>
                <th className="px-3 py-2">Preço</th>
                <th className="px-3 py-2">Reservável</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {equipment.length > 0 ? (
                equipment.map((eq) => (
                  <tr key={eq.id_patrimonio}>
                    <td className="px-3 py-2 font-medium text-gray-900">{eq.id_patrimonio}</td>
                    <td className="px-3 py-2">{eq.nome}</td>
                    <td className="px-3 py-2">{eq.nome_instalacao || '—'}</td>
                    <td className="px-3 py-2">
                      {eq.preco_aquisicao ? `R$ ${eq.preco_aquisicao.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-3 py-2">{eq.eh_reservavel === 'S' ? 'Sim' : 'Não'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(eq.id_patrimonio)}
                          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(eq.id_patrimonio)}
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
                    Nenhum equipamento encontrado.
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
