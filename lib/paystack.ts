/**
 * Paystack API Client
 * 
 * This module provides a typed interface to the Paystack API.
 * Documentation: https://paystack.com/docs/api/
 */

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Paystack API Error
 */
export class PaystackError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'PaystackError';
  }
}

/**
 * Make authenticated request to Paystack API
 */
async function paystackRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  
  if (!secretKey) {
    throw new PaystackError('PAYSTACK_SECRET_KEY is not configured');
  }

  const url = `${PAYSTACK_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new PaystackError(
      data.message || 'Paystack API request failed',
      response.status,
      data
    );
  }

  return data.data as T;
}

/**
 * Types
 */

export interface SubaccountData {
  business_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge: number;
  description?: string;
  primary_contact_email?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  metadata?: Record<string, any>;
}

export interface Subaccount {
  id: number;
  subaccount_code: string;
  business_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge: number;
  settlement_schedule: string;
  active: boolean;
  migrate: boolean;
  currency: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInitializeData {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  currency?: string; // NGN, GHS, ZAR, USD
  reference?: string;
  callback_url?: string;
  plan?: string;
  invoice_limit?: number;
  metadata?: Record<string, any>;
  channels?: string[];
  split_code?: string;
  subaccount?: string;
  transaction_charge?: number;
  bearer?: 'account' | 'subaccount';
}

export interface TransactionInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface TransactionVerifyResponse {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string | null;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: Record<string, any>;
  log: any;
  fees: number;
  fees_split: any;
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
    account_name: string | null;
  };
  customer: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: Record<string, any> | null;
    risk_action: string;
  };
  plan: any;
  subaccount?: {
    id: number;
    subaccount_code: string;
    business_name: string;
    description: string;
    primary_contact_name: string | null;
    primary_contact_email: string | null;
    primary_contact_phone: string | null;
    metadata: Record<string, any> | null;
    percentage_charge: number;
    settlement_bank: string;
    account_number: string;
  };
  split?: any;
  order_id: string | null;
  paidAt: string;
  createdAt: string;
  requested_amount: number;
  transaction_date: string;
}

export interface TransferRecipientData {
  type: 'nuban' | 'mobile_money' | 'basa';
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface TransferRecipient {
  active: boolean;
  createdAt: string;
  currency: string;
  domain: string;
  id: number;
  integration: number;
  name: string;
  recipient_code: string;
  type: string;
  updatedAt: string;
  is_deleted: boolean;
  details: {
    authorization_code: string | null;
    account_number: string;
    account_name: string | null;
    bank_code: string;
    bank_name: string;
  };
  metadata?: Record<string, any>;
}

export interface TransferData {
  source: 'balance';
  amount: number; // in kobo
  recipient: string; // recipient_code
  reason?: string;
  currency?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

export interface Transfer {
  integration: number;
  domain: string;
  amount: number;
  currency: string;
  source: string;
  reason: string;
  recipient: number;
  status: string;
  transfer_code: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountValidationResponse {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export interface RefundData {
  transaction: string | number; // transaction reference or id
  amount?: number; // in kobo, optional (full refund if not specified)
  currency?: string;
  customer_note?: string;
  merchant_note?: string;
}

export interface Refund {
  id: number;
  integration: number;
  domain: string;
  transaction: number;
  dispute: number;
  amount: number;
  currency: string;
  channel: string;
  fully_deducted: boolean;
  deducted_at: string | null;
  status: string;
  refunded_by: string;
  expected_at: string;
  settlement: number | null;
  customer_note: string;
  merchant_note: string;
  created_at: string;
  updated_at: string;
}

/**
 * Paystack Client API
 */

export const paystack = {
  /**
   * Subaccounts API
   */
  subaccounts: {
    /**
     * Create a subaccount
     * https://paystack.com/docs/api/subaccount/#create
     */
    create: async (data: SubaccountData): Promise<Subaccount> => {
      return paystackRequest<Subaccount>('/subaccount', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Get subaccount details
     * https://paystack.com/docs/api/subaccount/#fetch
     */
    get: async (idOrCode: string | number): Promise<Subaccount> => {
      return paystackRequest<Subaccount>(`/subaccount/${idOrCode}`);
    },

    /**
     * Update subaccount
     * https://paystack.com/docs/api/subaccount/#update
     */
    update: async (
      idOrCode: string | number,
      data: Partial<SubaccountData>
    ): Promise<Subaccount> => {
      return paystackRequest<Subaccount>(`/subaccount/${idOrCode}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * List subaccounts
     * https://paystack.com/docs/api/subaccount/#list
     */
    list: async (params?: {
      perPage?: number;
      page?: number;
      from?: string;
      to?: string;
    }): Promise<Subaccount[]> => {
      const queryParams = new URLSearchParams(params as any);
      return paystackRequest<Subaccount[]>(`/subaccount?${queryParams}`);
    },
  },

  /**
   * Transactions API
   */
  transactions: {
    /**
     * Initialize a transaction
     * https://paystack.com/docs/api/transaction/#initialize
     */
    initialize: async (
      data: TransactionInitializeData
    ): Promise<TransactionInitializeResponse> => {
      return paystackRequest<TransactionInitializeResponse>(
        '/transaction/initialize',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    /**
     * Verify a transaction
     * https://paystack.com/docs/api/transaction/#verify
     */
    verify: async (reference: string): Promise<TransactionVerifyResponse> => {
      return paystackRequest<TransactionVerifyResponse>(
        `/transaction/verify/${reference}`
      );
    },

    /**
     * List transactions
     * https://paystack.com/docs/api/transaction/#list
     */
    list: async (params?: {
      perPage?: number;
      page?: number;
      customer?: number;
      status?: 'failed' | 'success' | 'abandoned';
      from?: string;
      to?: string;
      amount?: number;
    }): Promise<TransactionVerifyResponse[]> => {
      const queryParams = new URLSearchParams(params as any);
      return paystackRequest<TransactionVerifyResponse[]>(
        `/transaction?${queryParams}`
      );
    },

    /**
     * Get transaction details
     * https://paystack.com/docs/api/transaction/#fetch
     */
    get: async (id: number): Promise<TransactionVerifyResponse> => {
      return paystackRequest<TransactionVerifyResponse>(`/transaction/${id}`);
    },
  },

  /**
   * Transfer Recipients API
   */
  transferRecipients: {
    /**
     * Create transfer recipient
     * https://paystack.com/docs/api/transfer-recipient/#create
     */
    create: async (data: TransferRecipientData): Promise<TransferRecipient> => {
      return paystackRequest<TransferRecipient>('/transferrecipient', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Get transfer recipient
     * https://paystack.com/docs/api/transfer-recipient/#fetch
     */
    get: async (idOrCode: string | number): Promise<TransferRecipient> => {
      return paystackRequest<TransferRecipient>(
        `/transferrecipient/${idOrCode}`
      );
    },

    /**
     * List transfer recipients
     * https://paystack.com/docs/api/transfer-recipient/#list
     */
    list: async (params?: {
      perPage?: number;
      page?: number;
      from?: string;
      to?: string;
    }): Promise<TransferRecipient[]> => {
      const queryParams = new URLSearchParams(params as any);
      return paystackRequest<TransferRecipient[]>(
        `/transferrecipient?${queryParams}`
      );
    },
  },

  /**
   * Transfers API
   */
  transfers: {
    /**
     * Initiate a transfer
     * https://paystack.com/docs/api/transfer/#initiate
     */
    initiate: async (data: TransferData): Promise<Transfer> => {
      return paystackRequest<Transfer>('/transfer', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Finalize transfer (for OTP-enabled transfers)
     * https://paystack.com/docs/api/transfer/#finalize
     */
    finalize: async (transferCode: string, otp: string): Promise<Transfer> => {
      return paystackRequest<Transfer>('/transfer/finalize_transfer', {
        method: 'POST',
        body: JSON.stringify({ transfer_code: transferCode, otp }),
      });
    },

    /**
     * Get transfer details
     * https://paystack.com/docs/api/transfer/#fetch
     */
    get: async (idOrCode: string | number): Promise<Transfer> => {
      return paystackRequest<Transfer>(`/transfer/${idOrCode}`);
    },

    /**
     * List transfers
     * https://paystack.com/docs/api/transfer/#list
     */
    list: async (params?: {
      perPage?: number;
      page?: number;
      customer?: number;
      status?: 'failed' | 'success' | 'pending';
      from?: string;
      to?: string;
    }): Promise<Transfer[]> => {
      const queryParams = new URLSearchParams(params as any);
      return paystackRequest<Transfer[]>(`/transfer?${queryParams}`);
    },
  },

  /**
   * Miscellaneous API
   */
  misc: {
    /**
     * Get list of banks
     * https://paystack.com/docs/api/miscellaneous/#bank
     */
    listBanks: async (params?: {
      country?: string;
      use_cursor?: boolean;
      perPage?: number;
      pay_with_bank_transfer?: boolean;
    }): Promise<Bank[]> => {
      const queryParams = new URLSearchParams(params as any);
      return paystackRequest<Bank[]>(`/bank?${queryParams}`);
    },

    /**
     * Validate account number
     * https://paystack.com/docs/api/miscellaneous/#resolve-account
     */
    validateAccount: async (
      accountNumber: string,
      bankCode: string
    ): Promise<AccountValidationResponse> => {
      return paystackRequest<AccountValidationResponse>(
        `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
      );
    },
  },

  /**
   * Refunds API
   */
  refunds: {
    /**
     * Create a refund
     * https://paystack.com/docs/api/refund/#create
     */
    create: async (data: RefundData): Promise<Refund> => {
      return paystackRequest<Refund>('/refund', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Get refund details
     * https://paystack.com/docs/api/refund/#fetch
     */
    get: async (reference: string): Promise<Refund> => {
      return paystackRequest<Refund>(`/refund/${reference}`);
    },

    /**
     * List refunds
     * https://paystack.com/docs/api/refund/#list
     */
    list: async (params?: {
      reference?: string;
      currency?: string;
      perPage?: number;
      page?: number;
      from?: string;
      to?: string;
    }): Promise<Refund[]> => {
      const queryParams = new URLSearchParams(params as any);
      return paystackRequest<Refund[]>(`/refund?${queryParams}`);
    },
  },
};

/**
 * Verify Paystack webhook signature
 * https://paystack.com/docs/payments/webhooks/#validate-event
 * 
 * Note: Paystack uses your secret key (not a separate webhook secret) to sign webhooks
 */
export function verifyPaystackWebhook(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

/**
 * Generate a unique transaction reference
 */
export function generateReference(prefix: string = 'TXN'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Convert amount to kobo (smallest currency unit)
 */
export function toKobo(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert kobo to main currency unit
 */
export function fromKobo(kobo: number): number {
  return kobo / 100;
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(
  amount: number,
  feePercentage: number = 5
): { platformFee: number; sellerAmount: number } {
  const platformFee = Math.round((amount * feePercentage) / 100);
  const sellerAmount = amount - platformFee;

  return { platformFee, sellerAmount };
}

export default paystack;
