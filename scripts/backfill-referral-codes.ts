import 'dotenv/config'
import { getPrisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

const prisma = getPrisma()

function generateReferralCode(): string {
  return `REF-${randomBytes(4).toString('hex').toUpperCase()}`
}

async function backfillReferralCodes() {
  console.log('=== BACKFILL REFERRAL CODES ===')
  
  const customers = await prisma.$queryRaw<any[]>`
    SELECT id, email FROM "users" WHERE role = 'CUSTOMER' AND "referralCode" IS NULL
  `
  
  console.log(`Found ${customers.length} CUSTOMER users without referralCode`)
  
  if (customers.length === 0) {
    console.log('No backfill needed.')
    return
  }

  const existingCodes = new Set<string>()
  const allCodes = await prisma.$queryRaw<any[]>`SELECT "referralCode" FROM "users" WHERE "referralCode" IS NOT NULL`
  for (const row of allCodes) {
    existingCodes.add(row.referralCode)
  }
  console.log(`Loaded ${existingCodes.size} existing referral codes for collision check`)

  let backfilled = 0
  for (const customer of customers) {
    let code: string
    let attempts = 0
    do {
      code = generateReferralCode()
      attempts++
    } while (existingCodes.has(code) && attempts < 10)
    
    if (existingCodes.has(code)) {
      console.error(`COLLISION: Could not generate unique code for user ${customer.id} after 10 attempts`)
      continue
    }

    await prisma.$executeRaw`
      UPDATE "users" SET "referralCode" = ${code} WHERE id = ${customer.id}
    `
    existingCodes.add(code)
    backfilled++
    console.log(`  ${customer.id} (${customer.email}) -> ${code}`)
  }

  console.log(`\nBackfilled ${backfilled} users.`)
  
  const remaining = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*)::int as count FROM "users" WHERE role = 'CUSTOMER' AND "referralCode" IS NULL
  `
  console.log(`Remaining CUSTOMER users without referralCode: ${remaining[0].count}`)
}

backfillReferralCodes()
  .catch(e => {
    console.error('ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
