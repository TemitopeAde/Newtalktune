import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        // Additional checks for admin routes
        if (pathname.startsWith("/admin") && token) {
            // You can add role-based checks here if needed
            // For example: if (token.role !== 'admin') { redirect to unauthorized }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Public routes that don't require authentication
                const publicRoutes = [
                    "/",
                    "/auth/login",
                    "/auth/register",
                    "/auth/forgot-password",
                    "/auth/reset-password",
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
                    return true;
                }

                // Allow API auth routes
                if (pathname.startsWith("/api/auth")) {
                    return true;
                }

                // Check if user is trying to access dashboard or admin routes
                const isDashboardRoute = pathname.startsWith("/dashboard");
                const isAdminRoute = pathname.startsWith("/admin");

                // Require authentication for dashboard and admin routes
                // If no token (not logged in), user will be redirected to login
                if (isDashboardRoute || isAdminRoute) {
                    return !!token;
                }

                // For all other routes, allow access
                return true;
            },
        },
        pages: {
            signIn: "/auth/login",
        },
    }
);

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
