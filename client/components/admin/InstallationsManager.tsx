'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Installation {
  id_instalacao: number;
  nome: string;
  tipo: string;
  capacidade: number;
  eh_reservavel: string;
}

export default function InstallationsManager() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    capacidade: '',
    eh_reservavel: 'N',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadInstallations = async () => {
    setLoading(true);
    setError('');
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
      setError('Erro ao carregar instalações');
      setInstallations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstallations();
  }, []);

  const handleCreate = () => {
    setEditingInstallation(null);
    setFormData({ nome: '', tipo: '', capacidade: '', eh_reservavel: 'N' });
    setShowForm(true);
  };

  const handleEdit = async (installationId: number) => {
    try {
      const data = await apiGet<{
        success: boolean;
        installation: Installation;
      }>(`/admin/installations/${installationId}`);

      if (data.success && data.installation) {
        setEditingInstallation(data.installation);
        setFormData({
          nome: data.installation.nome,
          tipo: data.installation.tipo,
          capacidade: data.installation.capacidade.toString(),
          eh_reservavel: data.installation.eh_reservavel,
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error('Erro ao carregar instalação:', err);
      alert('Erro ao carregar instalação');
    }
  };

  const handleDelete = async (installationId: number) => {
    if (!confirm('Deseja realmente deletar esta instalação? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/installations/${installationId}`);

      if (data.success) {
        alert(data.message || 'Instalação deletada com sucesso!');
        loadInstallations();
      } else {
        alert(data.message || 'Erro ao deletar instalação');
      }
    } catch (err: any) {
      console.error('Erro ao deletar instalação:', err);
      alert(err.message || 'Erro ao deletar instalação');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingInstallation) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/admin/installations/${editingInstallation.id_instalacao}`, {
          nome: formData.nome,
          capacidade: parseInt(formData.capacidade),
          eh_reservavel: formData.eh_reservavel,
        });

        if (data.success) {
          alert(data.message || 'Instalação atualizada com sucesso!');
          setShowForm(false);
          loadInstallations();
        } else {
          setError(data.message || 'Erro ao atualizar instalação');
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>('/admin/installations', {
          nome: formData.nome,
          tipo: formData.tipo,
          capacidade: parseInt(formData.capacidade),
          eh_reservavel: formData.eh_reservavel,
        });

        if (data.success) {
          alert(data.message || 'Instalação criada com sucesso!');
          setShowForm(false);
          loadInstallations();
        } else {
          setError(data.message || 'Erro ao criar instalação');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar instalação:', err);
      setError(err.message || 'Erro ao salvar instalação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Instalações</h2>
        <button
          onClick={handleCreate}
          className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Nova Instalação
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-md font-semibold text-gray-900">
            {editingInstallation ? 'Editar Instalação' : 'Nova Instalação'}
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
              {!editingInstallation && (
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block font-medium">Tipo</span>
                  <input
                    type="text"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  />
                </label>
              )}
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Capacidade</span>
                <input
                  type="number"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                  required
                  min="1"
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
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
                {submitting ? 'Salvando...' : editingInstallation ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando instalações...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Capacidade</th>
                <th className="px-3 py-2">Reservável</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {installations.length > 0 ? (
                installations.map((installation) => (
                  <tr key={installation.id_instalacao}>
                    <td className="px-3 py-2 font-medium text-gray-900">{installation.nome}</td>
                    <td className="px-3 py-2">{installation.tipo}</td>
                    <td className="px-3 py-2">{installation.capacidade}</td>
                    <td className="px-3 py-2">{installation.eh_reservavel === 'S' ? 'Sim' : 'Não'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(installation.id_instalacao)}
                          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(installation.id_instalacao)}
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
                  <td className="px-3 py-4 text-gray-500" colSpan={5}>
                    Nenhuma instalação encontrada.
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
