import 'dotenv/config'
import { getPrisma } from '@/lib/prisma'

async function main() {
  const indexes = [
    'customer_loyalty_lastDailyLoginRewardAt_idx',
    'customer_loyalty_profileCompletionRewarded_idx',
    'customer_loyalty_followVendorRewardClaimed_idx',
    'customer_loyalty_lastWishlistRewardAt_idx',
    'users_referralCode_idx',
    'users_registrationIpAddress_idx',
    'referral_records_flagged_idx',
  ]
  
  for (const idx of indexes) {
    const result = await getPrisma().$queryRawUnsafe<any[]>(`
      SELECT indexname FROM pg_indexes WHERE indexname = '${idx}'
    `)
    console.log(idx + ':', result.length > 0 ? 'EXISTS' : 'MISSING')
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
