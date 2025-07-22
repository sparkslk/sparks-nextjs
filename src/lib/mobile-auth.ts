import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface MobileTokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Verifies a mobile JWT access token
 * @param token - The JWT token to verify
 * @returns The decoded token payload if valid, null otherwise
 */
export async function verifyMobileToken(token: string): Promise<MobileTokenPayload | null> {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('NEXTAUTH_SECRET is not configured');
      return null;
    }

    const payload = jwt.verify(token, secret) as MobileTokenPayload;
    
    // Additional validation can be added here
    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token:', error.message);
    } else {
      console.error('Token verification error:', error);
    }
    return null;
  }
}

/**
 * Verifies a mobile JWT refresh token
 * @param token - The JWT refresh token to verify
 * @returns The decoded token payload if valid, null otherwise
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('NEXTAUTH_SECRET is not configured');
      return null;
    }

    const payload = jwt.verify(token, secret) as RefreshTokenPayload;
    
    // Verify it's a refresh token
    if (payload.type !== 'refresh') {
      return null;
    }

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Refresh token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid refresh token:', error.message);
    } else {
      console.error('Refresh token verification error:', error);
    }
    return null;
  }
}

/**
 * Generates a new access token
 * @param userId - The user's ID
 * @param email - The user's email
 * @param role - The user's role
 * @returns The generated JWT access token
 */
export function generateAccessToken(userId: string, email: string, role: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    secret,
    { expiresIn: '1h' }
  );
}

/**
 * Generates a new refresh token
 * @param userId - The user's ID
 * @returns The generated JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  return jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    secret,
    { expiresIn: '7d' }
  );
}

/**
 * Extracts the Bearer token from the Authorization header
 * @param request - The Next.js request object
 * @returns The token if present and valid format, null otherwise
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}