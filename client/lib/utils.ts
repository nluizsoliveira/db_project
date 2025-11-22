import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the API base URL from environment variables.
 * NEXT_PUBLIC_API_URL must be set in .env file (committed to repo).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use NEXT_PUBLIC_API_URL from environment
    // This must be set via .env file (committed to repo)
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_API_URL is not set. Please check your .env file. " +
        "The .env file should be committed to the repository."
      );
    }
    return url;
  } else {
    // Server-side: use flask_app hostname in Docker, otherwise NEXT_PUBLIC_API_URL
    // flask_app is the service name in docker-compose.yml
    return process.env.NEXT_PUBLIC_API_URL || "http://flask_app:5050";
  }
}
