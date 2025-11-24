'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

export default function AuthInitializer() {
  const pathname = usePathname();
  const loadUser = useAuthStore((state) => state.loadUser);
  const initialized = useAuthStore((state) => state.initialized);
  const loading = useAuthStore((state) => state.loading);
  const loadAttemptedRef = useRef(false);

  // Verifica se estamos em uma página de autenticação
  // Inclui todas as rotas de autenticação para evitar carregar usuário desnecessariamente
  const isAuthPage = pathname?.startsWith('/auth/');

  useEffect(() => {
    // Não tenta carregar se estamos em páginas de autenticação
    // Isso evita queries desnecessárias e re-renders
    if (isAuthPage) {
      loadAttemptedRef.current = false;
      return;
    }

    // Só carrega o usuário se ainda não foi inicializado, não está carregando e ainda não tentou
    if (!initialized && !loading && !loadAttemptedRef.current) {
      loadAttemptedRef.current = true;
      loadUser();
    }

    // Reset o flag quando a inicialização for completada
    if (initialized) {
      loadAttemptedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, loading, isAuthPage]);

  return null;
}
