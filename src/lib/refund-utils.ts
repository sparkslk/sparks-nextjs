/**
 * Utility functions for session cancellation refund calculations
 */

export interface RefundCalculation {
    originalAmount: number;
    refundAmount: number;
    refundPercentage: number;
    hoursBeforeSession: number;
    canRefund: boolean;
}

/**
 * Calculate refund percentage based on cancellation time
 * @param hoursBeforeSession Number of hours before the session
 * @returns Refund percentage (0-100)
 */
export function calculateRefundPercentage(hoursBeforeSession: number): number {
    if (hoursBeforeSession >= 24) {
        return 90; // 90% refund (10% deduction for cancellations 24+ hours before)
    } else if (hoursBeforeSession >= 0) {
        return 60; // 60% refund (40% deduction for cancellations within 24 hours)
    } else {
        return 0; // No refund after session time
    }
}

/**
 * Calculate refund details for a session cancellation
 * @param sessionTime The scheduled session time
 * @param bookedRate The original amount paid for the session
 * @param cancellationTime The time of cancellation (defaults to now)
 * @returns Complete refund calculation details
 */
export function calculateRefund(
    sessionTime: Date,
    bookedRate: number,
    cancellationTime: Date = new Date()
): RefundCalculation {
    const hoursBeforeSession = (sessionTime.getTime() - cancellationTime.getTime()) / (1000 * 60 * 60);
    const refundPercentage = calculateRefundPercentage(hoursBeforeSession);
    const refundAmount = Math.round((bookedRate * refundPercentage) / 100 * 100) / 100; // Round to 2 decimal places

    return {
        originalAmount: bookedRate,
        refundAmount: refundAmount,
        refundPercentage: refundPercentage,
        hoursBeforeSession: Math.max(0, hoursBeforeSession),
        canRefund: refundAmount > 0
    };
}

/**
 * Get refund policy description
 */
export function getRefundPolicy() {
    return {
        before24Hours: "90% refund (10% cancellation fee)",
        within24Hours: "60% refund (40% cancellation fee)",
        afterSession: "No refund available"
    };
}

/**
 * Format currency amount for Sri Lankan Rupees
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
    return `Rs. ${amount.toFixed(2)}`;
}

/**
 * Validate bank details for refund processing
 * @param bankDetails Bank account details
 * @returns Validation result
 */
export function validateBankDetails(bankDetails: {
    bankAccountName: string;
    bankName: string;
    accountNumber: string;
    branchCode?: string;
    swiftCode?: string;
}): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bankDetails.bankAccountName.trim()) {
        errors.push("Bank account holder name is required");
    }

    if (!bankDetails.bankName.trim()) {
        errors.push("Bank name is required");
    }

    if (!bankDetails.accountNumber.trim()) {
        errors.push("Account number is required");
    } else if (!/^\d+$/.test(bankDetails.accountNumber.replace(/\s+/g, ''))) {
        errors.push("Account number should contain only numbers");
    }

    // Optional: Validate SWIFT code format if provided
    if (bankDetails.swiftCode && bankDetails.swiftCode.trim()) {
        const swiftPattern = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
        if (!swiftPattern.test(bankDetails.swiftCode.trim().toUpperCase())) {
            errors.push("Invalid SWIFT code format");
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}