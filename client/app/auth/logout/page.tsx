'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { useLogout } from '@/hooks/useAuth';

export default function LogoutPage() {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);
  const logoutMutation = useLogout();

  useEffect(() => {
    const logout = async () => {
      try {
        await logoutMutation.mutateAsync();
      } catch (err) {
        console.error('Erro ao fazer logout:', err);
      } finally {
        clearUser();
        router.push('/auth/login');
      }
    };

    logout();
  }, [router, clearUser, logoutMutation]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Saindo...</p>
    </div>
  );
}
