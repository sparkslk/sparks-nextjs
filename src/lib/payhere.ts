/**
 * PayHere Payment Gateway Integration
 * Sri Lanka's #1 Payment Gateway with HelaPay support
 */

import crypto from 'crypto';

export interface PayHereConfig {
  merchantId: string;
  merchantSecret: string;
  mode: 'sandbox' | 'live';
  notifyUrl: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface DonationPaymentData {
  orderId: string;
  amount: number;
  currency: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  items: string;
}

export interface PayHereNotification {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  custom_1?: string;
  custom_2?: string;
  status_message?: string;
  card_holder_name?: string;
  card_no?: string;
  card_expiry?: string;
  method?: string;
}

/**
 * Generate PayHere payment hash for security
 */
export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  merchantSecret: string
): string {
  const amountFormatted = parseFloat(amount).toFixed(2);
  const hashString = merchantId + orderId + amountFormatted + currency + getMd5Hash(merchantSecret);
  return getMd5Hash(hashString).toUpperCase();
}

/**
 * Verify PayHere notification signature
 */
export function verifyPayHereNotification(
  notification: PayHereNotification,
  merchantSecret: string
): boolean {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = notification;

  const amountFormatted = parseFloat(payhere_amount).toFixed(2);
  const hashString = merchant_id + order_id + amountFormatted + payhere_currency + status_code + getMd5Hash(merchantSecret);
  const generatedHash = getMd5Hash(hashString).toUpperCase();

  return generatedHash === md5sig;
}

/**
 * Generate MD5 hash
 */
function getMd5Hash(value: string): string {
  return crypto.createHash('md5').update(value).digest('hex').toUpperCase();
}

/**
 * Get PayHere status message from status code
 */
export function getPayHereStatusMessage(statusCode: string): string {
  const statusMessages: Record<string, string> = {
    '2': 'Success',
    '0': 'Pending',
    '-1': 'Cancelled',
    '-2': 'Failed',
    '-3': 'Chargedback',
  };

  return statusMessages[statusCode] || 'Unknown';
}

/**
 * Parse PayHere payment method
 */
export function parsePayHereMethod(method?: string): string {
  if (!method) return 'CARD';

  const methodMap: Record<string, string> = {
    'VISA': 'VISA',
    'MASTER': 'MASTERCARD',
    'AMEX': 'AMEX',
    'eZ Cash': 'HELAPAY',
    'Genie': 'HELAPAY',
    'BANK': 'BANK_TRANSFER',
  };

  return methodMap[method] || method.toUpperCase();
}

/**
 * Generate unique order ID for donations
 */
export function generateDonationOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `DON${timestamp}${random}`;
}

/**
 * Format amount for PayHere (2 decimal places)
 */
export function formatPayHereAmount(amount: number): string {
  return parseFloat(amount.toString()).toFixed(2);
}

/**
 * Get PayHere config from environment variables
 */
export function getPayHereConfig(): PayHereConfig {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    merchantId: process.env.PAYHERE_MERCHANT_ID || '',
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || '',
    mode: (process.env.PAYHERE_MODE as 'sandbox' | 'live') || 'sandbox',
    notifyUrl: `${baseUrl}/api/donations/webhook/payhere`,
    returnUrl: `${baseUrl}/donate/success`,
    cancelUrl: `${baseUrl}/donate/cancel`,
  };
}
