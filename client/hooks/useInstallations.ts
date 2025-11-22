import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export interface Installation {
  id_instalacao: number;
  nome: string;
  capacidade?: number;
  tipo?: string;
}

export function useInstallations() {
  return useQuery({
    queryKey: ['admin', 'installations'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        installations: Installation[];
      }>('/admin/installations');
      if (!data.success) throw new Error('Failed to fetch installations');
      return data.installations || [];
    },
  });
}

export function useInstallation(installationId: number) {
  return useQuery({
    queryKey: ['admin', 'installations', installationId],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        installation: Installation;
      }>(`/admin/installations/${installationId}`);
      if (!data.success || !data.installation) throw new Error('Failed to fetch installation');
      return data.installation;
    },
    enabled: !!installationId,
  });
}

export function useCreateInstallation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nome: string; capacidade?: number; tipo?: string }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/admin/installations', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create installation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'installations'] });
    },
  });
}

export function useUpdateInstallation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      installationId,
      payload,
    }: {
      installationId: number;
      payload: { nome?: string; capacidade?: number; tipo?: string };
    }) => {
      const data = await apiPut<{
        success: boolean;
        message?: string;
      }>(`/admin/installations/${installationId}`, payload);
      if (!data.success) throw new Error(data.message || 'Failed to update installation');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'installations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'installations', variables.installationId] });
    },
  });
}

export function useDeleteInstallation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (installationId: number) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/installations/${installationId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete installation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'installations'] });
    },
  });
}
