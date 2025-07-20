"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    showStrength?: boolean;
    onPasswordChange?: (password: string) => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showStrength = false, onPasswordChange, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const [isFocused, setIsFocused] = React.useState(false);

        const handleToggleVisibility = (e: React.MouseEvent) => {
            e.preventDefault();
            setShowPassword(!showPassword);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (props.onChange) {
                props.onChange(e);
            }
            if (onPasswordChange) {
                onPasswordChange(e.target.value);
            }
        };

        return (
            <div className="relative">
                <Input
                    {...props}
                    ref={ref}
                    type={showPassword ? "text" : "password"}
                    className={cn("pr-10", className)}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent",
                        isFocused && "focus:ring-2 focus:ring-offset-2"
                    )}
                    onClick={handleToggleVisibility}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };