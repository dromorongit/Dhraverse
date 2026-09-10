import "dotenv/config";
import { getPrisma } from "@/lib/prisma";

const prisma = getPrisma();

async function main() {
  console.log("=== ROW COUNTS ===");
  const customerLoyaltyCount = await prisma.customerLoyalty.count();
  const ordersCount = await prisma.order.count();
  const rewardRedemptionsCount = await prisma.rewardRedemption.count();
  console.log(`customer_loyalty: ${customerLoyaltyCount}`);
  console.log(`orders: ${ordersCount}`);
  console.log(`reward_redemptions: ${rewardRedemptionsCount}`);

  console.log("\n=== CUSTOMER LOYALTY ROWS ===");
  const loyaltyRows = await prisma.$queryRaw<Array<{
    userId: string;
    points: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    totalCashbackEarned: number;
    totalCashbackRedeemed: number;
    walletBalance: number;
  }>>`
    SELECT "userId", "points", "totalPointsEarned", "totalPointsRedeemed",
           "totalCashbackEarned", "totalCashbackRedeemed", "walletBalance"
    FROM "customer_loyalty"
    ORDER BY "createdAt" ASC
  `;
  console.log(JSON.stringify(loyaltyRows, null, 2));

  console.log("\n=== SAMPLE ORDERS ===");
  const orders = await prisma.$queryRaw<Array<{
    id: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: Date;
    walletAmountApplied: number | null;
  }>>`
    SELECT "id", "total", "status", "paymentStatus", "createdAt", "walletAmountApplied"
    FROM "orders"
    ORDER BY "createdAt" DESC
    LIMIT 5
  `;
  console.log(JSON.stringify(orders, null, 2));
}

main()
  .catch((e) => {
    console.error("QUERY_ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
