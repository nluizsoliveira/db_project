import { apiGet } from "@/lib/api";

const API_BASE_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"
    : "http://flask_app:5050";

export interface User {
  user_id: string;
  email: string;
  nome: string;
  roles: {
    admin?: boolean;
    staff?: boolean;
    internal?: boolean;
    external?: boolean;
  };
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

let currentUserCache: User | null = null;
let userCachePromise: Promise<User | null> | null = null;

/**
 * Get current user information from session.
 * Uses caching to avoid multiple API calls.
 */
export async function getCurrentUser(): Promise<User | null> {
  // Return cached user if available
  if (currentUserCache) {
    return currentUserCache;
  }

  // Return existing promise if already fetching
  if (userCachePromise) {
    return userCachePromise;
  }

  // Fetch user data
  userCachePromise = (async () => {
    try {
      // Use direct fetch to avoid throwing errors for authentication failures
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // If not authenticated, silently return null (no error)
      if (!response.ok) {
        // 401/403 means user is not authenticated - this is expected
        if (response.status === 401 || response.status === 403) {
          return null;
        }
        // Other errors should be logged
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching current user:", errorData.message || `HTTP error! status: ${response.status}`);
        return null;
      }

      const data = await response.json() as AuthResponse;
      if (data.success && data.user) {
        currentUserCache = data.user;
        return data.user;
      }
      return null;
    } catch (error) {
      // Network errors or other unexpected errors
      console.error("Error fetching current user:", error);
      return null;
    } finally {
      userCachePromise = null;
    }
  })();

  return userCachePromise;
}

/**
 * Clear the user cache (useful after logout).
 */
export function clearUserCache(): void {
  currentUserCache = null;
  userCachePromise = null;
}

/**
 * Check if user has a specific role.
 */
export function hasRole(
  user: User | null,
  role: "admin" | "staff" | "internal" | "external"
): boolean {
  if (!user || !user.roles) {
    return false;
  }
  return user.roles[role] === true;
}

/**
 * Check if user has any of the specified roles.
 */
export function hasAnyRole(
  user: User | null,
  roles: Array<"admin" | "staff" | "internal" | "external"> | undefined
): boolean {
  if (!user || !user.roles || !roles || roles.length === 0) {
    return false;
  }
  return roles.some((role) => user.roles[role] === true);
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated(user: User | null): boolean {
  return user !== null && user.user_id !== undefined;
}
