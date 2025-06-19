import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        password: true,
        accounts: {
          select: {
            provider: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const hasPassword = !!user.password;
    const hasOAuthAccount = user.accounts.some(account => account.provider !== "credentials");

    return NextResponse.json({
      hasPassword,
      hasOAuthAccount,
      shouldShowPasswordPrompt: hasOAuthAccount && !hasPassword
    });
  } catch (error) {
    console.error("Check password status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
