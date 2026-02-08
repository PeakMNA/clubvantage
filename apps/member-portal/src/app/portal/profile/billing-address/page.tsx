import type { Metadata } from 'next'
import { getBillingAddress } from './actions'
import { BillingAddressForm } from './billing-address-form'

export const metadata: Metadata = {
  title: 'Billing Address | Member Portal',
}

export default async function BillingAddressPage() {
  const address = await getBillingAddress()
  return <BillingAddressForm address={address} />
}
