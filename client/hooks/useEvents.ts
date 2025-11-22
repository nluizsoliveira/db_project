import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export interface Event {
  id_evento: number;
  nome: string;
  data_inicio?: string;
  data_fim?: string;
  descricao?: string;
}

export function useEvents() {
  return useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        events: Event[];
      }>('/admin/events');
      if (!data.success) throw new Error('Failed to fetch events');
      return data.events || [];
    },
  });
}

export function useEvent(eventId: number) {
  return useQuery({
    queryKey: ['admin', 'events', eventId],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        event: Event;
      }>(`/admin/events/${eventId}`);
      if (!data.success || !data.event) throw new Error('Failed to fetch event');
      return data.event;
    },
    enabled: !!eventId,
  });
}

export function useEventTypes() {
  return useQuery({
    queryKey: ['admin', 'events', 'types'],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        types: string[];
      }>('/admin/events/types');
      if (!data.success) throw new Error('Failed to fetch event types');
      return data.types || [];
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      nome: string;
      data_inicio?: string;
      data_fim?: string;
      descricao?: string;
    }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>('/admin/events', payload);
      if (!data.success) throw new Error(data.message || 'Failed to create event');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      payload,
    }: {
      eventId: number;
      payload: { nome?: string; data_inicio?: string; data_fim?: string; descricao?: string };
    }) => {
      const data = await apiPut<{
        success: boolean;
        message?: string;
      }>(`/admin/events/${eventId}`, payload);
      if (!data.success) throw new Error(data.message || 'Failed to update event');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', variables.eventId] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: number) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/events/${eventId}`);
      if (!data.success) throw new Error(data.message || 'Failed to delete event');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}
