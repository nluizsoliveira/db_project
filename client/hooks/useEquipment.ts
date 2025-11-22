import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export interface Equipment {
  id_equipamento: number;
  nome: string;
  tipo?: string;
  quantidade_disponivel?: number;
  quantidade_total?: number;
}

export function useEquipment() {
  return useQuery({
    queryKey: ['admin', 'equipment'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        equipment: Equipment[];
      }>('/admin/equipment');
      if (!data.success) throw new Error('Failed to fetch equipment');
      return data.equipment || [];
    },
  });
}

export function useEquipmentItem(equipmentId: number) {
  return useQuery({
    queryKey: ['admin', 'equipment', equipmentId],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        equipment: Equipment;
      }>(`/admin/equipment/${equipmentId}`);
      if (!data.success || !data.equipment) throw new Error('Failed to fetch equipment');
      return data.equipment;
    },
    enabled: !!equipmentId,
  });
}

export function useEquipmentTypes() {
  return useQuery({
    queryKey: ['admin', 'equipment', 'types'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        types: string[];
      }>('/admin/equipment/types');
      if (!data.success) throw new Error('Failed to fetch equipment types');
      return data.types || [];
    },
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nome: string; tipo?: string; quantidade_total?: number }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/admin/equipment', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create equipment');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'equipment'] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      equipmentId,
      payload,
    }: {
      equipmentId: number;
      payload: { nome?: string; tipo?: string; quantidade_total?: number };
    }) => {
      const data = await apiPut<{
        success: boolean;
        message?: string;
      }>(`/admin/equipment/${equipmentId}`, payload);
      if (!data.success) throw new Error(data.message || 'Failed to update equipment');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'equipment', variables.equipmentId] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (equipmentId: number) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/equipment/${equipmentId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete equipment');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'equipment'] });
    },
  });
}
