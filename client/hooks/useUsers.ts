import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export interface User {
  user_id: string;
  email: string;
  nome: string;
  roles?: {
    admin?: boolean;
    staff?: boolean;
    internal?: boolean;
    external?: boolean;
  };
}

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        users: User[];
      }>("/admin/users");
      if (!data.success) throw new Error("Failed to fetch users");
      return data.users || [];
    },
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: async () => {
      const data = await apiGet<{
        success: boolean;
        user: User;
      }>(`/admin/users/${userId}`);
      if (!data.success || !data.user) throw new Error("Failed to fetch user");
      return data.user;
    },
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      nome: string;
      password: string;
      roles: string[];
    }) => {
      const data = await apiPost<{
        success: boolean;
        message?: string;
      }>("/admin/users", payload);
      if (!data.success)
        throw new Error(data.message || "Failed to create user");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: { nome?: string; roles?: string[] };
    }) => {
      const data = await apiPut<{
        success: boolean;
        message?: string;
      }>(`/admin/users/${userId}`, payload);
      if (!data.success)
        throw new Error(data.message || "Failed to update user");
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "users", variables.userId],
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const data = await apiDelete<{
        success: boolean;
        message?: string;
      }>(`/admin/users/${userId}`);
      if (!data.success)
        throw new Error(data.message || "Failed to delete user");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
