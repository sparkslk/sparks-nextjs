"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SetPasswordModal } from "./SetPasswordModal";
import { Shield, X, Smartphone } from "lucide-react";

const DISMISSED_KEY = "password-setup-banner-dismissed";

export function PasswordSetupBanner() {
    const [shouldShow, setShouldShow] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkPasswordStatus();
    }, []);

    const checkPasswordStatus = async () => {
        try {
            // Check if user has dismissed the banner
            const dismissed = localStorage.getItem(DISMISSED_KEY);
            if (dismissed === "true") {
                setIsDismissed(true);
                setIsLoading(false);
                return;
            }

            // Check if user needs to set password
            const response = await fetch("/api/auth/password-status");
            if (!response.ok) {
                throw new Error("Failed to check password status");
            }

            const data = await response.json();
            setShouldShow(data.shouldShowPasswordPrompt || false);
        } catch (error) {
            console.error("Error checking password status:", error);
            setShouldShow(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISSED_KEY, "true");
        setIsDismissed(true);
    };

    const handleSuccess = () => {
        setShouldShow(false);
        localStorage.setItem(DISMISSED_KEY, "true");
    };

    // Don't render anything while loading or if dismissed or not needed
    if (isLoading || isDismissed || !shouldShow) {
        return null;
    }

    return (
        <>
            <Alert className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Set Up Your Password for Mobile Access
                        </AlertTitle>
                        <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                            You signed in with Google, but you&apos;ll need a password to access the SPARKS mobile app.
                            Set one up now to unlock full access across all platforms.
                        </AlertDescription>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                                size="sm"
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Set Password Now
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDismiss}
                                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Dismiss
                            </Button>
                        </div>
                    </div>
                </div>
            </Alert>

            <SetPasswordModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={handleSuccess}
            />
        </>
    );
}
