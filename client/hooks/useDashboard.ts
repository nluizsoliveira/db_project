import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface Stat {
  label: string;
  value: string | number;
  description: string;
}

export interface Reservation {
  installation_name: string;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
  responsible_name: string;
  next_reservation_date: string | null;
  next_reservation_time: string | null;
}

export interface Activity {
  nome_atividade: string;
  weekday: string;
  horario_inicio: string;
  horario_fim: string;
  grupo_extensao: string | null;
  vagas_ocupadas: number;
  vagas_limite: number;
  occupancy_rate: number;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        stats: Stat[];
        upcoming_reservations: Reservation[];
        activity_enrollment: Activity[];
      }>('/admin/');
      if (!data.success) throw new Error('Failed to fetch dashboard data');
      return {
        stats: data.stats || [],
        upcomingReservations: data.upcoming_reservations || [],
        activityEnrollment: data.activity_enrollment || [],
      };
    },
  });
}

export function useReportsOverview() {
  return useQuery({
    queryKey: ['reports', 'overview'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        data: any;
      }>('/reports/overview');
      if (!data.success) throw new Error('Failed to fetch reports');
      return data.data;
    },
  });
}
