import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { $Enums } from "@prisma/client";
import { Adapter } from "next-auth/adapters";

// Export UserRole enum from Prisma
export const UserRole = $Enums.UserRole;
export type UserRole = $Enums.UserRole;

export const authOptions: NextAuthOptions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(prisma as any) as Adapter,
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
                    where: { email: credentials.email },
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

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (process.env.NODE_ENV === "development") {
                console.log("SignIn callback:", {
                    provider: account?.provider,
                    userEmail: user?.email,
                    profileEmail: profile?.email
                });
            }

            // For Google OAuth, ensure user exists in database
            if (account?.provider === "google") {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });

                    if (process.env.NODE_ENV === "development") {
                        console.log("Google OAuth user check:", {
                            email: user.email,
                            existsInDb: !!existingUser,
                            dbRole: existingUser?.role
                        });
                    }

                    return true;
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.error("Google OAuth error:", error);
                    }
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (process.env.NODE_ENV === "development") {
                console.log("JWT callback:", {
                    hasUser: !!user,
                    hasAccount: !!account,
                    provider: account?.provider,
                    tokenEmail: token.email,
                    tokenRole: token.role,
                    userRole: user?.role
                });
            }

            // If this is the first time (user object exists), get user data from database
            if (user) {
                token.id = user.id;
                token.role = user.role;

                if (process.env.NODE_ENV === "development") {
                    console.log("JWT: Setting token from user object:", { id: user.id, role: user.role });
                }
            }

            // For subsequent requests, if we don't have role info, fetch from database
            if (!token.role && token.email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email },
                        select: { id: true, role: true }
                    });
                    if (dbUser) {
                        token.id = dbUser.id;
                        token.role = dbUser.role;

                        if (process.env.NODE_ENV === "development") {
                            console.log("JWT: Fetched role from DB:", { id: dbUser.id, role: dbUser.role });
                        }
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.error("JWT: Error fetching user from DB:", error);
                    }
                }
            }

            if (process.env.NODE_ENV === "development") {
                console.log("JWT: Final token:", { id: token.id, role: token.role, email: token.email });
            }

            return token;
        },
        async session({ session, token }) {
            if (process.env.NODE_ENV === "development") {
                console.log("Session callback:", {
                    tokenId: token.id,
                    tokenRole: token.role,
                    sessionUserEmail: session.user?.email
                });
            }

            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;

                if (process.env.NODE_ENV === "development") {
                    console.log("Session: Final session user:", {
                        id: session.user.id,
                        role: session.user.role,
                        email: session.user.email
                    });
                }
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (process.env.NODE_ENV === "development") {
                console.log("Redirect callback:", { url, baseUrl });
            }

            // Always redirect to dashboard-redirect after login/signin
            if (url.includes('/login') || url.includes('/signin') || url.includes('/dashboard')) {
                return `${baseUrl}/dashboard-redirect`;
            }

            // Allows relative callback URLs
            if (url.startsWith("/")) {
                if (process.env.NODE_ENV === "development") {
                    console.log("Redirect: Using relative URL:", `${baseUrl}${url}`);
                }
                return `${baseUrl}${url}`;
            }

            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) {
                if (process.env.NODE_ENV === "development") {
                    console.log("Redirect: Using same origin URL:", url);
                }
                return url;
            }

            // For OAuth callbacks, redirect to dashboard-redirect
            if (process.env.NODE_ENV === "development") {
                console.log("Redirect: Default redirect to dashboard-redirect");
            }
            return `${baseUrl}/dashboard-redirect`;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login", // Redirect errors to login page
        signOut: "/login", // Redirect after sign out
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);

