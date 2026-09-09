import { getPrisma } from '../prisma'

export async function purgeOldAuditLogIpAndUserAgent(retentionDays: number = 90): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)

  const result = await getPrisma().auditLog.updateMany({
    where: {
      createdAt: { lt: cutoff },
      OR: [
        { ipAddress: { not: null } },
        { userAgent: { not: null } },
      ],
    },
    data: {
      ipAddress: null,
      userAgent: null,
    },
  })

  return result.count
}
