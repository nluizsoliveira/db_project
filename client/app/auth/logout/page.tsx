'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { apiGet } from '@/lib/api';

export default function LogoutPage() {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const logout = async () => {
      try {
        await apiGet('/auth/logout');
      } catch (err) {
        console.error('Erro ao fazer logout:', err);
      } finally {
        clearUser();
        router.push('/auth/login');
      }
    };

    logout();
  }, [router, clearUser]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Saindo...</p>
    </div>
  );
}
