import type { Metadata } from 'next'
import { AuraChatContent } from './aura-chat-content'

export const metadata: Metadata = {
  title: 'Aura Concierge | Member Portal',
}

export default function AuraPage() {
  return <AuraChatContent />
}
