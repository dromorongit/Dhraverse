import "dotenv/config";
import { getPrisma } from "@/lib/prisma";

const prisma = getPrisma();

async function main() {
  const statements = [
    `ALTER TABLE "customer_loyalty"
   ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;`,
    `ALTER TABLE "orders"
   ADD COLUMN IF NOT EXISTS "walletAmountApplied" DOUBLE PRECISION;`,
    `CREATE INDEX IF NOT EXISTS "customer_loyalty_walletBalance_idx" ON "customer_loyalty" ("walletBalance");`,
    `CREATE INDEX IF NOT EXISTS "orders_walletAmountApplied_idx" ON "orders" ("walletAmountApplied");`,
  ];

  for (const sql of statements) {
    console.log("\n--- EXECUTING ---");
    console.log(sql);
    try {
      const result = await prisma.$executeRawUnsafe(sql);
      console.log("RESULT:", result);
    } catch (e) {
      console.error("ERROR:", e);
      process.exit(1);
    }
  }
}

main()
  .catch((e) => {
    console.error("FATAL:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
