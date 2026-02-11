'use client'

import { useState, useCallback } from 'react'
import { Loader2, Copy, Check, Link2, Trash2, Shield } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@clubvantage/ui'

export interface ShareableLink {
  id: string
  token: string
  url: string
  entityType: string
  expiresAt?: Date | string
  maxViews?: number
  viewCount: number
  isActive: boolean
  hasPassword: boolean
  createdAt: Date | string
}

export interface ShareLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: 'INVOICE' | 'RECEIPT' | 'STATEMENT'
  entityId: string
  entityLabel: string
  existingLinks?: ShareableLink[]
  isLoadingLinks?: boolean
  onCreateLink: (data: {
    entityType: string
    entityId: string
    expiresInDays?: number
    maxViews?: number
    password?: string
  }) => Promise<ShareableLink>
  onRevokeLink: (linkId: string) => Promise<void>
  isCreating?: boolean
  isRevoking?: boolean
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ShareLinkDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityLabel,
  existingLinks = [],
  isLoadingLinks = false,
  onCreateLink,
  onRevokeLink,
  isCreating = false,
  isRevoking = false,
}: ShareLinkDialogProps) {
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(30)
  const [maxViews, setMaxViews] = useState<number | undefined>(undefined)
  const [password, setPassword] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newLink, setNewLink] = useState<ShareableLink | null>(null)

  const handleCreate = useCallback(async () => {
    const link = await onCreateLink({
      entityType,
      entityId,
      expiresInDays,
      maxViews,
      password: password || undefined,
    })
    setNewLink(link)
  }, [entityType, entityId, expiresInDays, maxViews, password, onCreateLink])

  const handleCopy = useCallback(async (url: string, id: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const activeLinks = existingLinks.filter((l) => l.isActive)
  const allLinks = newLink && !activeLinks.find((l) => l.id === newLink.id)
    ? [newLink, ...activeLinks]
    : activeLinks

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share {entityLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing links */}
          {isLoadingLinks ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading links...
            </div>
          ) : allLinks.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Active Links</Label>
              {allLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-2 p-2.5 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate">{link.url}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{link.viewCount} views</span>
                      {link.expiresAt && (
                        <span>Expires {formatDate(link.expiresAt)}</span>
                      )}
                      {link.hasPassword && (
                        <span className="flex items-center gap-0.5">
                          <Shield className="h-3 w-3" />
                          Protected
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(link.url, link.id)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    {copiedId === link.id ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRevokeLink(link.id)}
                    disabled={isRevoking}
                    className="h-8 w-8 p-0 shrink-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          {/* Create new link */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-medium">Create New Link</Label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expires-days" className="text-xs">
                  Expires in (days)
                </Label>
                <Input
                  id="expires-days"
                  type="number"
                  min={1}
                  max={365}
                  placeholder="30"
                  value={expiresInDays ?? ''}
                  onChange={(e) =>
                    setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-views" className="text-xs">
                  Max views (optional)
                </Label>
                <Input
                  id="max-views"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={maxViews ?? ''}
                  onChange={(e) =>
                    setMaxViews(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link-password" className="text-xs">
                Password (optional)
              </Label>
              <Input
                id="link-password"
                type="password"
                placeholder="Leave empty for no password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Link2 className="mr-2 h-4 w-4" />
              Generate Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
