'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { useLogout } from '@/hooks/useAuth';

export default function LogoutPage() {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);
  const logoutMutation = useLogout();
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    // Evita múltiplas execuções
    if (hasLoggedOut.current) {
      return;
    }
    hasLoggedOut.current = true;

    // Limpa usuário imediatamente (não espera a API)
    clearUser();

    // Tenta logout na API em background (não bloqueia)
    logoutMutation.mutate(undefined, {
      onError: () => {
        // Erros são suprimidos no hook, mas garantimos que não bloqueiam
      },
    });

    // Redireciona imediatamente
    router.push('/auth/login');
  }, [router, clearUser, logoutMutation]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Saindo...</p>
    </div>
  );
}
