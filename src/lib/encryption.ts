/**
 * Message Encryption Utilities
 * 
 * This module provides AES-256-GCM encryption for chat messages.
 * All messages are encrypted at rest in the database and decrypted only when
 * authorized users access them.
 * 
 * Security Features:
 * - AES-256-GCM symmetric encryption
 * - Random IV (Initialization Vector) for each message
 * - Authentication tag for integrity verification
 * - Key derivation from environment variable
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32; // 256 bits

/**
 * Get or derive the encryption key from environment variable
 * In production, use a proper key management service (KMS)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.CHAT_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('CHAT_ENCRYPTION_KEY environment variable is not set');
  }
  
  // If the key is already 64 hex characters (32 bytes), use it directly
  if (key.length === 64 && /^[0-9a-f]{64}$/i.test(key)) {
    return Buffer.from(key, 'hex');
  }
  
  // Otherwise, derive a key from the provided string using PBKDF2
  const salt = Buffer.from('sparks-chat-salt-v1', 'utf8'); // Static salt for consistency
  return crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Generate a secure random encryption key (for initialization only)
 * Run this once and store the output in your .env file
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Encrypt a message using AES-256-GCM
 * 
 * @param plaintext - The message to encrypt
 * @returns Encrypted message in format: iv:authTag:encryptedData (all hex-encoded)
 */
export function encryptMessage(plaintext: string): string {
  try {
    if (!plaintext || plaintext.trim().length === 0) {
      throw new Error('Cannot encrypt empty message');
    }
    
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message using AES-256-GCM
 * 
 * @param encryptedData - Encrypted message in format: iv:authTag:encryptedData
 * @returns Decrypted plaintext message
 */
export function decryptMessage(encryptedData: string): string {
  try {
    if (!encryptedData || !encryptedData.includes(':')) {
      throw new Error('Invalid encrypted data format');
    }
    
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Validate that encryption is properly configured
 */
export function validateEncryptionSetup(): boolean {
  try {
    const testMessage = 'test-message-' + Date.now();
    const encrypted = encryptMessage(testMessage);
    const decrypted = decryptMessage(encrypted);
    return decrypted === testMessage;
  } catch (error) {
    console.error('Encryption setup validation failed:', error);
    return false;
  }
}
