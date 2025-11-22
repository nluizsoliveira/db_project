"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  useAuthUser,
  useAuthLoading,
  useAuthInitialized,
  useAuthStore,
} from "@/lib/authStore";
import { hasAnyRole } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<"admin" | "staff" | "internal" | "external">;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthUser();
  const loading = useAuthLoading();
  const initialized = useAuthInitialized();
  const loadUser = useAuthStore((state) => state.loadUser);

  const authorized = useMemo(() => {
    if (!initialized || loading || !user) {
      return false;
    }
    return hasAnyRole(user, allowedRoles);
  }, [user, loading, initialized, allowedRoles]);

  useEffect(() => {
    // Tenta carregar o usuário se ainda não foi inicializado
    if (!initialized && !loading) {
      loadUser();
      return;
    }

    if (!initialized || loading) {
      return;
    }

    if (!user) {
      // Not authenticated, redirect to appropriate login with current path as redirect
      if (allowedRoles.includes("external")) {
        router.push(`/auth/login/external?redirect=${encodeURIComponent(pathname)}`);
      } else {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
      return;
    }

    if (!authorized) {
      // User doesn't have required role, redirect to their dashboard
      if (user.roles.admin) {
        router.push("/admin/dashboard");
      } else if (user.roles.staff) {
        router.push("/staff/dashboard");
      } else if (user.roles.internal) {
        router.push("/internal/dashboard");
      } else if (user.roles.external) {
        router.push("/external/dashboard");
      } else {
        router.push(redirectTo || "/auth/login");
      }
    }
  }, [
    router,
    allowedRoles,
    redirectTo,
    user,
    loading,
    initialized,
    authorized,
    loadUser,
  ]);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1094ab] border-r-transparent"></div>
          <p className="text-sm text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
