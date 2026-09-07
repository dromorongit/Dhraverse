import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

async function main() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    maxUses: 7500,
    ssl: { rejectUnauthorized: false },
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const ads = await prisma.advertisement.findMany({ take: 5 })
  console.log('Existing ads:', JSON.stringify(ads, null, 2))

  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    take: 5,
    select: { id: true, email: true, role: true }
  })
  console.log('Admin users:', JSON.stringify(users, null, 2))

  await prisma.$disconnect()
  await pool.end()
}

main().catch(console.error)
