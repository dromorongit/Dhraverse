'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input } from '@/components/Input'
import { LoyaltyTierCard } from '@/components/loyalty/LoyaltyTierCard'
import { PointsCard } from '@/components/loyalty/PointsCard'
import { CashbackCard } from '@/components/loyalty/CashbackCard'
import { WalletCard } from '@/components/loyalty/WalletCard'
import { AchievementBadge } from '@/components/loyalty/AchievementBadge'
import { ReferralStatsCard } from '@/components/loyalty/ReferralStatsCard'

interface LoyaltyDashboardData {
  pointsBalance: { userId: string; balance: number; totalEarned: number; totalRedeemed: number }
  cashbackBalance: { userId: string; balance: number; totalEarned: number; totalRedeemed: number }
  walletBalance: number
  tier: { id: string; name: string; slug: string; color: string; minPoints: number; maxPoints: number | null; multiplier: number; cashbackRate: number; description: string | null } | null
  achievements: Array<{
    achievement: { id: string; name: string; slug: string; description: string | null; badge: string | null; color: string | null; icon: string | null; criteria: any; points: number; cashbackReward: number; isActive: boolean }
    unlocked: boolean
    unlockedAt: string | null
    progress: number
    maxProgress: number
  }>
  referralStats: { userId: string; totalReferrals: number; successfulReferrals: number; pendingReferrals: number; totalRewardPoints: number; totalRewardCashback: number }
  referralCode?: string | null
  recentTransactions: Array<{
    id: string
    type: string
    category: string
    amount: number
    balanceAfter: number
    description: string | null
    createdAt: string
  }>
  guards: {
    lastDailyLoginRewardAt: string | null
    profileCompletionRewarded: boolean
    followVendorRewardClaimed: boolean
    lastWishlistRewardAt: string | null
  } | null
}

