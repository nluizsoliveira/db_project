"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Layout from "@/components/Layout";
import { useLogin, useCurrentUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/lib/authStore";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Desabilita useCurrentUser em páginas de autenticação para evitar queries desnecessárias
  const { refetch: refetchUser } = useCurrentUser({ enabled: false });
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginMutation.mutateAsync({
        email,
        password,
      });

      // Recarrega o usuário após login bem-sucedido e sincroniza o store
      // refetchUser não é necessário aqui pois refreshUser já atualiza o store
      // e a query será invalidada pelo onSuccess do useLogin
      await refreshUser();

      // Check for redirect parameter or use backend redirect
      const redirectUrl = searchParams.get("redirect") || (data as any).redirect;

      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      // Para ApiError (erros esperados como credenciais inválidas),
      // não logar no console para evitar poluição de logs
      if (err && typeof err === 'object' && 'isApiError' in err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Erro ao fazer login. Tente novamente.");
      } else {
        // Para erros inesperados, logar no console
        console.error("Login error:", err);
        setError(err.message || "Erro ao fazer login. Tente novamente.");
      }
    }
  };

  const loading = loginMutation.isPending;

  return (
    <Layout
      hideNavbar
      hideFooter
      hideDebugButtons
      mainClass="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1094ab] to-[#64c4d2] p-6"
    >
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
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Acesse o Sistema CEFER
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Login para membros internos da USP e funcionários.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              E-mail institucional
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
              placeholder="nome.sobrenome@usp.br"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-[#1094ab] focus:outline-none focus:ring-1 focus:ring-[#1094ab]"
              placeholder="Digite sua senha"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#1094ab] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#64c4d2] hover:text-[#1094ab] disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 space-y-3 text-center">
          <Link
            href="/auth/register"
            className="block text-sm text-[#1094ab] hover:underline"
          >
            Solicitar cadastro no sistema CEFER →
          </Link>
          <Link
            href="/auth/login/external"
            className="block text-sm text-[#1094ab] hover:underline"
          >
            Acessar como usuário externo →
          </Link>
        </div>
      </div>
    </Layout>
  );
}
