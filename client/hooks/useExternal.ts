import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

export function useExternalDashboard() {
  return useQuery({
    queryKey: ['external', 'dashboard'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        data: any;
      }>('/external/dashboard');
      if (!data.success) throw new Error('Failed to fetch dashboard data');
      return data.data;
    },
  });
}

export function useExternalActivityEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activityId: number) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/external/activities/enroll', { id_atividade: activityId });
      if (!data.success) throw new Error(data.message || 'Failed to enroll');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external', 'dashboard'] });
    },
  });
}

export function useExternalReservationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id_instalacao?: number;
      id_equipamento?: number;
      data_reserva: string;
      horario_inicio: string;
      horario_fim: string;
      motivo: string;
    }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/external/reservations/request', payload);
      if (!data.success) throw new Error(data.message || 'Failed to request reservation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external', 'dashboard'] });
    },
  });
}
