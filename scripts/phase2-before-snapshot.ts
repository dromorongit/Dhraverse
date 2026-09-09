import 'dotenv/config'
import { getPrisma } from '@/lib/prisma'

async function main() {
  // 1. Total row counts
  console.log('=== ROW COUNTS ===')
  const userCount = await getPrisma().$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "users"`
  const loyaltyCount = await getPrisma().$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "customer_loyalty"`
  const referralCount = await getPrisma().$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "referral_records"`
  const pendingCount = await getPrisma().$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "pending_registrations"`
  console.log('users:', userCount[0].count)
  console.log('customer_loyalty:', loyaltyCount[0].count)
  console.log('referral_records:', referralCount[0].count)
  console.log('pending_registrations:', pendingCount[0].count)

  // 2. Sample users
  console.log('\n=== SAMPLE USERS ===')
  const users = await getPrisma().$queryRaw<any[]>`
    SELECT id, email, "createdAt", "behavioralTrackingConsent"
    FROM "users"
    LIMIT 5
  `
  for (const u of users) {
    console.log(JSON.stringify(u))
  }

  // 3. Customer count
  console.log('\n=== CUSTOMER COUNT ===')
  const customerCount = await getPrisma().$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "users" WHERE role = 'CUSTOMER'`
  console.log('CUSTOMER count:', customerCount[0].count)

  // 4. ReferralStatus enum values
  console.log('\n=== REFERRAL STATUS ENUM ===')
  const enumValues = await getPrisma().$queryRawUnsafe<any[]>(`
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
