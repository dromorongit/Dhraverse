import 'dotenv/config'
import { getPrisma } from '@/lib/prisma'

async function main() {
  const cols = await getPrisma().$queryRawUnsafe<any[]>(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_name = 'customer_loyalty' 
    ORDER BY ordinal_position
  `)
  for (const c of cols) {
    console.log(c.column_name, c.data_type)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await getPrisma().$disconnect())
