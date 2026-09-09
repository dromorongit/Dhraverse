'use client'

import { Card, CardContent, CardHeader } from '@/components/Card'
import { useState } from 'react'

interface ReferralStatsCardProps {
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  totalRewardPoints: number
  totalRewardCashback: number
  referralCode: string
}

export function ReferralStatsCard({
  totalReferrals,
  successfulReferrals,
  pendingReferrals,
  totalRewardPoints,
  totalRewardCashback,
  referralCode,
}: ReferralStatsCardProps) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    if (!referralCode) return
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-deep-navy">Referral Program</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 mb-1">Your Referral Code</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-mono font-bold text-blue-800">{referralCode}</p>
              <button
                type="button"
                onClick={copyCode}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="font-semibold text-deep-navy">{totalReferrals}</p>
              <p className="text-xs text-gray-500">Total Referrals</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="font-semibold text-green-700">{successfulReferrals}</p>
              <p className="text-xs text-green-600">Successful</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="font-semibold text-deep-navy">{totalRewardPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Points Earned</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="font-semibold text-deep-navy">{totalRewardCashback.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Cashback Earned (GHS)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}