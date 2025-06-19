import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";
import { getRoleBasedDashboard } from "./role-redirect";

// Define UserRole enum manually since it's not being exported from generated client
export enum UserRole {
    NORMAL_USER = "NORMAL_USER",
    PARENT_GUARDIAN = "PARENT_GUARDIAN",
    THERAPIST = "THERAPIST",
    MANAGER = "MANAGER",
    ADMIN = "ADMIN"
}

export const authOptions: any = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }: { user: User | AdapterUser; account: any; profile?: any }) {
            console.log("SignIn callback:", {
                provider: account?.provider,
                email: user?.email,
                userId: user?.id
            });

            // Allow all sign-ins
            return true;
        },
        async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
            console.log("Redirect callback:", { url, baseUrl });

            // Always allow relative URLs
            if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            }

            // If it's our domain
            if (url.startsWith(baseUrl)) {
                return url;
            }

            // For OAuth callback completion, redirect to dashboard
            // The middleware will handle routing based on user role
            return `${baseUrl}/dashboard`;
        },
        async jwt({ token, user, account }: { token: JWT; user?: User | AdapterUser; account?: any }) {
            console.log("=== JWT CALLBACK START ===");
            console.log("JWT callback:", {
                hasUser: !!user,
                provider: account?.provider,
                email: (token as any).email,
                existingRole: token.role,
                userObject: user ? { id: user.id, email: user.email, name: user.name } : null
            });

            // If this is the first time (user object exists), it means user just signed in
            if (user) {
                console.log("First time sign in, processing user...");
                // For OAuth users, fetch the role from database since adapter might not include it
                if (account?.provider === "google") {
                    try {
                        console.log("Google OAuth user, querying database...");
                        const dbUser = await prisma.user.findUnique({
                            where: { email: user.email! }
                        });
                        console.log("DB query result:", {
                            found: !!dbUser,
                            role: dbUser?.role,
                            id: dbUser?.id
                        });
                        // For Google OAuth users, use the role from database or default to NORMAL_USER
                        (token as any).role = (dbUser?.role as any) || UserRole.NORMAL_USER;
                        console.log("Set token role to:", (token as any).role);
                    } catch (error) {
                        console.error("Database error in JWT callback:", error);
                        (token as any).role = UserRole.NORMAL_USER;
                    }
                } else {
                    // For credentials, the role should already be in the user object
                    token.role = (user as any).role || UserRole.NORMAL_USER;
                    console.log("Credentials login, role:", token.role);
                }
            }

            // If no role in token, try to fetch from database
            if (!token.role && (token as any).email) {
                console.log("No role in token, fetching from database...");
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: (token as any).email }
                    });
                    (token as any).role = (dbUser?.role as any) || UserRole.NORMAL_USER;
                    console.log("Fetched role from DB:", (token as any).role);
                } catch (error) {
                    console.error("Error fetching user role in JWT:", error);
                    (token as any).role = UserRole.NORMAL_USER;
                }
            }

            console.log("JWT final result:", {
                role: token.role,
                email: (token as any).email,
                sub: (token as any).sub
            });
            console.log("=== JWT CALLBACK END ===");
            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            console.log("=== SESSION CALLBACK START ===");
            console.log("Session callback:", {
                hasToken: !!token,
                tokenRole: token.role,
                tokenEmail: (token as any).email,
                sessionUser: session?.user?.email,
                tokenSub: (token as any).sub
            });

            if (token && session.user) {
                session.user.id = (token as any).sub!;
                session.user.role = token.role as UserRole;
                console.log("Session updated:", {
                    userId: session.user.id,
                    userRole: session.user.role,
                    userEmail: session.user.email
                });
            } else {
                console.log("Missing token or session.user:", {
                    hasToken: !!token,
                    hasSessionUser: !!session?.user
                });
            }

            console.log("Final session object:", session);
            console.log("=== SESSION CALLBACK END ===");

            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};

