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
                isNewUser: account?.type === "oauth"
            });

            // For Google OAuth users, check if they need role assignment
            if (account?.provider === "google") {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                        select: { role: true }
                    });

                    console.log("User role check:", { email: user.email, role: dbUser?.role });

                    // If user doesn't have a role, they'll be redirected by middleware
                    return true;
                } catch (error) {
                    console.error("Error checking user role:", error);
                    return false;
                }
            }

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

            // For OAuth callback completion (when url is just baseUrl), redirect to dashboard
            // The middleware will then handle routing based on user role
            if (url === baseUrl || url === `${baseUrl}/`) {
                return `${baseUrl}/dashboard`;
            }

            // For external URLs or unmatched cases, redirect to dashboard
            return `${baseUrl}/dashboard`;
        },
        async jwt({ token, user, account }: { token: JWT; user?: User | AdapterUser; account?: any }) {
            console.log("JWT callback:", {
                hasUser: !!user,
                provider: account?.provider,
                email: (token as any).email,
                existingRole: token.role
            });

            // If this is the first time (user object exists), it means user just signed in
            if (user) {
                // For OAuth users, fetch the role from database since adapter might not include it
                if (account?.provider === "google") {
                    try {
                        const dbUser = await prisma.user.findUnique({
                            where: { email: user.email! }
                        });
                        console.log("DB user role:", dbUser?.role);
                        // Don't set a default role for Google OAuth users - let them choose
                        (token as any).role = (dbUser?.role as any) || null;
                    } catch (error) {
                        console.error("Error fetching user role in JWT:", error);
                        (token as any).role = null;
                    }
                } else {
                    // For credentials, the role should already be in the user object
                    token.role = (user as any).role || UserRole.NORMAL_USER;
                }
            }

            // If no role in token, try to fetch from database
            if (!token.role && (token as any).email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: (token as any).email }
                    });
                    (token as any).role = (dbUser?.role as any) || null;
                } catch (error) {
                    console.error("Error fetching user role in JWT:", error);
                }
            }

            console.log("JWT final role:", token.role);
            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            if (token && session.user) {
                session.user.id = (token as any).sub!;
                session.user.role = token.role as UserRole;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        signUp: "/signup",
    },
    // Enable account linking - allows linking OAuth accounts to existing email accounts
    // This resolves the OAuthAccountNotLinked error
    events: {
        async linkAccount({ user, account, profile }: { user: any; account: any; profile?: any }) {
            // For Google OAuth, don't set a default role - let user choose on confirm-role page
            if (account.provider === "google") {
                // The user will be redirected to /confirm-role to set their role
                console.log("Google OAuth user linked, role will be set via confirm-role page");
            }
        },
        async signIn({ user, account, profile, isNewUser }: { user: any; account: any; profile?: any; isNewUser?: boolean }) {
            return true;
        },
    },
};

