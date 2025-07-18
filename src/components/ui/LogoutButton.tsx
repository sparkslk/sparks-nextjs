"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LogOut, Loader2 } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

interface LogoutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    showConfirmation?: boolean;
    redirectTo?: string;
    useCustomAPI?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function LogoutButton({
    variant = "outline",
    size = "default",
    showConfirmation = true,
    redirectTo = "/login",
    useCustomAPI = false,
    className,
    children,
}: LogoutButtonProps) {
    const { logout, isLoggingOut } = useLogout();
    const [showDialog, setShowDialog] = useState(false);

    const handleLogout = () => {
        logout({
            redirectTo,
            useCustomAPI,
            clearLocalStorage: true,
        });
        setShowDialog(false);
    };

    const LogoutButtonContent = () => (
        <Button
            variant={variant}
            size={size}
            disabled={isLoggingOut}
            className={className}
        >
            {isLoggingOut ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                </>
            ) : (
                <>
                    <LogOut className="mr-2 h-4 w-4" />
                    {children || "Logout"}
                </>
            )}
        </Button>
    );

    if (!showConfirmation) {
        return (
            <div onClick={handleLogout}>
                <LogoutButtonContent />
            </div>
        );
    }

    return (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
                <LogoutButtonContent />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to logout?</DialogTitle>
                    <DialogDescription>
                        You will be signed out of your account and redirected to the login page.
                        Any unsaved changes may be lost.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setShowDialog(false)}
                        disabled={isLoggingOut}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging out...
                            </>
                        ) : (
                            "Logout"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Simple logout button without confirmation
export function SimpleLogoutButton({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) {
    return (
        <LogoutButton
            showConfirmation={false}
            variant="ghost"
            className={className}
        >
            {children}
        </LogoutButton>
    );
}

// Logout menu item for dropdown menus
export function LogoutMenuItem() {
    const { logout, isLoggingOut } = useLogout();

    return (
        <div
            className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded-md"
            onClick={() => logout({ clearLocalStorage: true })}
        >
            {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <LogOut className="mr-2 h-4 w-4" />
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
        </div>
    );
}
