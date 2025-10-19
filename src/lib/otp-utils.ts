import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * OTP Configuration
 */
export const OTP_CONFIG = {
    LENGTH: 6,
    EXPIRY_MINUTES: 10,
    MAX_ATTEMPTS: 5,
    RESEND_COOLDOWN_SECONDS: 60,
    VERIFICATION_TOKEN_EXPIRY_MINUTES: 5
} as const;

/**
 * Generates a cryptographically secure 6-digit OTP
 */
export function generateOTP(): string {
    // Generate a random number between 100000 and 999999
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    const otp = (randomNumber % 900000) + 100000; // Ensures 6 digits
    return otp.toString();
}

/**
 * Hashes an OTP for secure storage in the database
 */
export async function hashOTP(otp: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(otp, saltRounds);
}

/**
 * Verifies an OTP against its hash
 */
export async function verifyOTP(inputOTP: string, hashedOTP: string): Promise<boolean> {
    return await bcrypt.compare(inputOTP, hashedOTP);
}

/**
 * Generates OTP expiry date (current time + configured minutes)
 */
export function generateOTPExpiry(): Date {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + OTP_CONFIG.EXPIRY_MINUTES);
    return expiryDate;
}

/**
 * Checks if an OTP has expired
 */
export function isOTPExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
}

/**
 * Generates a short-lived verification token using JWT-like structure
 */
export function generateVerificationToken(email: string): string {
    const payload = {
        email,
        exp: Date.now() + (OTP_CONFIG.VERIFICATION_TOKEN_EXPIRY_MINUTES * 60 * 1000),
        nonce: crypto.randomBytes(16).toString('hex')
    };

    const token = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return token;
}

/**
 * Verifies and decodes a verification token
 */
export function verifyVerificationToken(token: string): { email: string; valid: boolean } {
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));

        if (!decoded.email || !decoded.exp || !decoded.nonce) {
            return { email: '', valid: false };
        }

        // Check if token has expired
        if (Date.now() > decoded.exp) {
            return { email: decoded.email, valid: false };
        }

        return { email: decoded.email, valid: true };
    } catch (error) {
        console.error('Error verifying token:', error);
        return { email: '', valid: false };
    }
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitizes email (lowercase, trim)
 */
export function sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
}
