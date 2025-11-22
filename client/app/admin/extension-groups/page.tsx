'use client';

import { useState, useEffect, FormEvent } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

interface ExtensionGroup {
  nome_grupo: string;
  descricao: string;
  cpf_responsavel_interno: string;
  nome_responsavel: string;
}

export default function ExtensionGroupsPage() {
  const [groups, setGroups] = useState<ExtensionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    category: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ExtensionGroup | null>(null);
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    cpf_responsible: '',
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await apiGet<{
        success: boolean;
        groups: ExtensionGroup[];
      }>('/extension_group/');

      if (data.success && Array.isArray(data.groups)) {
        setGroups(data.groups);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
      setGroups([]);
      setMessage({
        category: 'error',
        text: 'Erro ao carregar grupos de extensão',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/extension_group/create', {
        group_name: formData.group_name,
        description: formData.description,
        cpf_responsible: formData.cpf_responsible,
      });

      if (data.success) {
        setMessage({
          category: 'success',
          text: data.message || 'Grupo de extensão criado com sucesso',
        });
        setShowCreateForm(false);
        setFormData({ group_name: '', description: '', cpf_responsible: '' });
        loadGroups();
      } else {
        setMessage({
          category: 'error',
          text: data.message || 'Erro ao criar grupo de extensão',
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao processar solicitação';
      try {
        const errorData = JSON.parse(errorMessage);
        setMessage({
          category: 'error',
          text: errorData.message || 'Erro ao criar grupo de extensão',
        });
      } catch {
        setMessage({ category: 'error', text: errorMessage });
      }
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/extension_group/update', {
        old_group_name: editingGroup.nome_grupo,
        new_group_name: formData.group_name,
        description: formData.description,
        cpf_responsible: formData.cpf_responsible,
      });

      if (data.success) {
        setMessage({
          category: 'success',
          text: data.message || 'Grupo de extensão atualizado com sucesso',
        });
        setEditingGroup(null);
        setFormData({ group_name: '', description: '', cpf_responsible: '' });
        loadGroups();
      } else {
        setMessage({
          category: 'error',
          text: data.message || 'Erro ao atualizar grupo de extensão',
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao processar solicitação';
      try {
        const errorData = JSON.parse(errorMessage);
        setMessage({
          category: 'error',
          text: errorData.message || 'Erro ao atualizar grupo de extensão',
        });
      } catch {
        setMessage({ category: 'error', text: errorMessage });
      }
    }
  };

  const handleDelete = async (groupName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o grupo "${groupName}"?`)) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>('/extension_group/delete', {
        group_name: groupName,
      });

      if (data.success) {
        setMessage({
          category: 'success',
          text: data.message || 'Grupo de extensão deletado com sucesso',
        });
        loadGroups();
      } else {
        setMessage({
          category: 'error',
          text: data.message || 'Erro ao deletar grupo de extensão',
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao processar solicitação';
      try {
        const errorData = JSON.parse(errorMessage);
        setMessage({
          category: 'error',
          text: errorData.message || 'Erro ao deletar grupo de extensão',
        });
      } catch {
        setMessage({ category: 'error', text: errorMessage });
      }
    }
  };

  const startEdit = (group: ExtensionGroup) => {
    setEditingGroup(group);
    setFormData({
      group_name: group.nome_grupo,
      description: group.descricao,
      cpf_responsible: group.cpf_responsavel_interno,
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingGroup(null);
    setFormData({ group_name: '', description: '', cpf_responsible: '' });
  };

  const cancelCreate = () => {
    setShowCreateForm(false);
    setFormData({ group_name: '', description: '', cpf_responsible: '' });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout messages={message ? [message] : undefined}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Gestão de Grupos de Extensão
            </h1>
            {!showCreateForm && !editingGroup && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
              >
                Criar Novo Grupo
              </button>
            )}
          </div>

          {(showCreateForm || editingGroup) && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                {editingGroup ? 'Editar Grupo de Extensão' : 'Criar Novo Grupo de Extensão'}
              </h2>
              <form onSubmit={editingGroup ? handleUpdate : handleCreate}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Nome do Grupo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.group_name}
                      onChange={(e) =>
                        setFormData({ ...formData, group_name: e.target.value })
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                      placeholder="Nome do grupo"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      CPF do Responsável
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cpf_responsible}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cpf_responsible: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      maxLength={11}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                      placeholder="Apenas números"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    placeholder="Descrição do grupo de extensão"
                  />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={editingGroup ? cancelEdit : cancelCreate}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
                  >
                    {editingGroup ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500">Carregando...</div>
          ) : groups.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Nome do Grupo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      CPF Responsável
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Nome Responsável
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {groups.map((group) => (
                    <tr key={group.nome_grupo}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {group.nome_grupo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {group.descricao || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {group.cpf_responsavel_interno}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {group.nome_responsavel}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => startEdit(group)}
                          className="mr-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(group.nome_grupo)}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
              <p className="text-gray-500">
                Nenhum grupo de extensão cadastrado.
              </p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
