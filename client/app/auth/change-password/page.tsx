'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { updatePassword, UpdatePasswordRequest } from '@/lib/api';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UpdatePasswordRequest>({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações no frontend
    if (!formData.current_password || !formData.new_password || !formData.new_password_confirm) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (formData.new_password !== formData.new_password_confirm) {
      setError('As novas senhas não coincidem');
      return;
    }

    if (formData.current_password === formData.new_password) {
      setError('A nova senha deve ser diferente da senha atual');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await updatePassword(formData);

      if (response.success) {
        setSuccess('Senha atualizada com sucesso');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(response.message || 'Erro ao atualizar senha');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar solicitação';

      // Tratamento específico para códigos de erro
      if (errorMessage.includes('Todos os campos são obrigatórios')) {
        setError('Todos os campos são obrigatórios');
      } else if (errorMessage.includes('As novas senhas não coincidem')) {
        setError('As novas senhas não coincidem');
      } else if (errorMessage.includes('A nova senha deve ser diferente da senha atual')) {
        setError('A nova senha deve ser diferente da senha atual');
      } else if (errorMessage.includes('Senha atual incorreta')) {
        setError('A senha atual está incorreta');
      } else if (errorMessage.includes('Autenticação necessária')) {
        setError('Você precisa estar autenticado para alterar a senha');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'staff', 'internal', 'external']}>
      <Layout>
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900">Alterar Senha</h1>
              <p className="mt-2 text-sm text-gray-500">
                Digite sua senha atual e escolha uma nova senha
              </p>
            </div>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="current_password" className="mb-1 block text-sm font-medium text-gray-700">
                  Senha Atual
                </label>
                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  required
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  className="w-full rounded border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div>
                <label htmlFor="new_password" className="mb-1 block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className="w-full rounded border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  placeholder="Digite sua nova senha"
                />
              </div>
              <div>
                <label htmlFor="new_password_confirm" className="mb-1 block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <input
                  id="new_password_confirm"
                  name="new_password_confirm"
                  type="password"
                  required
                  minLength={6}
                  value={formData.new_password_confirm}
                  onChange={(e) => setFormData({ ...formData, new_password_confirm: e.target.value })}
                  className="w-full rounded border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
                  placeholder="Confirme sua nova senha"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
              >
                {loading ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
