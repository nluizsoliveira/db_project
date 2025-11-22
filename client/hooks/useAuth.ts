import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/utils';

const API_BASE_URL = getApiBaseUrl();

export interface User {
  user_id: string;
  email: string;
  nome: string;
  roles: {
    admin?: boolean;
    staff?: boolean;
    internal?: boolean;
    external?: boolean;
  };
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return null;
          }
          const errorData = await response.json().catch(() => ({}));
          console.error('Error fetching current user:', errorData.message || `HTTP error! status: ${response.status}`);
          return null;
        }

        const data = (await response.json()) as AuthResponse;
        if (data.success && data.user) {
          return data.user;
        }
        return null;
      } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const data = await apiPost<AuthResponse>('/auth/login', payload);
      if (!data.success) throw new Error(data.message || 'Failed to login');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiGet('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      nome: string;
      token?: string;
    }) => {
      const data = await apiPost<AuthResponse>('/auth/register', payload);
      if (!data.success) throw new Error(data.message || 'Failed to register');
      return data;
    },
  });
}

export function usePendingRegistrations() {
  return useQuery({
    queryKey: ['auth', 'pending-registrations'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        registrations: Array<{
          email: string;
          nome: string;
          data_convite: string;
        }>;
      }>('/auth/pending-registrations');
      if (!data.success) throw new Error('Failed to fetch pending registrations');
      return data.registrations || [];
    },
  });
}

export function useApproveRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/auth/approve-registration', { email });
      if (!data.success) throw new Error(data.message || 'Failed to approve registration');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'pending-registrations'] });
    },
  });
}

export function useRejectRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/auth/reject-registration', { email });
      if (!data.success) throw new Error(data.message || 'Failed to reject registration');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'pending-registrations'] });
    },
  });
}
