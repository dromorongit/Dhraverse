import { describe, it, expect } from 'vitest'
import { matchIntent } from './intent-matcher'

describe('Support AI Vendor Role Matching', () => {
  it('should match vendor payout timing for VENDOR role', () => {
    const result = matchIntent('when do I get paid as a vendor', 'VENDOR')
    console.log('VENDOR payout match:', JSON.stringify(result))
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('vendor-payout-timing')
    expect(result.confidence).toBeGreaterThan(0.3)
  })

  it('should NOT match vendor payout timing for CUSTOMER role', () => {
    const result = matchIntent('when do I get paid as a vendor', 'CUSTOMER')
    console.log('CUSTOMER payout match (should be null):', JSON.stringify(result))
    expect(result.intent?.category).not.toBe('vendor')
  })

  it('should match how to list product for VENDOR role', () => {
    const result = matchIntent('how do I add a product', 'VENDOR')
    console.log('VENDOR list product match:', JSON.stringify(result))
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('how-to-list-product')
  })

  it('should match order status for CUSTOMER role', () => {
    const result = matchIntent('where is my order', 'CUSTOMER')
    console.log('CUSTOMER order status match:', JSON.stringify(result))
    expect(result.intent).not.toBeNull()
    expect(result.intent?.id).toBe('order-status-inquiry')
  })

  it('should NOT match order status for VENDOR role', () => {
    const result = matchIntent('where is my order', 'VENDOR')
    console.log('VENDOR order status match (should be null):', JSON.stringify(result))
    expect(result.intent?.category).not.toBe('buyer')
  })

  it('should match how-to-contact-support for both CUSTOMER and VENDOR', () => {
    const customerResult = matchIntent('how can I contact support', 'CUSTOMER')
    const vendorResult = matchIntent('how can I contact support', 'VENDOR')
    console.log('CUSTOMER contact:', JSON.stringify(customerResult))
    console.log('VENDOR contact:', JSON.stringify(vendorResult))
    expect(customerResult.intent?.id).toBe('how-to-contact-support')
    expect(vendorResult.intent?.id).toBe('how-to-contact-support')
  })
})
