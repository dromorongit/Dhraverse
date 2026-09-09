import 'dotenv/config'
import { getPrisma } from '@/lib/prisma'

async function main() {
  const prisma = getPrisma()
  
  // Find the user with customer_loyalty
  const loyaltyUsers = await prisma.$queryRawUnsafe<any[]>(`
    SELECT "userId", points, "totalPointsEarned", "totalPointsRedeemed", "totalCashbackEarned", "totalCashbackRedeemed",
           "lastDailyLoginRewardAt", "profileCompletionRewarded", "followVendorRewardClaimed", "lastWishlistRewardAt"
    FROM "customer_loyalty"
  `)
  for (const row of loyaltyUsers) {
    console.log(JSON.stringify(row))
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await getPrisma().$disconnect())
