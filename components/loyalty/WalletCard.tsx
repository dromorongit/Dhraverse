'use client'

import { Card, CardContent, CardHeader } from '@/components/Card'

interface WalletCardProps {
  balance: number
}

export function WalletCard({ balance }: WalletCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-deep-navy">Wallet Balance</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-3xl font-bold text-purple-600">{balance.toFixed(2)}</span>
            <p className="text-xs text-gray-500 mt-1">Available Balance (GHS)</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-600">Spendable at checkout</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
