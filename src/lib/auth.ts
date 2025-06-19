import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";
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
            return true;
        },
        async jwt({ token, user, account }: { token: JWT; user?: User | AdapterUser; account?: any }) {
            // If this is the first time (user object exists), it means user just signed in
            if (user) {
                // For OAuth users, fetch the role from database since adapter might not include it
                if (account?.provider === "google") {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });
                    token.role = (dbUser?.role as any) || UserRole.NORMAL_USER;
                } else {
                    // For credentials, the role should already be in the user object
                    token.role = (user as any).role || UserRole.NORMAL_USER;
                }
            }

            // If no role in token, try to fetch from database
            if (!token.role && (token as any).email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: (token as any).email }
                });
                token.role = (dbUser?.role as any) || UserRole.NORMAL_USER;
            }

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
            // Ensure the user has a role when linking Google account
            if (account.provider === "google") {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        role: UserRole.NORMAL_USER // Set default role if not already set
                    }
                });
            }
        },
    },
};
