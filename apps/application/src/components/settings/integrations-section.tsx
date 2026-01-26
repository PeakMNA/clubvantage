'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Plug, CreditCard, Calculator, Mail, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'
import { mockIntegrations } from './mock-data'
import type { Integration } from './types'

interface IntegrationsSectionProps {
  id: string
}

const integrationConfig = {
  payment: { icon: CreditCard, title: 'Payment Gateway', providers: ['Stripe', 'Adyen'] },
  accounting: { icon: Calculator, title: 'Accounting', providers: ['Xero', 'SAP', 'Oracle'] },
  email: { icon: Mail, title: 'Email Provider', providers: ['SendGrid', 'Mailgun', 'Amazon SES'] },
  sms: { icon: MessageSquare, title: 'SMS Provider', providers: ['Twilio'] },
}

export function IntegrationsSection({ id }: IntegrationsSectionProps) {
  const [integrations, setIntegrations] = useState(mockIntegrations)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<Integration['type'] | null>(null)

  const handleConfigure = (type: Integration['type']) => {
    setEditingType(type)
    setIsModalOpen(true)
  }

  const handleConnect = (type: Integration['type']) => {
    setIntegrations(integrations.map((i) =>
      i.type === type ? { ...i, connected: true, lastActivity: new Date() } : i
    ))
  }

  const handleDisconnect = (type: Integration['type']) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      setIntegrations(integrations.map((i) =>
        i.type === type ? { ...i, connected: false } : i
      ))
    }
  }

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">Connect external services</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => {
          const config = integrationConfig[integration.type]
          const Icon = config.icon

          return (
            <div
              key={integration.type}
              className={cn(
                'border rounded-lg p-4',
                integration.connected ? 'bg-card' : 'bg-muted/30'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{integration.provider || config.title}</h3>
                    <p className="text-sm text-muted-foreground">{config.title}</p>
                  </div>
                </div>
                <Badge
                  variant={integration.connected ? 'default' : 'secondary'}
                  className={integration.connected ? 'bg-emerald-500' : ''}
                >
                  <span className={cn(
                    'h-2 w-2 rounded-full mr-1.5',
                    integration.connected ? 'bg-emerald-300' : 'bg-stone-400'
                  )} />
                  {integration.connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>

              {integration.connected && integration.lastActivity && (
                <p className="text-xs text-muted-foreground mb-3">
                  Last activity: {formatDistanceToNow(integration.lastActivity, { addSuffix: true })}
                </p>
              )}

              <div className="flex items-center gap-2 pt-3 border-t">
                {integration.connected ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleConfigure(integration.type)}>
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      Test
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-red-600"
                      onClick={() => handleDisconnect(integration.type)}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleConnect(integration.type)}
                    className="bg-gradient-to-br from-amber-500 to-amber-600"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Configure {editingType && integrationConfig[editingType].title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>API Key</Label>
              <Input type="password" placeholder="sk_live_..." />
            </div>
            {editingType === 'payment' && (
              <div>
                <Label>Publishable Key</Label>
                <Input placeholder="pk_live_..." />
              </div>
            )}
            {editingType === 'email' && (
              <>
                <div>
                  <Label>From Email</Label>
                  <Input placeholder="noreply@yourclub.com" />
                </div>
                <div>
                  <Label>From Name</Label>
                  <Input placeholder="Your Club Name" />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-to-br from-amber-500 to-amber-600">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
