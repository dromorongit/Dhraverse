import 'dotenv/config'
import { getPrisma } from '@/lib/prisma'

async function main() {
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
