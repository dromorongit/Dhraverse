import { describe, it, expect } from 'vitest'
import { matchIntent } from './intent-matcher'

describe('Support AI Vendor Role Matching', () => {
   it('should match vendor payout timing for VENDOR role', () => {
    const result = matchIntent('when do I get paid as a vendor', 'VENDOR')
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('vendor-payout-timing')
    expect(result.confidence).toBeGreaterThan(0.3)
  })

  it('should match vendor payout timing for CUSTOMER role (moved to general category)', () => {
    const result = matchIntent('when do I get paid as a vendor', 'CUSTOMER')
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('vendor-payout-timing')
    expect(result.confidence).toBeGreaterThan(0.3)
  })

   it('should match how to list product for VENDOR role', () => {
    const result = matchIntent('how do I add a product', 'VENDOR')
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('how-to-list-product')
  })

  it('should match order status for CUSTOMER role', () => {
    const result = matchIntent('where is my order', 'CUSTOMER')
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('order-status-inquiry')
  })

  it('should NOT match order status for VENDOR role', () => {
    const result = matchIntent('where is my order', 'VENDOR')
    expect(result.intent?.category).not.toBe('buyer')
  })

  it('should match how-to-contact-support for both CUSTOMER and VENDOR', () => {
    const customerResult = matchIntent('how can I contact support', 'CUSTOMER')
    const vendorResult = matchIntent('how can I contact support', 'VENDOR')
    expect(customerResult.intent?.id).toBe('how-to-contact-support')
    expect(vendorResult.intent?.id).toBe('how-to-contact-support')
  })
})
