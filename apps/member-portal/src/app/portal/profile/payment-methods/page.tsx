import type { Metadata } from 'next'
import { PaymentMethodsContent } from './payment-methods-content'

export const metadata: Metadata = {
  title: 'Payment Methods | Member Portal',
}

export default function PaymentMethodsPage() {
  return <PaymentMethodsContent />
}