export default function LoyaltyDashboardPage() {
  const [data, setData] = useState<LoyaltyDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const [pointsRedeemAmount, setPointsRedeemAmount] = useState('')
  const [cashbackRedeemAmount, setCashbackRedeemAmount] = useState('')
  const [pointsError, setPointsError] = useState<string | null>(null)
  const [cashbackError, setCashbackError] = useState<string | null>(null)
  const [pointsSuccess, setPointsSuccess] = useState<string | null>(null)
  const [cashbackSuccess, setCashbackSuccess] = useState<string | null>(null)
  const [redeemingPoints, setRedeemingPoints] = useState(false)
  const [redeemingCashback, setRedeemingCashback] = useState(false)

  useEffect(() => {
    fetchLoyaltyData()
  }, [])

  const fetchLoyaltyData = async () => {
    try {
      const res = await fetch('/api/loyalty')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEarnPoints = async (type: string) => {
    try {
      const res = await fetch(`/api/loyalty/earn/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        fetchLoyaltyData()
      }
    } catch (error) {
      console.error('Error earning points:', error)
    }
  }

  const handlePointsRedeem = async () => {
    if (!data) return
    setPointsError(null)
    setPointsSuccess(null)
    setRedeemingPoints(true)

    try {
      const amount = parseInt(pointsRedeemAmount, 10)
      if (isNaN(amount) || amount <= 0) {
        setPointsError('Please enter a valid number of points')
        setRedeemingPoints(false)
        return
      }

      const res = await fetch('/api/loyalty/redeem/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const result = await res.json()
      if (!res.ok) {
        setPointsError(result.error || 'Redemption failed')
      } else {
        setPointsSuccess(`Successfully redeemed ${amount} points for GH₵${result.cedisReceived.toFixed(2)}`)
        setPointsRedeemAmount('')
        fetchLoyaltyData()
      }
    } catch (error) {
      setPointsError('An error occurred. Please try again.')
    } finally {
      setRedeemingPoints(false)
    }
  }

  const handleCashbackRedeem = async () => {
    if (!data) return
    setCashbackError(null)
    setCashbackSuccess(null)
    setRedeemingCashback(true)

    try {
      const amount = parseFloat(cashbackRedeemAmount)
      if (isNaN(amount) || amount <= 0) {
        setCashbackError('Please enter a valid amount')
        setRedeemingCashback(false)
        return
      }

      const res = await fetch('/api/loyalty/redeem/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const result = await res.json()
      if (!res.ok) {
        setCashbackError(result.error || 'Redemption failed')
      } else {
        setCashbackSuccess(`Successfully redeemed GH₵${amount.toFixed(2)} cashback to wallet`)
        setCashbackRedeemAmount('')
        fetchLoyaltyData()
      }
    } catch (error) {
      setCashbackError('An error occurred. Please try again.')
    } finally {
      setRedeemingCashback(false)
    }
  }

  const maxPointsRedeem = data ? Math.floor(data.pointsBalance.balance / 1000) * 1000 : 0
  const pointsCedisEquivalent = data && pointsRedeemAmount ? Math.round((parseInt(pointsRedeemAmount, 10) / 100) * 100) / 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Failed to load loyalty data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-deep-navy">Loyalty & Rewards</h1>
          <Link href="/dashboard/customer">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'achievements', label: 'Achievements' },
            { key: 'referrals', label: 'Referrals' },
            { key: 'history', label: 'History' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-royal-blue text-royal-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PointsCard
                balance={data.pointsBalance.balance}
                totalEarned={data.pointsBalance.totalEarned}
                totalRedeemed={data.pointsBalance.totalRedeemed}
              />
              <CashbackCard
                balance={data.cashbackBalance.balance}
                totalEarned={data.cashbackBalance.totalEarned}
                totalRedeemed={data.cashbackBalance.totalRedeemed}
              />
              <WalletCard
                balance={data.walletBalance}
              />
              <LoyaltyTierCard
                tier={data.tier}
                points={data.pointsBalance.balance}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReferralStatsCard
                totalReferrals={data.referralStats.totalReferrals}
                successfulReferrals={data.referralStats.successfulReferrals}
                pendingReferrals={data.referralStats.pendingReferrals}
                totalRewardPoints={data.referralStats.totalRewardPoints}
                totalRewardCashback={data.referralStats.totalRewardCashback}
                referralCode={data.referralCode || 'REF-YOUR-CODE'}
              />

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-deep-navy">Redeem to Wallet</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Redeem Points</h4>
                      <p className="text-xs text-gray-500 mb-2">Minimum 1,000 points = GH₵10.00 (100 points = GH₵1.00)</p>
                      {data.pointsBalance.balance < 1000 && (
                        <p className="text-xs text-gray-400 mb-2">You need at least 1,000 points to redeem</p>
                      )}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Points (min 1,000)"
                          value={pointsRedeemAmount}
                          onChange={(e) => setPointsRedeemAmount(e.target.value)}
                          disabled={data.pointsBalance.balance < 1000 || redeemingPoints}
                          min={1000}
                          max={data.pointsBalance.balance}
                          step={1000}
                          className="flex-1"
                        />
                        <Button
                          onClick={handlePointsRedeem}
                          disabled={data.pointsBalance.balance < 1000 || !pointsRedeemAmount || redeemingPoints}
                          className="whitespace-nowrap"
                        >
                          {redeemingPoints ? 'Redeeming...' : 'Redeem'}
                        </Button>
                      </div>
                      {pointsRedeemAmount && parseInt(pointsRedeemAmount, 10) >= 1000 && (
                        <p className="text-xs text-purple-600 mt-1">
                          You will receive: GH₵{pointsCedisEquivalent.toFixed(2)}
                        </p>
                      )}
                      {pointsError && (
                        <p className="text-sm text-rose-600 mt-1">{pointsError}</p>
                      )}
                      {pointsSuccess && (
                        <p className="text-sm text-green-600 mt-1">{pointsSuccess}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Redeem Cashback</h4>
                      <p className="text-xs text-gray-500 mb-2">Minimum GH₵10.00 cashback</p>
                      {data.cashbackBalance.balance < 10 && (
                        <p className="text-xs text-gray-400 mb-2">You need at least GH₵10.00 cashback to redeem</p>
                      )}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Amount (min 10.00)"
                          value={cashbackRedeemAmount}
                          onChange={(e) => setCashbackRedeemAmount(e.target.value)}
                          disabled={data.cashbackBalance.balance < 10 || redeemingCashback}
                          min={10}
                          max={data.cashbackBalance.balance}
                          step={0.01}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleCashbackRedeem}
                          disabled={data.cashbackBalance.balance < 10 || !cashbackRedeemAmount || redeemingCashback}
                          className="whitespace-nowrap"
                        >
                          {redeemingCashback ? 'Redeeming...' : 'Redeem'}
                        </Button>
                      </div>
                      {cashbackError && (
                        <p className="text-sm text-rose-600 mt-1">{cashbackError}</p>
                      )}
                      {cashbackSuccess && (
                        <p className="text-sm text-green-600 mt-1">{cashbackSuccess}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReferralStatsCard
                totalReferrals={data.referralStats.totalReferrals}
                successfulReferrals={data.referralStats.successfulReferrals}
                pendingReferrals={data.referralStats.pendingReferrals}
                totalRewardPoints={data.referralStats.totalRewardPoints}
                totalRewardCashback={data.referralStats.totalRewardCashback}
                referralCode={data.referralCode || 'REF-YOUR-CODE'}
              />

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-deep-navy">Quick Actions</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span>Daily Login (+2 pts)</span>
                      <span className={data.guards?.lastDailyLoginRewardAt ? 'text-green-600' : 'text-gray-500'}>
                        {data.guards?.lastDailyLoginRewardAt ? 'Claimed today ✓' : 'Come back tomorrow for +2'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span>Complete Profile (+20 pts)</span>
                      <span className={data.guards?.profileCompletionRewarded ? 'text-green-600' : 'text-gray-500'}>
                        {data.guards?.profileCompletionRewarded ? 'Completed ✓ +20 earned' : 'Complete profile to earn +20'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span>Follow Vendor (+5 pts)</span>
                      <span className="text-gray-500">
                        {data.guards?.followVendorRewardClaimed ? 'Reward claimed ✓' : 'Follow 5 vendors to earn +5'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span>Wishlist Activity (+1 pt)</span>
                      <span className={data.guards?.lastWishlistRewardAt ? 'text-green-600' : 'text-gray-500'}>
                        {data.guards?.lastWishlistRewardAt ? 'Today\'s activity rewarded ✓' : 'Add an item to wishlist to earn +1'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span>Create Collection (+10 pts)</span>
                      <span className="text-green-600">
                        Auto-awarded on creation
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-deep-navy">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.achievements.map((item) => (
                <AchievementBadge
                  key={item.achievement.id}
                  name={item.achievement.name}
                  badge={item.achievement.badge}
                  color={item.achievement.color}
                  icon={item.achievement.icon}
                  unlocked={item.unlocked}
                  unlockedAt={item.unlockedAt}
                  progress={item.progress}
                  maxProgress={item.maxProgress}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-deep-navy">Referral Program</h2>
              <ReferralStatsCard
                totalReferrals={data.referralStats.totalReferrals}
                successfulReferrals={data.referralStats.successfulReferrals}
                pendingReferrals={data.referralStats.pendingReferrals}
                totalRewardPoints={data.referralStats.totalRewardPoints}
                totalRewardCashback={data.referralStats.totalRewardCashback}
                referralCode={data.referralCode || 'REF-YOUR-CODE'}
              />
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-deep-navy">How It Works</h3>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Share your unique referral code with friends</li>
                  <li>When a friend signs up using your code, they get a welcome bonus</li>
                  <li>When your friend makes their first purchase, you earn reward points</li>
                  <li>Earn more rewards as your referral count grows</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-deep-navy">Reward History</h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">Balance</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                tx.amount > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{tx.description}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {tx.amount > 0 ? '+' : ''}
                            {tx.amount}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{tx.balanceAfter}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {data.recentTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No transactions yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
