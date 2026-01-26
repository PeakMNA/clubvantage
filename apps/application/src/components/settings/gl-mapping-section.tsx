'use client'

import { useState } from 'react'
import { Loader2, Check, AlertCircle, RefreshCw, Download } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'
import { mockGLMappings, mockIntegrations } from './mock-data'
import type { GLMapping } from './types'

interface GLMappingSectionProps {
  id: string
}

const glAccounts = [
  { code: '4100', name: 'Membership Revenue' },
  { code: '4200', name: 'F&B Revenue' },
  { code: '4300', name: 'Golf Revenue' },
  { code: '4400', name: 'Other Revenue' },
  { code: '1200', name: 'Accounts Receivable' },
  { code: '1000', name: 'Operating Account' },
  { code: '1250', name: 'WHT Receivable' },
]

export function GLMappingSection({ id }: GLMappingSectionProps) {
  const [mappings, setMappings] = useState(mockGLMappings)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const accountingIntegration = mockIntegrations.find((i) => i.type === 'accounting')

  const updateMapping = (mappingId: string, targetCode: string) => {
    const effectiveCode = targetCode === '__none__' ? '' : targetCode
    const account = glAccounts.find((a) => a.code === effectiveCode)
    setMappings(mappings.map((m) =>
      m.id === mappingId
        ? { ...m, targetCode: effectiveCode, targetName: account?.name, status: effectiveCode ? 'mapped' : 'unmapped' }
        : m
    ))
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

  const handleSync = async () => {
    setIsSyncing(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsSyncing(false)
  }

  const mappedCount = mappings.filter((m) => m.status === 'mapped').length
  const unmappedCount = mappings.filter((m) => m.status === 'unmapped').length

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">GL Mapping</h2>
        <p className="text-sm text-muted-foreground">Map internal codes to accounting system</p>
      </div>

      {/* Accounting System Status */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium">Accounting System: {accountingIntegration?.provider || 'Not connected'}</p>
            {accountingIntegration?.connected ? (
              <p className="text-sm text-emerald-600 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Connected
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{mappedCount} mapped</Badge>
          {unmappedCount > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
              {unmappedCount} unmapped
            </Badge>
          )}
        </div>
      </div>

      {!accountingIntegration?.connected ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Connect an accounting system to configure GL mappings</p>
          <Button variant="outline">Go to Integrations</Button>
        </div>
      ) : (
        <>
          {/* Mapping Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Source (Internal)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Target (GL Account)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping) => (
                  <tr key={mapping.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">{mapping.sourceName}</span>
                        <span className="text-xs text-muted-foreground ml-2 font-mono">
                          ({mapping.sourceCode})
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">{mapping.sourceType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={mapping.targetCode || '__none__'}
                        onValueChange={(v) => updateMapping(mapping.id, v)}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select GL Account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">-- Select --</SelectItem>
                          {glAccounts.map((account) => (
                            <SelectItem key={account.code} value={account.code}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      {mapping.status === 'mapped' && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Check className="h-4 w-4" />
                          Mapped
                        </span>
                      )}
                      {mapping.status === 'unmapped' && (
                        <span className="text-muted-foreground">Unmapped</span>
                      )}
                      {mapping.status === 'review' && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Auto-Map Common</Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : showSuccess ? <Check className="h-4 w-4 mr-2" /> : null}
                {showSuccess ? 'Saved' : 'Save Mappings'}
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
