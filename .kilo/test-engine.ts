import { getSupportEngine, resetSupportEngine } from '@/lib/support-ai/engine'
import { matchIntent } from '@/lib/support-ai/intent-matcher'
import { supportKnowledgeBase } from '@/lib/support-ai/knowledge-base'

async function main() {
  console.log('=== Knowledge Base Check ===')
  console.log('Number of intents:', supportKnowledgeBase.length)
  console.log('Intents:', supportKnowledgeBase.map(i => i.id))

  console.log('\n=== Direct matchIntent Tests ===')
  const testMessages = [
    { msg: 'how do I pay for my order', role: 'CUSTOMER', expect: 'payment-methods' },
    { msg: 'what is your refund policy', role: 'CUSTOMER', expect: 'refund-policy' },
    { msg: 'how long does delivery take', role: 'CUSTOMER', expect: 'delivery-shipping' },
    { msg: 'how do I become a vendor', role: 'CUSTOMER', expect: 'how-to-register-vendor' },
    { msg: 'how do I add a product', role: 'CUSTOMER', expect: 'how-to-list-product' },
    { msg: 'how can I contact support', role: 'CUSTOMER', expect: 'how-to-contact-support' },
    { msg: 'how do I reset my password', role: 'CUSTOMER', expect: 'how-to-reset-password' },
  ]

  for (const t of testMessages) {
    const result = matchIntent(t.msg, t.role)
    const matched = result.intent?.id ?? 'null'
    const status = matched === t.expect ? 'PASS' : 'FAIL'
    console.log(`[${status}] "${t.msg}" (role=${t.role}) -> matched=${matched}, confidence=${result.confidence.toFixed(3)}`)
  }

  console.log('\n=== Engine.chat() Tests (no token) ===')
  resetSupportEngine()
  const engine = getSupportEngine()

  for (const t of testMessages) {
    try {
      const result = await engine.chat({ message: t.msg }, undefined)
      console.log(`"${t.msg}" -> intentMatched=${result.intentMatched}, response="${result.response.substring(0, 80)}..."`)
    } catch (e) {
      console.log(`"${t.msg}" -> ERROR: ${(e as Error).message}`)
    }
  }

  console.log('\n=== Engine.chat() Tests (with invalid token) ===')
  resetSupportEngine()
  const engine2 = getSupportEngine()
  try {
    const result = await engine2.chat({ message: 'how do I pay for my order' }, 'invalid-token')
    console.log(`"how do I pay" -> intentMatched=${result.intentMatched}, response="${result.response.substring(0, 80)}..."`)
  } catch (e) {
    console.log(`"how do I pay" -> ERROR: ${(e as Error).message}`)
  }
}

main().catch(console.error)
