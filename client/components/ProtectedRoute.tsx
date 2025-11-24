"use client";

import { useEffect, useMemo, useRef } from "react";
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
  const hasRedirectedRef = useRef<string | null>(null);
  const loadUserCalledRef = useRef(false);

  const authorized = useMemo(() => {
    if (!initialized || loading || !user) {
      return false;
    }
    return hasAnyRole(user, allowedRoles);
  }, [user, loading, initialized, allowedRoles]);

  // Reset refs when pathname changes
  useEffect(() => {
    if (hasRedirectedRef.current !== pathname) {
      hasRedirectedRef.current = null;
      loadUserCalledRef.current = false;
    }
  }, [pathname]);

  // Handle loading user
  useEffect(() => {
    if (!initialized && !loading && !loadUserCalledRef.current) {
      loadUserCalledRef.current = true;
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, loading]);

  // Handle redirects after initialization
  useEffect(() => {
    // Wait for initialization
    if (!initialized || loading) {
      return;
    }

    // Prevent multiple redirects to the same path
    if (hasRedirectedRef.current === pathname) {
      return;
    }

    // Not authenticated - redirect to login
    if (!user) {
      hasRedirectedRef.current = pathname;
      if (allowedRoles.includes("external")) {
        router.push(`/auth/login/external?redirect=${encodeURIComponent(pathname)}`);
      } else {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
      return;
    }

    // User doesn't have required role - redirect to their dashboard
    if (!authorized) {
      hasRedirectedRef.current = pathname;
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
      return;
    }

    // User is authorized - clear redirect ref
    hasRedirectedRef.current = null;
  }, [
    initialized,
    loading,
    user,
    authorized,
    router,
    pathname,
    allowedRoles,
    redirectTo,
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
