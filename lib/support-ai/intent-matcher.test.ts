import { describe, it, expect } from 'vitest'
import { matchIntent, CONFIDENCE_THRESHOLD } from './intent-matcher'
import { supportKnowledgeBase } from './knowledge-base'

describe('Support AI Intent Matcher', () => {
  it('should have knowledge base entries', () => {
    expect(supportKnowledgeBase.length).toBeGreaterThanOrEqual(9)
  })

  it('should have confidence threshold defined', () => {
    expect(CONFIDENCE_THRESHOLD).toBe(0.3)
  })

  it('should match payment methods for CUSTOMER', () => {
    const result = matchIntent('how do I pay for my order', 'CUSTOMER')
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('payment-methods')
    expect(result.confidence).toBeGreaterThan(0.3)
  })

  it('should match refund policy for CUSTOMER', () => {
    const result = matchIntent('what is your refund policy', 'CUSTOMER')
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('refund-policy')
  })

  it('should match vendor registration for CUSTOMER', () => {
    const result = matchIntent('how do I become a vendor', 'CUSTOMER')
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('how-to-register-vendor')
  })

  it('should match vendor payout for VENDOR', () => {
    const result = matchIntent('when do I get paid', 'VENDOR')
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('vendor-payout-timing')
  })

  it('should match vendor payout timing for CUSTOMER (general category)', () => {
    const result = matchIntent('when do I get paid as a vendor', 'CUSTOMER')
    expect(result.intent?.id).toBe('vendor-payout-timing')
    expect(result.confidence).toBeGreaterThan(0.3)
  })

  it('should return low confidence for gibberish', () => {
    const result = matchIntent('asdfghjkl qwerty', 'CUSTOMER')
    expect(result.intent).toBeNull()
  })

  it('should match order status inquiry', () => {
    const result = matchIntent('where is my order', 'CUSTOMER')
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('order-status-inquiry')
  })
})
