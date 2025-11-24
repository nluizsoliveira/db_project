import { create } from "zustand";
import { useMemo } from "react";
import { getCurrentUser, clearUserCache, User } from "./auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  loadUser: () => Promise<void>;
  clearUser: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  loadUser: async () => {
    // Evita carregar múltiplas vezes se já foi inicializado e não está carregando
    if (get().initialized && !get().loading) {
      return;
    }

    // Evita múltiplas chamadas simultâneas
    if (get().loading) {
      return;
    }

    set({ loading: true });
    try {
      const user = await getCurrentUser();
      set({ user, loading: false, initialized: true });
    } catch (error) {
      // getCurrentUser should not throw errors for auth failures anymore,
      // but if it does for unexpected reasons, handle it gracefully
      console.error("Unexpected error loading user:", error);
      set({ user: null, loading: false, initialized: true });
    }
  },

  clearUser: () => {
    clearUserCache();
    // Mantém initialized como true para evitar que AuthInitializer tente carregar novamente
    // O user sendo null já indica que não está autenticado
    set({ user: null, initialized: true, loading: false });
  },

  refreshUser: async () => {
    set({ loading: true });
    try {
      // Limpa o cache antes de recarregar
      clearUserCache();
      const user = await getCurrentUser();
      set({ user, loading: false, initialized: true });
    } catch (error) {
      // getCurrentUser should not throw errors for auth failures anymore,
      // but if it does for unexpected reasons, handle it gracefully
      console.error("Unexpected error refreshing user:", error);
      set({ user: null, loading: false, initialized: true });
    }
  },
}));

// Seletores otimizados para evitar múltiplas subscrições
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthInitialized = () =>
  useAuthStore((state) => state.initialized);

// Seletor combinado com useMemo para estabilizar o objeto e evitar problemas de hidratação
export const useAuthState = () => {
  const user = useAuthUser();
  const loading = useAuthLoading();
  const initialized = useAuthInitialized();

  return useMemo(
    () => ({
      user,
      loading,
      initialized,
    }),
    [user, loading, initialized]
  );
};
