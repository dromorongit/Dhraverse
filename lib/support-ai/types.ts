export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN' | 'GUEST'

export type IntentCategory = 'buyer' | 'vendor' | 'general'

export interface SupportIntent {
  id: string
  category: IntentCategory
  keywords: string[]
  patterns: string[]
  response: string
  sourceFile: string
  requiresAuth: boolean
  isDynamic: boolean
  dynamicType?: 'order_status' | 'vendor_payout_status'
}

export interface IntentMatchResult {
  intent: SupportIntent | null
  confidence: number
}

export interface SupportChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  confidence?: number
  suggestedEscalation?: boolean
}

export interface SupportChatRequest {
  message: string
  sessionId?: string
}

export interface SupportChatResponse {
  intentMatched: boolean
  response: string
  confidence: number
  suggestedEscalation: boolean
}

export interface OrderStatusResult {
  orderId: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  total: number
  createdAt: string
  itemCount: number
}

export interface VendorPayoutResult {
  payoutId: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
  note: string | null
}

export interface VendorOnboardingResult {
  subscriptionId: string
  status: string
  planId: string
  billingCycle: string
  currentPeriodEnd: string
  nextRenewalAt: string
  trialEndsAt: string | null
  autoRenew: boolean
}

export interface SupportEngineConfig {
  confidenceThreshold: number
  cacheTTL: number
  maxCacheSize: number
}

export const DEFAULT_SUPPORT_ENGINE_CONFIG: SupportEngineConfig = {
  confidenceThreshold: 0.3,
  cacheTTL: 5 * 60 * 1000,
  maxCacheSize: 200,
}
