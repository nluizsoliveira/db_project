import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

export interface ExtensionGroup {
  nome_grupo: string;
  descricao: string;
  cpf_responsavel_interno: string;
  nome_responsavel: string;
}

export function useExtensionGroups() {
  return useQuery({
    queryKey: ['admin', 'extension-groups'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        groups: ExtensionGroup[];
      }>('/extension_group/');
      if (!data.success) throw new Error('Failed to fetch extension groups');
      return data.groups || [];
    },
  });
}

export function useCreateExtensionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      group_name: string;
      description: string;
      cpf_responsible: string;
    }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/extension_group/create', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create extension group');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'extension-groups'] });
    },
  });
}

export function useUpdateExtensionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      old_group_name: string;
      new_group_name: string;
      description: string;
      cpf_responsible: string;
    }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/extension_group/update', payload);
      if (!data.success) throw new Error(data.message || 'Failed to update extension group');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'extension-groups'] });
    },
  });
}

export function useDeleteExtensionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupName: string) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>('/extension_group/delete', { group_name: groupName });
      if (!data.success) throw new Error(data.message || 'Failed to delete extension group');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'extension-groups'] });
    },
  });
}
