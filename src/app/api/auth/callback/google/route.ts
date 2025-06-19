import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;
        const { searchParams } = new URL(request.url);
        const intendedRole = searchParams.get("intendedRole");
        const redirectUrl = searchParams.get("redirect");

        if (!session || !session.user?.email) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // If there's an intended role, update the user's role
        if (intendedRole && ["THERAPIST", "MANAGER", "ADMIN"].includes(intendedRole)) {
            await prisma.user.update({
                where: { email: session.user.email },
                data: { role: intendedRole as any }
            });
        }

        // Redirect to the appropriate dashboard
        const finalRedirectUrl = redirectUrl || "/dashboard";
        return NextResponse.redirect(new URL(finalRedirectUrl, request.url));
    } catch (error) {
        console.error("Google OAuth callback error:", error);
        return NextResponse.redirect(new URL("/login?error=callback_error", request.url));
    }
}
