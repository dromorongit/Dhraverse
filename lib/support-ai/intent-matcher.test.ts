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
    console.log('Payment match:', JSON.stringify(result))
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('payment-methods')
    expect(result.confidence).toBeGreaterThan(0.3)
  })

  it('should match refund policy for CUSTOMER', () => {
    const result = matchIntent('what is your refund policy', 'CUSTOMER')
    console.log('Refund match:', JSON.stringify(result))
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('refund-policy')
  })

  it('should match vendor registration for CUSTOMER', () => {
    const result = matchIntent('how do I become a vendor', 'CUSTOMER')
    console.log('Vendor reg match:', JSON.stringify(result))
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('how-to-register-vendor')
  })

  it('should match vendor payout for VENDOR', () => {
    const result = matchIntent('when do I get paid', 'VENDOR')
    console.log('Vendor payout match:', JSON.stringify(result))
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('vendor-payout-timing')
  })

  it('should not match vendor-only intent for CUSTOMER', () => {
    const result = matchIntent('when do I get paid as a vendor', 'CUSTOMER')
    console.log('Vendor payout for CUSTOMER:', JSON.stringify(result))
    expect(result.intent?.category).not.toBe('vendor')
  })

  it('should return low confidence for gibberish', () => {
    const result = matchIntent('asdfghjkl qwerty', 'CUSTOMER')
    console.log('Gibberish match:', JSON.stringify(result))
    expect(result.intent).toBeNull()
  })

  it('should match order status inquiry', () => {
    const result = matchIntent('where is my order', 'CUSTOMER')
    console.log('Order status match:', JSON.stringify(result))
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('order-status-inquiry')
  })
})
