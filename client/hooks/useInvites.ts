import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

export interface Invite {
  id_convite?: number;
  email: string;
  nome?: string;
  status?: string;
  data_convite?: string;
}

export function useInvites() {
  return useQuery({
    queryKey: ['internal', 'invites'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        invites: Invite[];
      }>('/internal/invites');
      if (!data.success) throw new Error('Failed to fetch invites');
      return data.invites || [];
    },
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; nome?: string }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/internal/invites', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create invite');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'invites'] });
    },
  });
}
