'use client'

import { useState } from 'react'
import { Loader2, Check, Download, FileText } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import { mockAuditConfig } from './mock-data'
import type { AuditConfig } from './types'

interface AuditTrailSectionProps {
  id: string
}

export function AuditTrailSection({ id }: AuditTrailSectionProps) {
  const [config, setConfig] = useState<AuditConfig>(mockAuditConfig)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateConfig = <K extends keyof AuditConfig>(key: K, value: AuditConfig[K]) => {
    setConfig({ ...config, [key]: value })
    setHasChanges(true)
  }

  const updateEvent = (eventKey: keyof AuditConfig['events'], value: boolean) => {
    setConfig({
      ...config,
      events: { ...config.events, [eventKey]: value },
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setShowSuccess(true)
    setHasChanges(false)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  const selectAllEvents = () => {
    setConfig({
      ...config,
      events: Object.keys(config.events).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as AuditConfig['events']
      ),
    })
    setHasChanges(true)
  }

  const selectNoneEvents = () => {
    setConfig({
      ...config,
      events: Object.keys(config.events).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {} as AuditConfig['events']
      ),
    })
    setHasChanges(true)
  }

  // Mock storage info
  const storageUsed = 2.4
  const storageLimit = 10
  const storagePercent = (storageUsed / storageLimit) * 100

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">Audit Trail</h2>
        <p className="text-sm text-muted-foreground">Configure audit logging and retention</p>
      </div>

      {/* Retention Period */}
      <div className="space-y-4">
        <h3 className="font-medium">Retention Period</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm">Keep audit logs for</span>
          <Input
            type="number"
            value={config.retentionYears}
            onChange={(e) => updateConfig('retentionYears', parseInt(e.target.value) || 1)}
            className="w-20"
            min={1}
            max={10}
          />
          <span className="text-sm">years</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Logs older than this will be automatically archived
        </p>

        {/* Storage Indicator */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Storage Used</span>
            <span>{storageUsed} GB of {storageLimit} GB</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{storagePercent.toFixed(0)}% used</p>
        </div>
      </div>

      {/* Event Categories */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Events to Audit</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={selectAllEvents}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={selectNoneEvents}>
              Select None
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
            <Checkbox
              checked={config.events.financial}
              onCheckedChange={(checked) => updateEvent('financial', checked as boolean)}
              className="mt-0.5"
            />
            <div>
              <span className="font-medium">Financial Transactions</span>
              <p className="text-xs text-muted-foreground">Invoice creation, payments, refunds, adjustments</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
            <Checkbox
              checked={config.events.memberChanges}
              onCheckedChange={(checked) => updateEvent('memberChanges', checked as boolean)}
              className="mt-0.5"
            />
            <div>
              <span className="font-medium">Member Changes</span>
              <p className="text-xs text-muted-foreground">Status changes, profile updates, membership changes</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
            <Checkbox
              checked={config.events.userActivity}
              onCheckedChange={(checked) => updateEvent('userActivity', checked as boolean)}
              className="mt-0.5"
            />
            <div>
              <span className="font-medium">User Activity</span>
              <p className="text-xs text-muted-foreground">Logins, logouts, password changes, role changes</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
            <Checkbox
              checked={config.events.settingsChanges}
              onCheckedChange={(checked) => updateEvent('settingsChanges', checked as boolean)}
              className="mt-0.5"
            />
            <div>
              <span className="font-medium">Settings Changes</span>
              <p className="text-xs text-muted-foreground">Any modifications to system settings</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
            <Checkbox
              checked={config.events.documentAccess}
              onCheckedChange={(checked) => updateEvent('documentAccess', checked as boolean)}
              className="mt-0.5"
            />
            <div>
              <span className="font-medium">Document Access</span>
              <p className="text-xs text-muted-foreground">View/download of invoices, receipts, contracts</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
            <Checkbox
              checked={config.events.apiAccess}
              onCheckedChange={(checked) => updateEvent('apiAccess', checked as boolean)}
              className="mt-0.5"
            />
            <div>
              <span className="font-medium">API Access</span>
              <p className="text-xs text-muted-foreground">External API calls and webhooks</p>
            </div>
          </label>
        </div>
      </div>

      {/* Export */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Export</h3>
        <div className="flex items-center gap-4">
          <div>
            <Label>Export Format</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={config.exportFormat === 'csv'}
                  onChange={() => updateConfig('exportFormat', 'csv')}
                  className="h-4 w-4"
                />
                <span className="text-sm">CSV</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={config.exportFormat === 'json'}
                  onChange={() => updateConfig('exportFormat', 'json')}
                  className="h-4 w-4"
                />
                <span className="text-sm">JSON</span>
              </label>
            </div>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Audit Log
          </Button>
        </div>
      </div>

      {/* Compliance Reports */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Compliance Reports</h3>
        <p className="text-sm text-muted-foreground">Pre-configured reports for common compliance needs</p>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate SOX Report
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate PDPA Report
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : showSuccess ? <Check className="h-4 w-4 mr-2" /> : null}
          {showSuccess ? 'Saved' : 'Save Section'}
        </Button>
      </div>
    </section>
  )
}
