/**
 * TypeScript type definitions for PayHere Payment Gateway
 * PayHere is Sri Lanka's leading online payment platform
 *
 * Documentation: https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout
 */

/**
 * PayHere payment configuration object
 */
export interface PayHerePayment {
  /** Sandbox mode flag - set to true for testing, false for production */
  sandbox: boolean;

  /** PayHere Merchant ID */
  merchant_id: string;

  /** URL to redirect after payment completion */
  return_url: string;

  /** URL to redirect when payment is cancelled */
  cancel_url: string;

  /** Server notification URL (webhook) */
  notify_url: string;

  /** Unique order ID for the transaction */
  order_id: string;

  /** Description of items being purchased */
  items: string;

  /** Payment amount */
  amount: string | number;

  /** Currency code (e.g., "LKR", "USD") */
  currency: string;

  /** Customer's first name */
  first_name: string;

  /** Customer's last name */
  last_name: string;

  /** Customer's email address */
  email: string;

  /** Customer's phone number */
  phone: string;

  /** Customer's address */
  address: string;

  /** Customer's city */
  city: string;

  /** Customer's country */
  country?: string;

  /** Delivery address (optional) */
  delivery_address?: string;

  /** Delivery city (optional) */
  delivery_city?: string;

  /** Delivery country (optional) */
  delivery_country?: string;

  /** Custom field 1 (optional) */
  custom_1?: string;

  /** Custom field 2 (optional) */
  custom_2?: string;

  /** Payment hash for security (generated server-side) */
  hash?: string;
}

/**
 * PayHere payment response object
 * Passed to onCompleted callback
 */
export interface PayHerePaymentResponse {
  /** Order ID */
  order_id: string;

  /** PayHere payment ID */
  payment_id: string;

  /** Payment amount */
  payhere_amount: string;

  /** Payment currency */
  payhere_currency: string;

  /** Status code (2 = success) */
  status_code: string;

  /** MD5 signature for verification */
  md5sig: string;

  /** Custom field 1 */
  custom_1?: string;

  /** Custom field 2 */
  custom_2?: string;

  /** Payment method used */
  method?: string;

  /** Status message */
  status_message?: string;

  /** Card holder name (for card payments) */
  card_holder_name?: string;

  /** Masked card number */
  card_no?: string;
}

/**
 * PayHere error object
 * Passed to onError callback
 */
export interface PayHereError {
  /** Error message */
  error_message?: string;

  /** Error code */
  error_code?: string;
}

/**
 * PayHere window object
 * Available after loading the PayHere script
 */
export interface PayHereWindow {
  /** Start the payment process */
  startPayment: (payment: PayHerePayment) => void;

  /** Callback when payment is completed successfully */
  onCompleted: (response: PayHerePaymentResponse) => void;

  /** Callback when payment is dismissed/cancelled */
  onDismissed: () => void;

  /** Callback when payment encounters an error */
  onError: (error: PayHereError) => void;
}

/**
 * Extend the Window interface to include PayHere
 */
declare global {
  interface Window {
    payhere?: PayHereWindow;
  }
}

export {};
