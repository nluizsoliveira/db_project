'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';
import { apiPost, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

function ExternalLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiPost<{
        success: boolean;
        message?: string;
        redirect?: string;
      }>('/auth/login/external', {
        token: token.trim(),
      });

      if (data.success) {
        // Recarrega o usuário após login bem-sucedido
        await refreshUser();

        // Check for redirect parameter from URL or use backend redirect
        const redirectUrl = searchParams.get("redirect") || data.redirect;

        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/external/dashboard');
        }
      } else {
        setError(data.message || 'Token inválido');
      }
    } catch (err: unknown) {
      // Para ApiError (erros esperados como token inválido),
      // não logar no console para evitar poluição de logs
      if (err && typeof err === 'object' && 'isApiError' in err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Erro ao fazer login. Tente novamente.');
      } else if (err instanceof Error) {
        // Para erros inesperados, logar no console
        console.error('Login externo error:', err);
        try {
          const errorData = JSON.parse(err.message);
          setError(errorData.message || errorData.error || err.message || 'Erro ao fazer login. Tente novamente.');
        } catch {
          setError(err.message || 'Erro ao fazer login. Tente novamente.');
        }
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideNavbar hideFooter hideDebugButtons mainClass="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1094ab] to-[#64c4d2] p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <Image
            src="/cefer.png"
            alt="CEFER"
            width={120}
            height={40}
            className="mx-auto h-12 w-auto"
            priority
          />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Acesso Externo</h1>
          <p className="mt-2 text-sm text-gray-500">
            Insira o token do seu convite para acessar o sistema.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="mb-1 block text-sm font-medium text-gray-700">
              Token do Convite
            </label>
            <input
              id="token"
              name="token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-2 text-sm font-mono shadow-sm focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
              placeholder="Insira o token do convite"
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-gray-500">
              O token foi fornecido quando você recebeu o convite.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
          >
            {loading ? 'Acessando...' : 'Acessar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-[#1094ab] hover:underline"
          >
            ← Voltar para login interno/funcionário
          </Link>
        </div>
        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <h2 className="mb-2 font-semibold text-gray-800">Acesso Externo</h2>
          <p>
            Usuários externos podem acessar o sistema mediante convite validado.
            O token do convite foi fornecido quando você foi convidado para participar de uma atividade.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default function ExternalLoginPage() {
  return (
    <Suspense fallback={
      <Layout hideNavbar hideFooter hideDebugButtons mainClass="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1094ab] to-[#64c4d2] p-6">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
          <p className="text-sm text-white">Carregando...</p>
        </div>
      </Layout>
    }>
      <ExternalLoginContent />
    </Suspense>
  );
}
