'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';

export default function AuthInitializer() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return null;
}

