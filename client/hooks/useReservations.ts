import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export interface Reservation {
  id_reserva?: number;
  installation_name?: string;
  data_reserva?: string;
  horario_inicio?: string;
  horario_fim?: string;
  responsible_name?: string;
  id_instalacao?: number;
  id_equipamento?: number;
  motivo?: string;
}

// Staff hooks
export function useInstallationReservations() {
  return useQuery({
    queryKey: ['staff', 'installation-reservations'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        reservations: Reservation[];
      }>('/staff/installations/reservations');
      if (!data.success) throw new Error('Failed to fetch reservations');
      return data.reservations || [];
    },
  });
}

export function useDeleteInstallationReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reservationId: number) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/staff/installations/reservations/${reservationId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete reservation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'installation-reservations'] });
    },
  });
}

export function useEquipmentReservations() {
  return useQuery({
    queryKey: ['staff', 'equipment-reservations'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        reservations: Reservation[];
      }>('/staff/equipment/reservations');
      if (!data.success) throw new Error('Failed to fetch reservations');
      return data.reservations || [];
    },
  });
}

export function useDeleteEquipmentReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reservationId: number) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/staff/equipment/reservations/${reservationId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete reservation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'equipment-reservations'] });
    },
  });
}

// Internal hooks
export function useInternalReservations() {
  return useQuery({
    queryKey: ['internal', 'reservations'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        reservations: Reservation[];
      }>('/internal/reservations');
      if (!data.success) throw new Error('Failed to fetch reservations');
      return data.reservations || [];
    },
  });
}

export function useCreateReservation() {
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
      }>('/internal/reservations', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create reservation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'reservations'] });
    },
  });
}

export function useCreateInstallationReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id_instalacao: number;
      data: string;
      hora_inicio: string;
      hora_fim: string;
    }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/internal/reservations/installation', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create reservation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'reservations'] });
    },
  });
}

export function useCreateEquipmentReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id_equipamento: string;
      data: string;
      hora_inicio: string;
      hora_fim: string;
    }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/internal/reservations/equipment', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create reservation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'reservations'] });
    },
  });
}

export function useAvailableInstallations(date?: string, start?: string, end?: string) {
  return useQuery({
    queryKey: ['internal', 'available-installations', date, start, end],
    queryFn: async () => {
      if (!date || !start || !end) return [];
      const params = new URLSearchParams();
      params.append('date', date);
      params.append('start', start);
      params.append('end', end);
      const data = await apiGet<{
        success: boolean;
        available_installs: Array<{ id_instalacao: number; nome: string; tipo: string; capacidade: number }>;
      }>(`/internal/?${params.toString()}`);
      if (!data.success) throw new Error('Failed to fetch available installations');
      return data.available_installs || [];
    },
    enabled: !!date && !!start && !!end,
  });
}

export function useDeleteInternalInstallationReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reservationId: number) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/internal/reservations/installation/${reservationId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete reservation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal'] });
    },
  });
}

export function useDeleteInternalEquipmentReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reservationId: number) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/internal/reservations/equipment/${reservationId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete reservation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal'] });
    },
  });
}

export function useReservationFormData() {
  const installations = useQuery({
    queryKey: ['internal', 'installations'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        installations: Array<{ id_instalacao: number; nome: string }>;
      }>('/internal/installations');
      if (!data.success) throw new Error('Failed to fetch installations');
      return data.installations || [];
    },
  });

  const equipment = useQuery({
    queryKey: ['internal', 'equipment'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        equipment: Array<{ id_equipamento: number; nome: string }>;
      }>('/internal/equipment');
      if (!data.success) throw new Error('Failed to fetch equipment');
      return data.equipment || [];
    },
  });

  return { installations, equipment };
}
