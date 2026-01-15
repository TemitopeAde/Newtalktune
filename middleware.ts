import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = [
        "/",
        "/auth/login",
        "/auth/register",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/auth/verify",
        "/blogs",
        "/contact",
        "/pricing",
        "/collaboration-demo"
    ];

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Allow access to public routes without authentication
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Allow API auth routes
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // Allow other API routes (they handle their own auth)
    if (pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // Check if user is trying to access protected routes
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isAdminRoute = pathname.startsWith("/admin");

    if (isDashboardRoute || isAdminRoute) {
        // Check for custom auth-token cookie (email/password login)
        const authToken = req.cookies.get("auth-token")?.value;

        // Check for NextAuth session cookie (OAuth login - database sessions)
        // Cookie name varies: 'next-auth.session-token' (dev) or '__Secure-next-auth.session-token' (prod)
        const nextAuthSessionToken =
            req.cookies.get("next-auth.session-token")?.value ||
            req.cookies.get("__Secure-next-auth.session-token")?.value;

        // Allow if either auth method is present
        if (authToken || nextAuthSessionToken) {
            return NextResponse.next();
        }

        // Not authenticated - redirect to login
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // For all other routes, allow access
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ],
};
