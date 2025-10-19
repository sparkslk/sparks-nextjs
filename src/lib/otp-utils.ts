import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
 * Generates a short-lived verification token using proper JWT signing
 */
export function generateVerificationToken(email: string): string {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error('NEXTAUTH_SECRET is not configured');
    }

    const payload = {
        email,
        purpose: 'password-reset',
        nonce: crypto.randomBytes(16).toString('hex')
    };

    // Sign with expiry
    const token = jwt.sign(payload, secret, {
        expiresIn: `${OTP_CONFIG.VERIFICATION_TOKEN_EXPIRY_MINUTES}m`
    });

    return token;
}

/**
 * Verifies and decodes a verification token with proper JWT verification
 */
export function verifyVerificationToken(token: string): { email: string; valid: boolean } {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            console.error('NEXTAUTH_SECRET is not configured');
            return { email: '', valid: false };
        }

        // Verify signature and decode
        const decoded = jwt.verify(token, secret) as {
            email: string;
            purpose: string;
            nonce: string;
        };

        // Verify it's a password reset token
        if (decoded.purpose !== 'password-reset') {
            return { email: '', valid: false };
        }

        return { email: decoded.email, valid: true };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.error('Invalid token');
        } else {
            console.error('Error verifying token:', error);
        }
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
