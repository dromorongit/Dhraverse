// Paystack payment integration utilities
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co'

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    reference: string
    amount: number
    currency: string
    status: string
    customer: {
      email: string
      first_name: string
      last_name: string
      phone: string | null
    }
    metadata: any
  }
}

/**
 * Initialize a Paystack payment transaction
 */
export async function initializePaystackPayment(
  email: string,
  amount: number, // Amount in GHS (smallest currency unit - pesewas)
  reference: string,
  callbackUrl?: string,
  metadata?: Record<string, any>
): Promise<PaystackInitializeResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack secret key is not configured')
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // Convert GHS to pesewas (smallest unit)
      reference,
      callback_url: callbackUrl,
      metadata: metadata || {},
    }),
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to initialize payment')
  }

  return data
}

/**
 * Verify a Paystack payment transaction
 */
export async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack secret key is not configured')
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify payment')
  }

  return data
}

/**
 * Check if Paystack is properly configured
 */
export function isPaystackConfigured(): boolean {
  return !!PAYSTACK_SECRET_KEY && PAYSTACK_SECRET_KEY !== 'sk_test_your_secret_key'
}