import { getPrisma } from '@/lib/prisma'
import { completeReferral } from './referral-engine'
import { ReferralStatus } from '@prisma/client'

interface ProcessReferralSignupInput {
  referralCode: string | null | undefined
  userId: string
  registrationIpAddress: string | null
  role: string
}

export async function processReferralSignup(input: ProcessReferralSignupInput): Promise<void> {
  const prisma = getPrisma()
  const { referralCode, userId, registrationIpAddress, role } = input

  if (role !== 'CUSTOMER' || typeof referralCode !== 'string' || !referralCode.trim()) {
    return
  }

  const trimmedCode = referralCode.trim()
  const referral = await prisma.referralRecord.findUnique({
    where: { code: trimmedCode },
    include: { referrer: { select: { id: true, registrationIpAddress: true } } },
  })

  if (!referral || referral.referrerId === userId) {
    return
  }

  const referrerIp = referral.referrer?.registrationIpAddress || null
  const isSameIp = registrationIpAddress && referrerIp && registrationIpAddress === referrerIp

  if (isSameIp) {
    await prisma.referralRecord.update({
      where: { code: trimmedCode },
      data: {
        refereeId: userId,
        status: ReferralStatus.FLAGGED,
        flagged: true,
        flagReason: 'Same IP address as referrer',
      },
    })
    return
  }

  await completeReferral({
    referralCode: trimmedCode,
    refereeId: userId,
  })
}
