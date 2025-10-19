import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * Debug endpoint to check OAuth token status
 * IMPORTANT: Remove this in production!
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireApiAuth(request);

    // Get all Google accounts for this user
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        provider: "google",
      },
      select: {
        id: true,
        provider: true,
        type: true,
        userId: true,
        access_token: true,
        refresh_token: true,
        expires_at: true,
        scope: true,
        token_type: true,
      },
    });

    const hasGoogleAccount = accounts.length > 0;
    const hasTokens = accounts.some(acc => acc.access_token && acc.refresh_token);
    const scopes = accounts.map(acc => acc.scope).filter(Boolean);
    const hasCalendarScope = scopes.some(scope => scope?.includes('calendar'));

    return NextResponse.json({
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      hasGoogleAccount,
      hasTokens,
      hasCalendarScope,
      accountCount: accounts.length,
      accounts: accounts.map(acc => ({
        id: acc.id,
        hasAccessToken: !!acc.access_token,
        hasRefreshToken: !!acc.refresh_token,
        scope: acc.scope,
        expiresAt: acc.expires_at ? new Date(acc.expires_at * 1000).toISOString() : null,
        tokenType: acc.token_type,
      })),
      message: !hasGoogleAccount
        ? "❌ No Google account linked. Please log in with Google."
        : !hasTokens
        ? "❌ Google account found but no tokens. Please re-authenticate."
        : !hasCalendarScope
        ? "⚠️ Google account found but missing Calendar scope. Please log out and log back in with Google to grant Calendar permissions."
        : "✅ Google OAuth configured correctly with Calendar API access!",
    });

  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Error checking OAuth status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
