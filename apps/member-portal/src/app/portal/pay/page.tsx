import type { Metadata } from 'next'
import { getAccountBalance } from '@/lib/data'
import { PaymentForm } from './payment-form'

export const metadata: Metadata = {
  title: 'Make Payment | Member Portal',
}

export default async function PaymentPage() {
  const balance = await getAccountBalance()

  return (
    <div className="px-5 py-6 pb-36">
      <PaymentForm
        outstandingBalance={balance.balance}
        defaultAmount={balance.balance}
      />
    </div>
  )
}
