import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export interface Activity {
  id_atividade: number;
  nome_atividade: string;
  grupo_extensao: string | null;
  weekday: string;
  horario_inicio: string;
  horario_fim: string;
  vagas_ocupadas: number;
  vagas_limite: number;
  is_enrolled?: boolean;
}

export interface ActivityDetail {
  id_atividade: number;
  nome: string;
  vagas_limite: number;
  data_inicio_periodo: string;
  data_fim_periodo: string;
}

// Admin hooks
export function useAdminActivities() {
  return useQuery({
    queryKey: ['admin', 'activities'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        activities: Activity[];
      }>('/admin/activities');
      if (!data.success) throw new Error('Failed to fetch activities');
      return data.activities || [];
    },
  });
}

export function useAdminActivity(activityId: number) {
  return useQuery({
    queryKey: ['admin', 'activities', activityId],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        activity: ActivityDetail;
      }>(`/admin/activities/${activityId}`);
      if (!data.success || !data.activity) throw new Error('Failed to fetch activity');
      return data.activity;
    },
    enabled: !!activityId,
  });
}

export function useCreateAdminActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      nome: string;
      vagas: number;
      data_inicio: string;
      data_fim: string;
    }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/admin/activities', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create activity');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
    },
  });
}

export function useUpdateAdminActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      activityId,
      payload,
    }: {
      activityId: number;
      payload: { nome: string; vagas: number };
    }) => {
      const data = await apiPut<{
        success: boolean;
        message?: string;
      }>(`/admin/activities/${activityId}`, payload);
      if (!data.success) throw new Error(data.message || 'Failed to update activity');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities', variables.activityId] });
    },
  });
}

export function useDeleteAdminActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activityId: number) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/activities/${activityId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete activity');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
    },
  });
}

// Internal hooks
export function useInternalActivities(filters?: {
  weekday?: string;
  group_name?: string;
  modality?: string;
}) {
  return useQuery({
    queryKey: ['internal', 'activities', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.weekday) params.append('weekday', filters.weekday);
      if (filters?.group_name) params.append('group_name', filters.group_name);
      if (filters?.modality) params.append('modality', filters.modality);

      const data = await apiGet<{
        success: boolean;
        activities: Activity[];
      }>(`/internal/activities?${params.toString()}`);
      if (!data.success) throw new Error('Failed to fetch activities');
      return data.activities || [];
    },
  });
}

export function useEnrollActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activityId: number) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/internal/activities/enroll', { id_atividade: activityId });
      if (!data.success) throw new Error(data.message || 'Failed to enroll');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'activities'] });
    },
  });
}

// Staff hooks
export function useStaffActivities() {
  return useQuery({
    queryKey: ['staff', 'activities'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        activities: Activity[];
      }>('/staff/activities');
      if (!data.success) throw new Error('Failed to fetch activities');
      return data.activities || [];
    },
  });
}
