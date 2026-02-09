'use client'

import { cn } from '@clubvantage/ui'
import { Printer, Download, Check, QrCode, Users, Car, User, Package } from 'lucide-react'
import type { StarterTicketResponseType } from '@clubvantage/api-client'

export interface StarterTicketPreviewProps {
  ticket: StarterTicketResponseType
  onPrint?: () => void
  onDownload?: () => void
  isPrinting?: boolean
  className?: string
}

const playerTypeLabels: Record<string, string> = {
  MEMBER: 'M',
  GUEST: 'G',
  DEPENDENT: 'D',
  WALK_UP: 'W',
}

export function StarterTicketPreview({
  ticket,
  onPrint,
  onDownload,
  isPrinting,
  className,
}: StarterTicketPreviewProps) {
  const formattedTime = new Date(ticket.teeTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const formattedDate = new Date(ticket.teeTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className={cn('space-y-4', className)}>
      {/* Ticket Preview */}
      <div className="border-2 border-dashed border-muted rounded-lg p-6 bg-white dark:bg-card">
        {/* Header */}
        <div className="text-center pb-4 border-b border-dashed border-muted">
          <div className="text-2xl font-bold">{formattedTime}</div>
          <div className="text-sm text-muted-foreground">{formattedDate}</div>
          <div className="text-lg font-semibold mt-2">{ticket.course}</div>
          <div className="text-sm text-muted-foreground">
            Starting Hole: {ticket.startingHole}
          </div>
        </div>

        {/* Ticket Number */}
        <div className="py-3 text-center border-b border-dashed border-muted">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Ticket #
          </div>
          <div className="text-xl font-mono font-bold">{ticket.ticketNumber}</div>
        </div>

        {/* Players */}
        <div className="py-4 border-b border-dashed border-muted">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Players</span>
          </div>
          <div className="space-y-2">
            {ticket.players.map((player, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {player.memberNumber && (
                    <span className="text-xs text-muted-foreground">
                      #{player.memberNumber}
                    </span>
                  )}
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded font-medium',
                      player.type === 'MEMBER' && 'bg-blue-100 text-blue-700',
                      player.type === 'GUEST' && 'bg-amber-100 text-amber-700',
                      player.type === 'DEPENDENT' && 'bg-teal-100 text-teal-700',
                      player.type === 'WALK_UP' && 'bg-stone-100 text-stone-700'
                    )}
                  >
                    {playerTypeLabels[player.type]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart & Caddy */}
        {(ticket.cartNumber || ticket.caddyName) && (
          <div className="py-4 border-b border-dashed border-muted grid grid-cols-2 gap-4">
            {ticket.cartNumber && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Cart</span>
                </div>
                <div className="font-medium">#{ticket.cartNumber}</div>
              </div>
            )}
            {ticket.caddyName && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Caddy</span>
                </div>
                <div className="font-medium">{ticket.caddyName}</div>
              </div>
            )}
          </div>
        )}

        {/* Rental Items */}
        {ticket.rentalItems.length > 0 && (
          <div className="py-4 border-b border-dashed border-muted">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Rentals</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {ticket.rentalItems.map((item, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-muted rounded text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Special Requests */}
        {ticket.specialRequests && (
          <div className="py-4 border-b border-dashed border-muted">
            <div className="text-xs text-muted-foreground mb-1">
              Special Requests
            </div>
            <div className="text-sm">{ticket.specialRequests}</div>
          </div>
        )}

        {/* QR Code Placeholder */}
        {ticket.qrCodeData && (
          <div className="pt-4 flex flex-col items-center">
            <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Scan for digital ticket
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 text-center text-xs text-muted-foreground">
          <div>Generated: {new Date(ticket.generatedAt).toLocaleString()}</div>
          {ticket.printedAt && (
            <div className="flex items-center justify-center gap-1 mt-1 text-emerald-600">
              <Check className="h-3 w-3" />
              Printed {ticket.reprintCount > 0 && `(${ticket.reprintCount + 1}x)`}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onPrint && (
          <button
            onClick={onPrint}
            disabled={isPrinting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? 'Printing...' : ticket.printedAt ? 'Reprint' : 'Print'}
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        )}
      </div>
    </div>
  )
}

// Compact ticket status for check-in completion
export interface TicketStatusProps {
  ticketNumber?: string | null
  onViewTicket?: () => void
  onPrintTicket?: () => void
  className?: string
}

export function TicketStatus({
  ticketNumber,
  onViewTicket,
  onPrintTicket,
  className,
}: TicketStatusProps) {
  if (!ticketNumber) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <div>
          <div className="text-sm font-medium">Ticket Generated</div>
          <div className="text-xs text-muted-foreground">#{ticketNumber}</div>
        </div>
      </div>
      <div className="flex gap-2">
        {onViewTicket && (
          <button
            onClick={onViewTicket}
            className="text-sm text-primary hover:underline"
          >
            View
          </button>
        )}
        {onPrintTicket && (
          <button
            onClick={onPrintTicket}
            className="text-sm text-primary hover:underline"
          >
            Print
          </button>
        )}
      </div>
    </div>
  )
}
