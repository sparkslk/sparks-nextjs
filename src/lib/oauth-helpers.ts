import { signIn } from "next-auth/react";

export function handleGoogleSignup(intendedRole: string, callbackUrl: string) {
    // Store the intended role in session storage
    if (typeof window !== "undefined") {
        sessionStorage.setItem("intendedRole", intendedRole);
    }

    // Start Google OAuth flow
    return signIn("google", {
        callbackUrl: `/api/auth/callback/google?intendedRole=${intendedRole}&redirect=${encodeURIComponent(callbackUrl)}`
    });
}

export function getStoredIntendedRole(): string | null {
    if (typeof window !== "undefined") {
        return sessionStorage.getItem("intendedRole");
    }
    return null;
}

export function clearStoredIntendedRole(): void {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem("intendedRole");
    }
}
