import 'dotenv/config'
import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

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
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV !== 'production' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

async function main() {
  console.log('=== Data Verification Report ===\n')

  const customerWithOrders = await prisma.user.findMany({
    where: {
      role: Role.CUSTOMER,
      orders: {
        some: {},
      },
    },
    select: {
      id: true,
      email: true,
    },
  })

  console.log(`1. Customers with at least one order: ${customerWithOrders.length}`)
  if (customerWithOrders.length > 0) {
    console.log('   Sample customers (id, email):')
    customerWithOrders.slice(0, 5).forEach((u) => {
      console.log(`   - ${u.id} | ${u.email}`)
    })
  }
  console.log()

  const vendorsWithPayouts = await prisma.user.findMany({
    where: {
      role: Role.VENDOR,
      vendorPayouts: {
        some: {},
      },
    },
    select: {
      id: true,
      email: true,
    },
  })

  console.log(`2. Vendors with at least one vendorPayout: ${vendorsWithPayouts.length}`)
  if (vendorsWithPayouts.length > 0) {
    console.log('   Sample vendors (id, email):')
    vendorsWithPayouts.slice(0, 5).forEach((u) => {
      console.log(`   - ${u.id} | ${u.email}`)
    })
  }
  console.log()

  const mostRecentOrder = await prisma.order.findFirst({
    where: {
      user: {
        role: Role.CUSTOMER,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      userId: true,
      status: true,
      createdAt: true,
    },
  })

  console.log('3. Most recent order for a customer:')
  if (mostRecentOrder) {
    console.log(`   - id: ${mostRecentOrder.id}`)
    console.log(`   - userId: ${mostRecentOrder.userId}`)
    console.log(`   - status: ${mostRecentOrder.status}`)
    console.log(`   - createdAt: ${mostRecentOrder.createdAt}`)
  } else {
    console.log('   No orders found.')
  }
  console.log()

  const mostRecentPayout = await prisma.vendorPayout.findFirst({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      vendorId: true,
      storeId: true,
      amount: true,
      status: true,
    },
  })

  console.log('4. Most recent vendor payout:')
  if (mostRecentPayout) {
    console.log(`   - id: ${mostRecentPayout.id}`)
    console.log(`   - vendorId: ${mostRecentPayout.vendorId}`)
    console.log(`   - storeId: ${mostRecentPayout.storeId}`)
    console.log(`   - amount: ${mostRecentPayout.amount}`)
    console.log(`   - status: ${mostRecentPayout.status}`)
  } else {
    console.log('   No vendor payouts found.')
  }
  console.log()

  const activeSessions = await prisma.session.findMany({
    where: {
      isExpired: false,
    },
    select: {
      sessionId: true,
      userId: true,
      createdAt: true,
      lastActivity: true,
    },
    orderBy: {
      lastActivity: 'desc',
    },
    take: 10,
  })

  console.log(`5. Active (non-expired) sessions (showing up to 10): ${activeSessions.length}`)
  if (activeSessions.length > 0) {
    activeSessions.forEach((s) => {
      console.log(`   - sessionId: ${s.sessionId} | userId: ${s.userId} | lastActivity: ${s.lastActivity}`)
    })
  } else {
    console.log('   No active sessions found.')
  }
  console.log()

  console.log('=== Verification Complete ===')
}

main()
  .catch((error) => {
    console.error('Verification failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
