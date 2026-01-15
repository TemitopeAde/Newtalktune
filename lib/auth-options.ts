import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) {
                return false;
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });

            if (existingUser) {
                // If user exists but signed up with email/password, link the OAuth account
                if (account) {
                    const existingAccount = await prisma.account.findUnique({
                        where: {
                            provider_providerAccountId: {
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                            },
                        },
                    });

                    if (!existingAccount) {
                        await prisma.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                access_token: account.access_token,
                                refresh_token: account.refresh_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                session_state: account.session_state,
                            },
                        });
                    }
                }
            } else {
                // Create new user for OAuth sign-in
                // The adapter will handle this automatically
            }

            return true;
        },
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;

                // Fetch additional user data from database
                const dbUser = await prisma.user.findUnique({
                    where: { id: parseInt(user.id) },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        subscriptionPlan: true,
                        isVerified: true,
                    },
                });

                if (dbUser) {
                    session.user.role = dbUser.role;
                    session.user.subscriptionPlan = dbUser.subscriptionPlan;
                    session.user.isVerified = dbUser.isVerified;

                    // Generate JWT token for OAuth users to maintain consistency
                    const token = generateToken({
                        userId: dbUser.id,
                        email: dbUser.email,
                    });

                    // Set the JWT token as a cookie
                    const cookieStore = await cookies();
                    cookieStore.set('auth-token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 7 * 24 * 60 * 60, // 7 days
                        path: '/',
                    });
                }
            }
            return session;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};