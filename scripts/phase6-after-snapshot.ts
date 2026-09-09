import 'dotenv/config'
import { getPrisma } from '@/lib/prisma'

async function main() {
  const prisma = getPrisma()

  // 1. Re-query total row counts
  console.log('=== ROW COUNTS (AFTER) ===')
  const userCount = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "users"`
  const loyaltyCount = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "customer_loyalty"`
  const referralCount = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "referral_records"`
  const pendingCount = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "pending_registrations"`
  console.log('users:', userCount[0].count)
  console.log('customer_loyalty:', loyaltyCount[0].count)
  console.log('referral_records:', referralCount[0].count)
  console.log('pending_registrations:', pendingCount[0].count)

  // 2. Re-query same 5 sample users
  console.log('\n=== SAMPLE USERS (AFTER) ===')
  const users = await prisma.$queryRaw<any[]>`
    SELECT id, email, "createdAt", "behavioralTrackingConsent", "referralCode", "registrationIpAddress"
    FROM "users"
    LIMIT 5
  `
  for (const u of users) {
    console.log(JSON.stringify(u))
  }

  // 3. CUSTOMER users with non-null referralCode
  console.log('\n=== CUSTOMER WITH REFERRAL CODE ===')
  const customerWithCode = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "users" WHERE role = 'CUSTOMER' AND "referralCode" IS NOT NULL`
  console.log('CUSTOMER with non-null referralCode:', customerWithCode[0].count)

  // 4. Duplicate referralCode check
  console.log('\n=== DUPLICATE REFERRAL CODES ===')
  const duplicates = await prisma.$queryRaw<any[]>`
    SELECT "referralCode", COUNT(*) as cnt FROM "users" WHERE "referralCode" IS NOT NULL GROUP BY "referralCode" HAVING COUNT(*) > 1
  `
  console.log('Duplicate count:', duplicates.length)
  for (const d of duplicates) {
    console.log(JSON.stringify(d))
  }

  // 5. customer_loyalty for the 5 sample users + the one user who has a loyalty record
  console.log('\n=== CUSTOMER LOYALTY (AFTER) ===')
  const allSampleIds = [...users.map(u => u.id)]
  // Also include the known loyalty user
  const knownLoyaltyUser = await prisma.$queryRaw<any[]>`SELECT "userId" FROM "customer_loyalty" LIMIT 1`
  if (knownLoyaltyUser.length > 0) {
    allSampleIds.push(knownLoyaltyUser[0].userId)
  }
  
  const loyaltyRows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT "userId", points, "totalPointsEarned", "totalPointsRedeemed", "totalCashbackEarned", "totalCashbackRedeemed",
           "lastDailyLoginRewardAt", "profileCompletionRewarded", "followVendorRewardClaimed", "lastWishlistRewardAt"
    FROM "customer_loyalty"
    WHERE "userId" = ANY($1::text[])
  `, allSampleIds)
  
  if (loyaltyRows.length === 0) {
    console.log('No customer_loyalty records found for sample users (expected: only 1 loyalty record exists in DB)')
  } else {
    for (const row of loyaltyRows) {
      console.log(JSON.stringify(row))
    }
  }

  // 6. ReferralStatus enum
  console.log('\n=== REFERRAL STATUS ENUM (AFTER) ===')
  const enumValues = await prisma.$queryRawUnsafe<any[]>(`
    SELECT unnest(enum_range(NULL::"ReferralStatus")) AS enumlabel
  `)
  for (const v of enumValues) {
    console.log(v.enumlabel)
  }
}

main()
  .catch(e => {
    console.error('ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await getPrisma().$disconnect()
  })
