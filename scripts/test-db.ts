import 'dotenv/config'
import { getPrisma } from '@/lib/prisma'

async function main() {
  console.error('MAIN STARTED')
  const prisma = getPrisma()
  console.error('PRISMA GOT')
  
  const result = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "users"`
  console.log('users count:', result[0].count)
}

main()
  .catch(e => {
    console.error('ERROR:', e)
    process.exit(1)
  })
