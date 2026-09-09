console.error('SCRIPT STARTED')
const { PrismaClient } = require('@prisma/client')

async function main() {
  console.error('MAIN STARTED')
  const prisma = new PrismaClient()
  console.error('PRISMA CREATED')
  
  const result = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM "users"`
  console.log('users count:', result[0].count)
}

main()
  .catch(e => {
    console.error('ERROR:', e)
    process.exit(1)
  })
