import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

export interface Invite {
  id_convite: number;
  status: string;
  nome_convidado: string;
  documento_convidado: string;
  email_convidado: string | null;
  telefone_convidado: string | null;
  id_atividade: number | null;
  data_convite: string;
  data_resposta: string | null;
  observacoes: string | null;
  token: string;
  atividade_nome: string | null;
  atividade_data_inicio: string | null;
  atividade_data_fim: string | null;
  atividade_vagas_limite: number | null;
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

export interface CreateInvitePayload {
  documento_convidado: string;
  nome_convidado: string;
  email_convidado?: string;
  telefone_convidado?: string;
  id_atividade?: string | number;
  observacoes?: string;
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInvitePayload) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
        invite?: {
          id_convite: number;
          token: string;
          status: string;
        };
      }>('/internal/invites', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create invite');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'invites'] });
    },
  });
}

export function useDeleteInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteId: number) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/internal/invites/${inviteId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete invite');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'invites'] });
    },
  });
}
