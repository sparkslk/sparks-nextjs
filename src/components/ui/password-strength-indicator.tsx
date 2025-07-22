"use client";

import { Check, X } from "lucide-react";
import { 
    passwordRequirements, 
    validatePassword, 
    getPasswordStrengthColor, 
    getPasswordStrengthBgColor,
    getPasswordStrengthWidth 
} from "@/lib/password-validation";

interface PasswordStrengthIndicatorProps {
    password: string;
    showRequirements?: boolean;
}

export function PasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
    const validation = validatePassword(password);
    
    return (
        <div className="space-y-3">
            {password && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Password strength</span>
                        <span className={`text-sm font-medium capitalize ${getPasswordStrengthColor(validation.strength)}`}>
                            {validation.strength}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrengthBgColor(validation.strength)} ${getPasswordStrengthWidth(validation.strength)}`}
                        />
                    </div>
                </div>
            )}
            
            {showRequirements && (
                <div className="space-y-1">
                    {passwordRequirements.map((requirement) => {
                        const isMet = requirement.regex.test(password);
                        return (
                            <div
                                key={requirement.label}
                                className="flex items-center gap-2 text-sm"
                            >
                                {isMet ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <X className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className={isMet ? "text-green-600" : "text-muted-foreground"}>
                                    {requirement.message}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}