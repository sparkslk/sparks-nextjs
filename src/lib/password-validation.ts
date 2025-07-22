export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
}

export interface PasswordRequirement {
    regex: RegExp;
    message: string;
    label: string;
}

export const passwordRequirements: PasswordRequirement[] = [
    {
        regex: /.{8,}/,
        message: "At least 8 characters",
        label: "length"
    },
    {
        regex: /[A-Z]/,
        message: "At least 1 uppercase letter",
        label: "uppercase"
    },
    {
        regex: /[0-9]/,
        message: "At least 1 number",
        label: "number"
    },
    {
        regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        message: "At least 1 special character",
        label: "special"
    }
];

export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let metRequirements = 0;

    passwordRequirements.forEach(requirement => {
        if (requirement.regex.test(password)) {
            metRequirements++;
        } else {
            errors.push(requirement.message);
        }
    });

    const isValid = errors.length === 0;
    
    // Determine password strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (metRequirements === passwordRequirements.length && password.length >= 12) {
        strength = 'strong';
    } else if (metRequirements >= 3) {
        strength = 'medium';
    }

    return { isValid, errors, strength };
}

export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return 'text-red-500';
        case 'medium':
            return 'text-yellow-500';
        case 'strong':
            return 'text-green-500';
        default:
            return 'text-gray-500';
    }
}

export function getPasswordStrengthBgColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return 'bg-red-500';
        case 'medium':
            return 'bg-yellow-500';
        case 'strong':
            return 'bg-green-500';
        default:
            return 'bg-gray-300';
    }
}

export function getPasswordStrengthWidth(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return 'w-1/3';
        case 'medium':
            return 'w-2/3';
        case 'strong':
            return 'w-full';
        default:
            return 'w-0';
    }
}