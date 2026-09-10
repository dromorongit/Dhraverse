import 'dotenv/config'
import { getPrisma } from '@/lib/prisma'

async function main() {
  const prisma = getPrisma()

  const allRows = await prisma.recentlyViewed.findMany({
    select: { id: true, entityType: true, entityId: true },
  })

  const byType = new Map<string, string[]>()
  for (const row of allRows) {
    const list = byType.get(row.entityType) || []
    list.push(row.entityId)
    byType.set(row.entityType, list)
  }

  const validProductIds = new Set(
    (await prisma.product.findMany({ select: { id: true } })).map((p) => p.id)
  )
  const validServiceIds = new Set(
    (await prisma.service.findMany({ select: { id: true } })).map((s) => s.id)
  )
  const validStoreIds = new Set(
    (await prisma.store.findMany({ select: { id: true } })).map((s) => s.id)
  )

  const invalidRows = allRows.filter((row) => {
    if (row.entityType === 'PRODUCT') return !validProductIds.has(row.entityId)
    if (row.entityType === 'SERVICE') return !validServiceIds.has(row.entityId)
    if (row.entityType === 'VENDOR') return !validStoreIds.has(row.entityId)
    return true
  })

  if (invalidRows.length === 0) {
    console.log('No stale recently-viewed rows found.')
    await prisma.$disconnect()
    return
  }

  const idsToDelete = invalidRows.map((r) => r.id)
  const { count } = await prisma.recentlyViewed.deleteMany({
    where: { id: { in: idsToDelete } },
  })

  console.log(`Deleted ${count} stale recently-viewed rows.`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
