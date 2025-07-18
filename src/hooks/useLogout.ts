import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export interface LogoutOptions {
    redirectTo?: string;
    useCustomAPI?: boolean;
    clearLocalStorage?: boolean;
}

export function useLogout() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    const logout = async (options: LogoutOptions = {}) => {
        setIsLoggingOut(true);

        try {
            // Clear local storage if requested
            if (options.clearLocalStorage) {
                localStorage.clear();
                sessionStorage.clear();
            }

            if (options.useCustomAPI) {
                // Use your custom logout API
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include cookies
                });

                const data = await response.json();

                if (data.success) {
                    // Redirect manually
                    const redirectUrl = options.redirectTo || '/login';
                    router.push(redirectUrl);
                    router.refresh(); // Force refresh to clear any cached data
                } else {
                    throw new Error(data.error || 'Custom logout failed');
                }
            } else {
                // Use NextAuth.js signOut (recommended)
                await signOut({
                    callbackUrl: options.redirectTo || '/login',
                    redirect: true,
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect to login even if logout API fails
            router.push(options.redirectTo || '/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const logoutImmediate = () => {
        // Emergency logout - clears everything immediately
        localStorage.clear();
        sessionStorage.clear();

        // Clear cookies manually
        document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos) : c;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });

        window.location.href = '/login';
    };

    return {
        logout,
        logoutImmediate,
        isLoggingOut
    };
}
