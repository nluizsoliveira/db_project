'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface User {
  cpf: string;
  nome: string;
  email: string;
  celular: string | null;
  data_nascimento: string | null;
  tipo_usuario: string;
  nusp: string | null;
  categoria: string | null;
  formacao: string | null;
  numero_conselho: string | null;
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    email: '',
    celular: '',
    data_nascimento: '',
    tipo_usuario: 'interno',
    nusp: '',
    categoria: 'ALUNO',
    formacao: '',
    numero_conselho: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{
        success: boolean;
        users: User[];
      }>('/admin/users');

      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      cpf: '',
      nome: '',
      email: '',
      celular: '',
      data_nascimento: '',
      tipo_usuario: 'interno',
      nusp: '',
      categoria: 'ALUNO',
      formacao: '',
      numero_conselho: '',
    });
    setShowForm(true);
  };

  const handleEdit = async (cpf: string) => {
    try {
      const data = await apiGet<{
        success: boolean;
        user: User;
      }>(`/admin/users/${cpf}`);

      if (data.success && data.user) {
        setEditingUser(data.user);
        setFormData({
          cpf: data.user.cpf,
          nome: data.user.nome,
          email: data.user.email,
          celular: data.user.celular || '',
          data_nascimento: data.user.data_nascimento || '',
          tipo_usuario: data.user.tipo_usuario,
          nusp: data.user.nusp || '',
          categoria: data.user.categoria || 'ALUNO',
          formacao: data.user.formacao || '',
          numero_conselho: data.user.numero_conselho || '',
        });
        setShowForm(true);
      }
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      alert('Erro ao carregar usuário');
    }
  };

  const handleDelete = async (cpf: string) => {
    if (!confirm('Deseja realmente deletar este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/users/${cpf}`);

      if (data.success) {
        alert(data.message || 'Usuário deletado com sucesso!');
        loadUsers();
      } else {
        alert(data.message || 'Erro ao deletar usuário');
      }
    } catch (err: any) {
      console.error('Erro ao deletar usuário:', err);
      alert(err.message || 'Erro ao deletar usuário');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        // Update
        const data = await apiPut<{
          success: boolean;
          message?: string;
        }>(`/admin/users/${editingUser.cpf}`, {
          nome: formData.nome,
          email: formData.email,
          celular: formData.celular || null,
          categoria: formData.tipo_usuario === 'interno' ? formData.categoria : null,
          formacao: formData.formacao || null,
          numero_conselho: formData.numero_conselho || null,
        });

        if (data.success) {
          alert(data.message || 'Usuário atualizado com sucesso!');
          setShowForm(false);
          loadUsers();
        } else {
          setError(data.message || 'Erro ao atualizar usuário');
        }
      } else {
        // Create
        const data = await apiPost<{
          success: boolean;
          message?: string;
        }>('/admin/users', {
          cpf: formData.cpf,
          nome: formData.nome,
          email: formData.email,
          celular: formData.celular || null,
          data_nascimento: formData.data_nascimento || null,
          tipo_usuario: formData.tipo_usuario,
          nusp: formData.tipo_usuario === 'interno' ? formData.nusp : null,
          categoria: formData.tipo_usuario === 'interno' ? formData.categoria : null,
          formacao: formData.categoria === 'FUNCIONARIO' ? formData.formacao : null,
          numero_conselho: formData.numero_conselho || null,
        });

        if (data.success) {
          alert(data.message || 'Usuário criado com sucesso!');
          setShowForm(false);
          loadUsers();
        } else {
          setError(data.message || 'Erro ao criar usuário');
        }
      }
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.message || 'Erro ao salvar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Usuários</h2>
        <button
          onClick={handleCreate}
          className="rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white hover:bg-[#64c4d2] hover:text-[#1094ab]"
        >
          Novo Usuário
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-md font-semibold text-gray-900">
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {!editingUser && (
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block font-medium">CPF</span>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '') })
                    }
                    required
                    maxLength={11}
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
                <span className="mb-1 block font-medium">Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              <label className="text-sm text-gray-600">
                <span className="mb-1 block font-medium">Celular</span>
                <input
                  type="text"
                  value={formData.celular}
                  onChange={(e) =>
                    setFormData({ ...formData, celular: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                />
              </label>
              {!editingUser && (
                <>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Data de Nascimento</span>
                    <input
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    />
                  </label>
                  <label className="text-sm text-gray-600">
                    <span className="mb-1 block font-medium">Tipo de Usuário</span>
                    <select
                      value={formData.tipo_usuario}
                      onChange={(e) => setFormData({ ...formData, tipo_usuario: e.target.value })}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                    >
                      <option value="interno">Interno USP</option>
                      <option value="externo">Externo USP</option>
                    </select>
                  </label>
                  {formData.tipo_usuario === 'interno' && (
                    <>
                      <label className="text-sm text-gray-600">
                        <span className="mb-1 block font-medium">NUSP</span>
                        <input
                          type="text"
                          value={formData.nusp}
                          onChange={(e) => setFormData({ ...formData, nusp: e.target.value })}
                          required
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                        />
                      </label>
                      <label className="text-sm text-gray-600">
                        <span className="mb-1 block font-medium">Categoria</span>
                        <select
                          value={formData.categoria}
                          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                          required
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                        >
                          <option value="ALUNO">Aluno</option>
                          <option value="FUNCIONARIO">Funcionário</option>
                        </select>
                      </label>
                      {formData.categoria === 'FUNCIONARIO' && (
                        <>
                          <label className="text-sm text-gray-600">
                            <span className="mb-1 block font-medium">Formação</span>
                            <input
                              type="text"
                              value={formData.formacao}
                              onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
                              required
                              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                            />
                          </label>
                          <label className="text-sm text-gray-600">
                            <span className="mb-1 block font-medium">Número do Conselho (Educador Físico)</span>
                            <input
                              type="text"
                              value={formData.numero_conselho}
                              onChange={(e) =>
                                setFormData({ ...formData, numero_conselho: e.target.value })
                              }
                              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                            />
                          </label>
                        </>
                      )}
                    </>
                  )}
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
                {submitting ? 'Salvando...' : editingUser ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Carregando usuários...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">CPF</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">NUSP</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.cpf}>
                    <td className="px-3 py-2 font-medium text-gray-900">{user.cpf}</td>
                    <td className="px-3 py-2">{user.nome}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">{user.tipo_usuario}</td>
                    <td className="px-3 py-2">{user.nusp || '—'}</td>
                    <td className="px-3 py-2">{user.categoria || '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user.cpf)}
                          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(user.cpf)}
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
                  <td className="px-3 py-4 text-gray-500" colSpan={7}>
                    Nenhum usuário encontrado.
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
