import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/login/external",
  "/auth/register",
  "/auth/logout",
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.match(
      /\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/
    ) // Allow static assets
  ) {
    return NextResponse.next();
  }

  // Check for session cookie (Flask default session cookie name)
  const sessionCookie = request.cookies.get("session");

  // If no session cookie, redirect to login
  if (!sessionCookie || !sessionCookie.value) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the session is valid by calling /auth/me
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If session is invalid (401/403) or any error, redirect to login
    if (!response.ok) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, allow access
    return NextResponse.next();
  } catch (error) {
    // If there's an error checking auth (network, timeout, etc),
    // allow access but let ProtectedRoute handle it on client side
    // This prevents blocking users if there's a temporary backend issue
    console.error("Error checking authentication in middleware:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
