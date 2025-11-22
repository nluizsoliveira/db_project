import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

export interface Participant {
  id_participante?: number;
  nome?: string;
  email?: string;
  id_atividade?: number;
  nome_atividade?: string;
}

export function useActivityParticipants(activityId: number) {
  return useQuery({
    queryKey: ['staff', 'activities', activityId, 'participants'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        participants: Participant[];
      }>(`/staff/activities/${activityId}/participants`);
      if (!data.success) throw new Error('Failed to fetch participants');
      return data.participants || [];
    },
    enabled: !!activityId,
  });
}

export function useAddParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      activityId,
      payload,
    }: {
      activityId: number;
      payload: { email: string; nome?: string };
    }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>(`/staff/activities/${activityId}/participants`, payload);
      if (!data.success) throw new Error(data.message || 'Failed to add participant');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['staff', 'activities', variables.activityId, 'participants'],
      });
    },
  });
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      activityId,
      participantId,
    }: {
      activityId: number;
      participantId: number;
    }) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/staff/activities/${activityId}/participants/${participantId}`);
      if (!data.success) throw new Error(data.message || 'Failed to remove participant');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['staff', 'activities', variables.activityId, 'participants'],
      });
    },
  });
}

export function useParticipants() {
  return useQuery({
    queryKey: ['staff', 'participants'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        participants: Participant[];
      }>('/staff/participants');
      if (!data.success) throw new Error('Failed to fetch participants');
      return data.participants || [];
    },
  });
}
